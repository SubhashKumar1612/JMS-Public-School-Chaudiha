const User = require("../models/User");
const ExcelJS = require("exceljs");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const ClassRoom = require("../models/ClassRoom");
const Admission = require("../models/Admission");
const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const StudyMaterial = require("../models/StudyMaterial");
const FeeRecord = require("../models/FeeRecord");
const FeeStructure = require("../models/FeeStructure");
const FeePayment = require("../models/FeePayment");
const Notification = require("../models/Notification");
const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../middleware/asyncHandler");
const {
  buildClassLabel,
  createStructureSnapshot,
  getStudentCurrentFeePlan,
  getStudentFeeSummary,
  initializeStudentFeePlan,
  normalizeSnapshot,
  reviseStudentFeePlan,
  syncStudentFeeStatus,
  toMoney,
} = require("../utils/feeManagement");

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const generateCode = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

const generatePortalPassword = () => `JMS@${Math.random().toString(36).slice(-4)}${Date.now().toString().slice(-4)}`;
const sanitizeFileName = (value = "") => value.replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "") || "All_Classes";
const generateReceiptNumber = () => `RCPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 9000 + 1000)}`;

const generateUniqueReceiptNumber = async () => {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = generateReceiptNumber();
    const existingPayment = await FeePayment.findOne({ receiptNumber: candidate }).select("_id");
    if (!existingPayment) return candidate;
  }

  throw createHttpError("Could not generate a unique receipt number. Please try again.", 500);
};

const generateUniquePortalEmail = async (name = "student") => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 24) || "student";

  let attempt = 0;
  while (attempt < 50) {
    const suffix = attempt === 0 ? Date.now().toString().slice(-4) : `${Date.now().toString().slice(-4)}${attempt}`;
    const email = `${base}.${suffix}@students.jmsschool.local`;
    const existingUser = await User.findOne({ email });
    if (!existingUser) return email;
    attempt += 1;
  }

  return `${generateCode("student").toLowerCase()}@students.jmsschool.local`;
};

const parseSubjects = (subjects = []) => {
  if (Array.isArray(subjects)) {
    return subjects
      .map((subject) => {
        if (typeof subject === "string") {
          return { name: subject.trim(), code: "" };
        }
        return {
          name: subject?.name?.trim() || "",
          code: subject?.code?.trim() || "",
        };
      })
      .filter((subject) => subject.name);
  }

  if (typeof subjects === "string") {
    return subjects
      .split(",")
      .map((subject) => ({ name: subject.trim(), code: "" }))
      .filter((subject) => subject.name);
  }

  return [];
};

const syncUserDetails = async (userId, { name, email, phone, password, status }) => {
  const user = await User.findById(userId);
  if (!user) throw createHttpError("Linked user record not found.", 404);

  if (email && normalizeEmail(email) !== user.email) {
    const existingUser = await User.findOne({ email: normalizeEmail(email), _id: { $ne: userId } });
    if (existingUser) throw createHttpError("A user with this email already exists.", 409);
    user.email = normalizeEmail(email);
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (status !== undefined) user.status = status;
  if (password) user.password = password;

  await user.save();
  return user;
};

const createUserWithRole = async ({ name, email, password, role, phone = "" }) => {
  if (!name || !email || !password) {
    throw createHttpError("Name, email, and password are required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw createHttpError("A user with this email already exists.", 409);
  }

  return User.create({ name, email: normalizedEmail, password, role, phone });
};

const getAdminSummary = async (_req, res) => {
  const [students, teachers, parents, admissions, assignments, dues, messages] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Parent.countDocuments(),
    Admission.countDocuments(),
    Assignment.countDocuments(),
    Student.countDocuments({ feeStatus: { $ne: "paid" } }),
    ContactMessage.countDocuments(),
  ]);

  res.json({ students, teachers, parents, admissions, assignments, dues, messages });
};

const listStudents = async (_req, res) => {
  const students = await Student.find()
    .populate("user", "name email phone")
    .populate("classRoom", "name section academicYear")
    .populate("assignedFeeStructure")
    .populate({ path: "parent", populate: { path: "user", select: "name email phone" } });

  const studentsWithFees = await Promise.all(
    students.map(async (student) => ({
      ...student.toObject(),
      feeSummary: await getStudentFeeSummary(student),
    }))
  );

  res.json(studentsWithFees);
};

const createStudent = async (req, res) => {
  const { name, email, password, phone, admissionNumber, rollNumber, classRoomId, gender, parentId } = req.body;
  let user;

  if (classRoomId) {
    const classRoom = await ClassRoom.findById(classRoomId);
    if (!classRoom) throw createHttpError("Selected class was not found.");
  }

  if (parentId) {
    const parent = await Parent.findById(parentId);
    if (!parent) throw createHttpError("Selected parent was not found.");
  }

  try {
    user = await createUserWithRole({ name, email, password, role: "student", phone });
    const student = await Student.create({
      user: user._id,
      admissionNumber: admissionNumber?.trim() || generateCode("ADM"),
      rollNumber: rollNumber?.trim() || generateCode("ROLL"),
      classRoom: classRoomId || null,
      parent: parentId || null,
      gender: gender || "other",
      academicYear: "2026-27",
    });

    if (parentId) {
      await Parent.findByIdAndUpdate(parentId, { $addToSet: { children: student._id } });
    }

    res.status(201).json(
      await student.populate([
        { path: "user", select: "name email phone" },
        { path: "classRoom", select: "name section academicYear" },
        { path: "assignedFeeStructure" },
        { path: "parent", populate: { path: "user", select: "name email phone" } },
      ])
    );
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id);
    }
    throw error;
  }
};

const updateStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw createHttpError("Student not found.", 404);

  const { classRoomId, parentId, admissionNumber, rollNumber, gender, feeStatus, attendancePercentage, assignedFeeStructure, academicYear, ...userFields } = req.body;

  if (classRoomId) {
    const classRoom = await ClassRoom.findById(classRoomId);
    if (!classRoom) throw createHttpError("Selected class was not found.");
  }

  if (parentId) {
    const parent = await Parent.findById(parentId);
    if (!parent) throw createHttpError("Selected parent was not found.");
  }

  if (assignedFeeStructure) {
    const structure = await FeeStructure.findById(assignedFeeStructure);
    if (!structure) throw createHttpError("Selected fee structure was not found.");
  }

  const previousParentId = student.parent?.toString() || "";
  await syncUserDetails(student.user, userFields);

  if (admissionNumber !== undefined) student.admissionNumber = admissionNumber.trim();
  if (rollNumber !== undefined) student.rollNumber = rollNumber.trim();
  if (gender !== undefined) student.gender = gender;
  if (feeStatus !== undefined) student.feeStatus = feeStatus;
  if (attendancePercentage !== undefined) student.attendancePercentage = Number(attendancePercentage || 0);
  if (classRoomId !== undefined) student.classRoom = classRoomId || null;
  if (parentId !== undefined) student.parent = parentId || null;
  if (assignedFeeStructure !== undefined) student.assignedFeeStructure = assignedFeeStructure || null;
  if (academicYear !== undefined) student.academicYear = academicYear || student.academicYear;

  await student.save();

  if (previousParentId && previousParentId !== (parentId || "")) {
    await Parent.findByIdAndUpdate(previousParentId, { $pull: { children: student._id } });
  }

  if (parentId && previousParentId !== parentId) {
    await Parent.findByIdAndUpdate(parentId, { $addToSet: { children: student._id } });
  }

  res.json(
    await Student.findById(student._id)
      .populate("user", "name email phone status")
      .populate("classRoom", "name section academicYear")
      .populate("assignedFeeStructure")
      .populate({ path: "parent", populate: { path: "user", select: "name email phone" } })
  );
};

const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw createHttpError("Student not found.", 404);

  await Promise.all([
    Parent.updateMany({ children: student._id }, { $pull: { children: student._id } }),
    FeeRecord.deleteMany({ student: student._id }),
    FeePayment.deleteMany({ studentId: student._id }),
    Attendance.deleteMany({ student: student._id }),
    Result.deleteMany({ student: student._id }),
    Admission.updateMany({ student: student._id }, { $set: { student: null, status: "reviewing", approvedAt: null, approvedBy: null } }),
  ]);

  await User.findByIdAndDelete(student.user);
  await student.deleteOne();

  res.json({ message: "Student deleted successfully." });
};

const listTeachers = async (_req, res) => {
  const teachers = await Teacher.find().populate("user", "name email phone status");
  res.json(teachers);
};

const createTeacher = async (req, res) => {
  const { name, email, password, phone, employeeId, department, qualification, designation, subjects, bio } = req.body;
  let user;

  try {
    user = await createUserWithRole({ name, email, password, role: "teacher", phone });
    const teacher = await Teacher.create({
      user: user._id,
      employeeId: employeeId?.trim() || generateCode("EMP"),
      department,
      qualification,
      designation,
      subjects: Array.isArray(subjects) ? subjects.filter(Boolean) : String(subjects || "").split(",").map((item) => item.trim()).filter(Boolean),
      bio: bio || "",
    });
    res.status(201).json(await teacher.populate("user", "name email phone"));
  } catch (error) {
    if (user?._id) {
      await User.findByIdAndDelete(user._id);
    }
    throw error;
  }
};

const updateTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw createHttpError("Teacher not found.", 404);

  const { employeeId, department, qualification, designation, subjects, bio, ...userFields } = req.body;
  await syncUserDetails(teacher.user, userFields);

  if (employeeId !== undefined) teacher.employeeId = employeeId.trim();
  if (department !== undefined) teacher.department = department;
  if (qualification !== undefined) teacher.qualification = qualification;
  if (designation !== undefined) teacher.designation = designation;
  if (subjects !== undefined) teacher.subjects = Array.isArray(subjects) ? subjects.filter(Boolean) : String(subjects).split(",").map((item) => item.trim()).filter(Boolean);
  if (bio !== undefined) teacher.bio = bio;

  await teacher.save();
  res.json(await Teacher.findById(teacher._id).populate("user", "name email phone status"));
};

const deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw createHttpError("Teacher not found.", 404);

  await Promise.all([
    ClassRoom.updateMany({ classTeacher: teacher._id }, { $set: { classTeacher: null } }),
    User.findByIdAndDelete(teacher.user),
    teacher.deleteOne(),
  ]);

  res.json({ message: "Teacher deleted successfully." });
};

const listParents = async (_req, res) => {
  const parents = await Parent.find().populate("user", "name email phone").populate("children");
  res.json(parents);
};

const createParent = async (req, res) => {
  const { name, email, password, phone, occupation, address } = req.body;
  const user = await createUserWithRole({ name, email, password, role: "parent", phone });
  const parent = await Parent.create({ user: user._id, occupation, address });
  res.status(201).json(await parent.populate("user", "name email phone"));
};

const listClassRooms = async (_req, res) => {
  const classRooms = await ClassRoom.find().populate({
    path: "classTeacher",
    populate: { path: "user", select: "name email phone" },
  });
  res.json(classRooms);
};

const createClassRoom = async (req, res) => {
  if (!req.body.name || !req.body.section) {
    throw createHttpError("Class name and section are required.");
  }
  const classRoom = await ClassRoom.create({
    ...req.body,
    classTeacher: req.body.classTeacher || null,
    subjects: parseSubjects(req.body.subjects),
  });
  res.status(201).json(classRoom);
};

const updateClassRoom = async (req, res) => {
  const classRoom = await ClassRoom.findById(req.params.id);
  if (!classRoom) throw createHttpError("Class not found.", 404);

  if (req.body.classTeacher) {
    const teacher = await Teacher.findById(req.body.classTeacher);
    if (!teacher) throw createHttpError("Selected class teacher was not found.");
  }

  if (req.body.name !== undefined) classRoom.name = req.body.name;
  if (req.body.section !== undefined) classRoom.section = req.body.section;
  if (req.body.academicYear !== undefined) classRoom.academicYear = req.body.academicYear;
  if (req.body.classTeacher !== undefined) classRoom.classTeacher = req.body.classTeacher || null;
  if (req.body.subjects !== undefined) classRoom.subjects = parseSubjects(req.body.subjects);

  await classRoom.save();
  res.json(await ClassRoom.findById(classRoom._id).populate({
    path: "classTeacher",
    populate: { path: "user", select: "name email phone" },
  }));
};

const deleteClassRoom = async (req, res) => {
  const classRoom = await ClassRoom.findById(req.params.id);
  if (!classRoom) throw createHttpError("Class not found.", 404);

  await Promise.all([
    Student.updateMany({ classRoom: classRoom._id }, { $set: { classRoom: null } }),
    FeeStructure.updateMany({ classRoom: classRoom._id }, { $set: { classRoom: null } }),
    Assignment.deleteMany({ classRoom: classRoom._id }),
    Attendance.deleteMany({ classRoom: classRoom._id }),
    Result.deleteMany({ classRoom: classRoom._id }),
    StudyMaterial.deleteMany({ classRoom: classRoom._id }),
    Admission.updateMany({ classRoom: classRoom._id }, { $set: { classRoom: null } }),
  ]);

  await classRoom.deleteOne();
  res.json({ message: "Class deleted successfully." });
};

const listAdmissions = async (_req, res) => {
  const admissions = await Admission.find()
    .sort({ createdAt: -1 })
    .populate("classRoom", "name section academicYear")
    .populate({
      path: "student",
      populate: { path: "user", select: "name email phone" },
    });
  res.json(admissions);
};

const createAdmission = async (req, res) => {
  const { studentName, parentName, email, phone, classApplyingFor } = req.body;
  if (!studentName || !parentName || !email || !phone || !classApplyingFor) {
    throw createHttpError("Student name, parent name, email, phone, and class are required.");
  }
  const admission = await Admission.create({
    ...req.body,
    email: normalizeEmail(email),
    classRoom: req.body.classRoom || null,
  });
  res.status(201).json(admission);
};

const updateAdmission = async (req, res) => {
  const payload = { ...req.body };
  if (payload.email) payload.email = normalizeEmail(payload.email);
  if (payload.classRoom === "") payload.classRoom = null;
  const admission = await Admission.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!admission) return res.status(404).json({ message: "Admission not found." });
  res.json(await admission.populate("classRoom", "name section academicYear"));
};

const rejectAdmission = async (req, res) => {
  const admission = await Admission.findById(req.params.id);
  if (!admission) throw createHttpError("Admission not found.", 404);

  admission.status = "rejected";
  admission.rejectionReason = req.body.rejectionReason || "";
  await admission.save();
  res.json(admission);
};

const approveAdmission = async (req, res) => {
  const admission = await Admission.findById(req.params.id);
  if (!admission) throw createHttpError("Admission not found.", 404);
  if (admission.student) {
    throw createHttpError("This admission has already been converted into a student.", 409);
  }

  const portalPassword = req.body.password || generatePortalPassword();
  const classRoomId = req.body.classRoomId || admission.classRoom?.toString() || null;
  const admissionNumber = req.body.admissionNumber || "";
  const rollNumber = req.body.rollNumber || "";
  const gender = req.body.gender || "other";

  if (classRoomId) {
    const classRoom = await ClassRoom.findById(classRoomId);
    if (!classRoom) throw createHttpError("Selected class was not found.");
  }

  const existingUser = await User.findOne({ email: admission.email });
  if (existingUser) {
    if (existingUser.role !== "student") {
      const portalEmail = await generateUniquePortalEmail(admission.studentName);
      const portalPassword = req.body.password || generatePortalPassword();
      const user = await createUserWithRole({
        name: admission.studentName,
        email: portalEmail,
        password: portalPassword,
        role: "student",
        phone: admission.phone,
      });

      try {
        const student = await Student.create({
          user: user._id,
          admissionNumber: admissionNumber.trim() || generateCode("ADM"),
          rollNumber: rollNumber.trim() || generateCode("ROLL"),
          classRoom: classRoomId || null,
          gender,
        });

        admission.status = "approved";
        admission.student = student._id;
        admission.classRoom = classRoomId || null;
        admission.approvedAt = new Date();
        admission.approvedBy = req.user._id;
        admission.portalEmail = portalEmail;
        admission.rejectionReason = "";
        await admission.save();

        return res.json({
          message: "Admission approved. A unique student portal email was generated because the contact email is already in use.",
          credentials: {
            email: portalEmail,
            password: portalPassword,
          },
          student: await Student.findById(student._id)
            .populate("user", "name email phone")
            .populate("classRoom", "name section academicYear"),
        });
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        throw error;
      }
    }

    const existingStudent = await Student.findOne({ user: existingUser._id });
    if (!existingStudent) {
      throw createHttpError("A student login already exists for this email, but the student profile is missing.", 409);
    }

    if (!existingStudent.classRoom && classRoomId) {
      existingStudent.classRoom = classRoomId;
      await existingStudent.save();
    }

    admission.status = "approved";
    admission.student = existingStudent._id;
    admission.classRoom = classRoomId || existingStudent.classRoom || null;
    admission.approvedAt = new Date();
    admission.approvedBy = req.user._id;
    admission.portalEmail = existingUser.email;
    admission.rejectionReason = "";
    await admission.save();

    return res.json({
      message: "Admission approved and linked to the existing student account.",
      credentials: null,
      student: await Student.findById(existingStudent._id)
        .populate("user", "name email phone")
        .populate("classRoom", "name section academicYear"),
    });
  }

  const user = await createUserWithRole({
    name: admission.studentName,
    email: admission.email,
    password: portalPassword,
    role: "student",
    phone: admission.phone,
  });

  try {
    const student = await Student.create({
      user: user._id,
      admissionNumber: admissionNumber.trim() || generateCode("ADM"),
      rollNumber: rollNumber.trim() || generateCode("ROLL"),
      classRoom: classRoomId || null,
      gender,
    });

    admission.status = "approved";
    admission.student = student._id;
    admission.classRoom = classRoomId || null;
    admission.approvedAt = new Date();
    admission.approvedBy = req.user._id;
    admission.portalEmail = admission.email;
    admission.rejectionReason = "";
    await admission.save();

    res.json({
      message: "Admission approved and student account created.",
      credentials: {
        email: admission.email,
        password: portalPassword,
      },
      student: await Student.findById(student._id)
        .populate("user", "name email phone")
        .populate("classRoom", "name section academicYear"),
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

const deleteAdmission = async (req, res) => {
  const admission = await Admission.findById(req.params.id);
  if (!admission) throw createHttpError("Admission not found.", 404);

  await admission.deleteOne();
  res.json({ message: "Admission deleted successfully." });
};

const listAssignments = async (_req, res) => {
  const assignments = await Assignment.find().populate("classRoom", "name section").populate("createdBy");
  res.json(assignments);
};

const createAssignment = async (req, res) => {
  const { title, classRoom, subject, dueDate, createdBy } = req.body;
  if (!title || !classRoom || !subject || !dueDate || !createdBy) {
    throw createHttpError("Title, class, subject, due date, and teacher are required.");
  }
  const assignment = await Assignment.create(req.body);
  res.status(201).json(assignment);
};

const updateAssignment = async (req, res) => {
  const { title, classRoom, subject, dueDate, createdBy } = req.body;
  if (!title || !classRoom || !subject || !dueDate || !createdBy) {
    throw createHttpError("Title, class, subject, due date, and teacher are required.");
  }
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("classRoom", "name section")
    .populate("createdBy");
  if (!assignment) throw createHttpError("Assignment not found.", 404);
  res.json(assignment);
};

const deleteAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw createHttpError("Assignment not found.", 404);
  await assignment.deleteOne();
  res.json({ message: "Assignment deleted successfully." });
};

const listResults = async (_req, res) => {
  const results = await Result.find().populate("student").populate("classRoom");
  res.json(results);
};

const upsertResult = async (req, res) => {
  const { id } = req.params;
  const { student, classRoom, examName } = req.body;
  if (!student || !classRoom || !examName) {
    throw createHttpError("Student, class, and exam name are required.");
  }
  const result = id
    ? await Result.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    : await Result.create(req.body);
  res.status(id ? 200 : 201).json(result);
};

const deleteResult = async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) throw createHttpError("Result not found.", 404);
  await result.deleteOne();
  res.json({ message: "Result deleted successfully." });
};

const listMaterials = async (_req, res) => {
  const materials = await StudyMaterial.find().populate("classRoom", "name section").populate("uploadedBy");
  res.json(materials);
};

const createMaterial = async (req, res) => {
  const { title, classRoom, subject, uploadedBy } = req.body;
  if (!title || !classRoom || !subject || !uploadedBy) {
    throw createHttpError("Title, class, subject, and teacher are required.");
  }
  const material = await StudyMaterial.create(req.body);
  res.status(201).json(material);
};

const updateMaterial = async (req, res) => {
  const { title, classRoom, subject, uploadedBy } = req.body;
  if (!title || !classRoom || !subject || !uploadedBy) {
    throw createHttpError("Title, class, subject, and teacher are required.");
  }
  const material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("classRoom", "name section")
    .populate("uploadedBy");
  if (!material) throw createHttpError("Study material not found.", 404);
  res.json(material);
};

const deleteMaterial = async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id);
  if (!material) throw createHttpError("Study material not found.", 404);
  await material.deleteOne();
  res.json({ message: "Study material deleted successfully." });
};

const buildStudentFeePayload = async (student) => {
  const populatedStudent =
    student?.populate && !student.user
      ? await student.populate([
          { path: "user", select: "name email phone" },
          { path: "classRoom", select: "name section academicYear" },
          { path: "assignedFeeStructure" },
          { path: "parent", populate: { path: "user", select: "name email phone" } },
        ])
      : student;

  return {
    ...populatedStudent.toObject(),
    feeSummary: await getStudentFeeSummary(populatedStudent),
  };
};

const getFeePaymentExportData = async ({ academicYear, classRoomId }) => {
  if (!academicYear) throw createHttpError("Academic session is required.");

  const filters = { academicYear };
  const payments = await FeePayment.find(filters)
    .sort({ paymentDate: 1, createdAt: 1 })
    .populate({
      path: "studentId",
      populate: [
        { path: "user", select: "name email phone" },
        { path: "classRoom", select: "name section academicYear" },
      ],
    })
    .populate("feeStructure");

  const filteredPayments = classRoomId
    ? payments.filter((payment) => (payment.studentId?.classRoom?._id || "").toString() === classRoomId)
    : payments;

  return filteredPayments;
};

const listFeeStructures = async (_req, res) => {
  const structures = await FeeStructure.find()
    .sort({ academicYear: -1, className: 1 })
    .populate("classRoom", "name section academicYear");
  res.json(structures);
};

const createFeeStructure = async (req, res) => {
  const { className, classRoom, tuitionFee, transportFee, libraryFee, examFee, otherCharges, academicYear, transportEnabled } = req.body;
  if (!className) throw createHttpError("Class name is required.");

  if (classRoom) {
    const classRecord = await ClassRoom.findById(classRoom);
    if (!classRecord) throw createHttpError("Selected class was not found.");
  }

  const existing = await FeeStructure.findOne({ className: className.trim(), academicYear: academicYear || "2026-27" });
  if (existing) throw createHttpError("A fee structure already exists for this class and academic year.", 409);

  const structure = await FeeStructure.create({
    className: className.trim(),
    classRoom: classRoom || null,
    tuitionFee,
    transportFee,
    libraryFee,
    examFee,
    otherCharges,
    transportEnabled,
    academicYear: academicYear || "2026-27",
  });

  res.status(201).json(await structure.populate("classRoom", "name section academicYear"));
};

const updateFeeStructure = async (req, res) => {
  const structure = await FeeStructure.findById(req.params.id);
  if (!structure) throw createHttpError("Fee structure not found.", 404);

  const { className, classRoom, tuitionFee, transportFee, libraryFee, examFee, otherCharges, academicYear, transportEnabled } = req.body;

  if (classRoom) {
    const classRecord = await ClassRoom.findById(classRoom);
    if (!classRecord) throw createHttpError("Selected class was not found.");
  }

  if (className !== undefined) structure.className = className.trim();
  if (classRoom !== undefined) structure.classRoom = classRoom || null;
  if (tuitionFee !== undefined) structure.tuitionFee = tuitionFee;
  if (transportFee !== undefined) structure.transportFee = transportFee;
  if (libraryFee !== undefined) structure.libraryFee = libraryFee;
  if (examFee !== undefined) structure.examFee = examFee;
  if (otherCharges !== undefined) structure.otherCharges = otherCharges;
  if (transportEnabled !== undefined) structure.transportEnabled = transportEnabled;
  if (academicYear !== undefined) structure.academicYear = academicYear;

  await structure.save();

  const linkedStudents = await Student.find({ assignedFeeStructure: structure._id }).select("_id");
  await Promise.all(linkedStudents.map((student) => syncStudentFeeStatus(student._id)));

  res.json(await FeeStructure.findById(structure._id).populate("classRoom", "name section academicYear"));
};

const deleteFeeStructure = async (req, res) => {
  const structure = await FeeStructure.findById(req.params.id);
  if (!structure) throw createHttpError("Fee structure not found.", 404);

  await Student.updateMany({ assignedFeeStructure: structure._id }, { $set: { assignedFeeStructure: null, feeStatus: "due" } });
  await FeePayment.updateMany({ feeStructure: structure._id }, { $set: { feeStructure: null } });
  await structure.deleteOne();

  res.json({ message: "Fee structure deleted successfully." });
};

const assignFeeStructureToStudent = async (req, res) => {
  const studentId = req.params.id || req.params.studentId;
  const { feeStructureId, transportEnabled } = req.body;
  if (!feeStructureId) throw createHttpError("Fee structure is required.");

  const [student, structure] = await Promise.all([
    Student.findById(studentId).populate("classRoom", "name section academicYear"),
    FeeStructure.findById(feeStructureId),
  ]);

  if (!student) throw createHttpError("Student not found.", 404);
  if (!structure) throw createHttpError("Fee structure not found.", 404);

  await initializeStudentFeePlan(student, structure, {
    transportEnabled: transportEnabled !== undefined ? transportEnabled : structure.transportEnabled,
  });
  res.json(await buildStudentFeePayload(await Student.findById(studentId)));
};

const reviseStudentFeePlanRecord = async (req, res) => {
  const studentId = req.params.id || req.params.studentId;
  const {
    effectiveMonth,
    reason,
    tuitionFee,
    transportFee,
    libraryFee,
    examFee,
    otherCharges,
    transportEnabled,
  } = req.body;

  const student = await Student.findById(studentId)
    .populate("user", "name email phone")
    .populate("classRoom", "name section academicYear")
    .populate("assignedFeeStructure");
  if (!student) throw createHttpError("Student not found.", 404);

  const existingPayments = await FeePayment.find({ studentId }).sort({ paymentDate: -1 });
  if (existingPayments.length) {
    const latestPaidMonth = new Date(existingPayments[0].paymentDate).getMonth() + 1;
    if (Number(effectiveMonth) <= latestPaidMonth) {
      throw createHttpError("Fee revisions can only apply to future months after the latest recorded payment.", 409);
    }
  }

  try {
    const currentFeePlan = await getStudentCurrentFeePlan(student);
    if (!currentFeePlan?.structureSnapshot) {
      throw createHttpError("Assign a class fee structure before revising a student's fee plan.", 409);
    }

    const currentSnapshot = currentFeePlan.structureSnapshot;
    const revisionOverrides = {};
    if (tuitionFee !== undefined && tuitionFee !== "") revisionOverrides.tuitionFee = tuitionFee;
    if (transportFee !== undefined && transportFee !== "") revisionOverrides.transportFee = transportFee;
    if (libraryFee !== undefined && libraryFee !== "") revisionOverrides.libraryFee = libraryFee;
    if (examFee !== undefined && examFee !== "") revisionOverrides.examFee = examFee;
    if (otherCharges !== undefined && otherCharges !== "") revisionOverrides.otherCharges = otherCharges;
    if (transportEnabled !== undefined) revisionOverrides.transportEnabled = transportEnabled;

    await reviseStudentFeePlan(student, {
      effectiveMonth,
      reason,
      updatedStructure: normalizeSnapshot({
        ...currentSnapshot,
        ...revisionOverrides,
      }),
    });
  } catch (error) {
    throw createHttpError(error.message || "Failed to revise fee plan.", 409);
  }

  res.json(await buildStudentFeePayload(await Student.findById(studentId)));
};

const listFeePayments = async (req, res) => {
  const { studentId, academicYear } = req.query;
  const filters = {};
  if (studentId) filters.studentId = studentId;
  if (academicYear) filters.academicYear = academicYear;

  const payments = await FeePayment.find(filters)
    .sort({ paymentDate: -1, createdAt: -1 })
    .populate({
      path: "studentId",
      populate: [
        { path: "user", select: "name email phone" },
        { path: "classRoom", select: "name section academicYear" },
      ],
    })
    .populate("feeStructure")
    .populate("createdBy", "name");

  res.json(payments);
};

const validateAndBuildPaymentPayload = async ({ paymentId = null, body, userId }) => {
  const { studentId, paymentDate, paymentMonth, amountPaid, paymentMethod, receiptNumber, academicYear } = body;

  if (!studentId || !paymentDate || !paymentMonth || !amountPaid || !paymentMethod) {
    throw createHttpError("Student, payment date, payment month, amount, and payment method are required.");
  }

  const student = await Student.findById(studentId)
    .populate("user", "name email phone")
    .populate("classRoom", "name section academicYear")
    .populate("assignedFeeStructure");
  if (!student) throw createHttpError("Student not found.", 404);

  const effectiveAcademicYear = academicYear || student.assignedFeeStructure?.academicYear || student.academicYear || student.classRoom?.academicYear || "2026-27";
  const existingPayments = await FeePayment.find({
    studentId,
    academicYear: effectiveAcademicYear,
    ...(paymentId ? { _id: { $ne: paymentId } } : {}),
  }).sort({ paymentDate: -1, createdAt: -1 });

  const summary = await getStudentFeeSummary(student, {
    payments: existingPayments,
    academicYear: effectiveAcademicYear,
  });

  if (!summary?.structure) {
    throw createHttpError("Assign a fee structure to the student before collecting fees.", 409);
  }

  const normalizedAmount = toMoney(amountPaid);
  if (normalizedAmount <= 0) throw createHttpError("Payment amount must be greater than zero.");
  if (normalizedAmount > summary.remainingBalance) {
    throw createHttpError(`Payment exceeds the remaining balance of INR ${summary.remainingBalance}.`, 409);
  }

  const duplicatePayment = await FeePayment.findOne({
    studentId,
    paymentMonth: paymentMonth.trim(),
    paymentDate: new Date(paymentDate),
    amountPaid: normalizedAmount,
    paymentMethod,
    ...(paymentId ? { _id: { $ne: paymentId } } : {}),
  });
  if (duplicatePayment) throw createHttpError("A matching payment entry already exists.", 409);

  const nextRemainingBalance = toMoney(Math.max(summary.remainingBalance - normalizedAmount, 0));
  const paymentStatus = nextRemainingBalance === 0 ? "paid" : "partial";

  const resolvedReceiptNumber = paymentId
    ? String(receiptNumber || "").trim()
    : await generateUniqueReceiptNumber();

  return {
    student,
    payload: {
      studentId,
      feeStructure: summary.structure._id,
      paymentDate: new Date(paymentDate),
      paymentMonth: paymentMonth.trim(),
      amountPaid: normalizedAmount,
      paymentMethod,
      receiptNumber: resolvedReceiptNumber,
      paymentStatus,
      remainingBalance: nextRemainingBalance,
      academicYear: effectiveAcademicYear,
      createdBy: userId,
    },
  };
};

const createFeePayment = async (req, res) => {
  const { student, payload } = await validateAndBuildPaymentPayload({
    body: req.body,
    userId: req.user._id,
  });

  const payment = await FeePayment.create(payload);
  const summary = await syncStudentFeeStatus(student._id);

  res.status(201).json({
    payment: await FeePayment.findById(payment._id)
      .populate({
        path: "studentId",
        populate: [
          { path: "user", select: "name email phone" },
          { path: "classRoom", select: "name section academicYear" },
        ],
      })
      .populate("feeStructure")
      .populate("createdBy", "name"),
    studentFeeSummary: summary,
  });
};

const updateFeePayment = async (req, res) => {
  const existingPayment = await FeePayment.findById(req.params.id);
  if (!existingPayment) throw createHttpError("Fee payment not found.", 404);

  const { student, payload } = await validateAndBuildPaymentPayload({
    paymentId: existingPayment._id,
    body: {
      ...existingPayment.toObject(),
      ...req.body,
      studentId: req.body.studentId || existingPayment.studentId.toString(),
    },
    userId: existingPayment.createdBy || req.user._id,
  });

  Object.assign(existingPayment, payload);
  await existingPayment.save();

  const summary = await syncStudentFeeStatus(student._id);

  res.json({
    payment: await FeePayment.findById(existingPayment._id)
      .populate({
        path: "studentId",
        populate: [
          { path: "user", select: "name email phone" },
          { path: "classRoom", select: "name section academicYear" },
        ],
      })
      .populate("feeStructure")
      .populate("createdBy", "name"),
    studentFeeSummary: summary,
  });
};

const deleteFeePayment = async (req, res) => {
  const payment = await FeePayment.findById(req.params.id);
  if (!payment) throw createHttpError("Fee payment not found.", 404);
  const studentId = payment.studentId;
  await payment.deleteOne();
  await syncStudentFeeStatus(studentId);
  res.json({ message: "Fee payment deleted successfully." });
};

const getStudentFeeDetails = async (req, res) => {
  const studentId = req.params.id || req.params.studentId;
  const student = await Student.findById(studentId)
    .populate("user", "name email phone")
    .populate("classRoom", "name section academicYear")
    .populate("assignedFeeStructure")
    .populate({ path: "parent", populate: { path: "user", select: "name email phone" } });
  if (!student) throw createHttpError("Student not found.", 404);

  res.json(await buildStudentFeePayload(student));
};

const getFeeReports = async (_req, res) => {
  const [payments, students] = await Promise.all([
    FeePayment.find()
      .sort({ paymentDate: -1 })
      .populate({
        path: "studentId",
        populate: [
          { path: "user", select: "name email phone" },
          { path: "classRoom", select: "name section academicYear" },
          { path: "assignedFeeStructure" },
        ],
      })
      .populate("feeStructure"),
    Student.find()
      .populate("user", "name email phone")
      .populate("classRoom", "name section academicYear")
      .populate("assignedFeeStructure"),
  ]);

  const sumByKey = (items, keyBuilder) => {
    const map = new Map();
    items.forEach((item) => {
      const key = keyBuilder(item);
      const current = map.get(key) || { key, totalCollected: 0, payments: 0 };
      current.totalCollected = toMoney(current.totalCollected + Number(item.amountPaid || 0));
      current.payments += 1;
      map.set(key, current);
    });
    return Array.from(map.values()).sort((first, second) => second.key.localeCompare(first.key));
  };

  const dailyCollections = sumByKey(payments, (payment) => new Date(payment.paymentDate).toISOString().slice(0, 10));
  const monthlyCollections = sumByKey(payments, (payment) => `${new Date(payment.paymentDate).getFullYear()}-${String(new Date(payment.paymentDate).getMonth() + 1).padStart(2, "0")}`);
  const yearlyCollections = sumByKey(payments, (payment) => String(new Date(payment.paymentDate).getFullYear()));

  const pendingStudents = (await Promise.all(students.map((student) => buildStudentFeePayload(student))))
    .filter((student) => student.feeSummary?.remainingBalance > 0)
    .map((student) => ({
      _id: student._id,
      name: student.user?.name || "Student",
      rollNumber: student.rollNumber || "",
      admissionNumber: student.admissionNumber || "",
      className: buildClassLabel(student.classRoom),
      academicYear: student.feeSummary?.academicYear || student.academicYear,
      totalFee: student.feeSummary?.totalFee || 0,
      amountPaid: student.feeSummary?.amountPaid || 0,
      remainingBalance: student.feeSummary?.remainingBalance || 0,
      paymentStatus: student.feeSummary?.paymentStatus || "pending",
    }));

  const classWiseMap = new Map();
  pendingStudents.forEach((student) => {
    const key = student.className || "Unassigned Class";
    const current = classWiseMap.get(key) || {
      className: key,
      studentCount: 0,
      totalFee: 0,
      amountPaid: 0,
      remainingBalance: 0,
    };
    current.studentCount += 1;
    current.totalFee = toMoney(current.totalFee + student.totalFee);
    current.amountPaid = toMoney(current.amountPaid + student.amountPaid);
    current.remainingBalance = toMoney(current.remainingBalance + student.remainingBalance);
    classWiseMap.set(key, current);
  });

  res.json({
    totals: {
      totalCollected: toMoney(payments.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0)),
      totalPayments: payments.length,
      pendingStudents: pendingStudents.length,
    },
    dailyCollections,
    monthlyCollections,
    yearlyCollections,
    pendingStudents,
    classWiseCollections: Array.from(classWiseMap.values()).sort((first, second) => first.className.localeCompare(second.className)),
  });
};

const exportFeeTransactions = async (req, res) => {
  const { academicYear, classRoomId } = req.query;
  const payments = await getFeePaymentExportData({ academicYear, classRoomId });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Fee Transactions");
  worksheet.columns = [
    { header: "Student Name", key: "studentName", width: 24 },
    { header: "Student ID / Roll Number", key: "studentCode", width: 22 },
    { header: "Class", key: "className", width: 18 },
    { header: "Academic Session", key: "academicYear", width: 18 },
    { header: "Receipt Number", key: "receiptNumber", width: 22 },
    { header: "Payment Date", key: "paymentDate", width: 18 },
    { header: "Payment Month", key: "paymentMonth", width: 16 },
    { header: "Amount Paid", key: "amountPaid", width: 16 },
    { header: "Payment Method", key: "paymentMethod", width: 16 },
    { header: "Remaining Balance", key: "remainingBalance", width: 18 },
    { header: "Payment Status", key: "paymentStatus", width: 16 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFDCE9FF" },
  };

  payments.forEach((payment) => {
    const student = payment.studentId;
    const classLabel = student?.classRoom ? `${student.classRoom.name} - ${student.classRoom.section}` : "Unassigned";
    worksheet.addRow({
      studentName: student?.user?.name || "Student",
      studentCode: student?.rollNumber || student?.admissionNumber || "N/A",
      className: classLabel,
      academicYear: payment.academicYear,
      receiptNumber: payment.receiptNumber,
      paymentDate: new Date(payment.paymentDate).toLocaleDateString("en-GB"),
      paymentMonth: payment.paymentMonth,
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      remainingBalance: payment.remainingBalance,
      paymentStatus: payment.paymentStatus,
    });
  });

  const classNameForFile = classRoomId
    ? sanitizeFileName(payments[0]?.studentId?.classRoom ? `${payments[0].studentId.classRoom.name}${payments[0].studentId.classRoom.section}` : classRoomId)
    : "All_Classes";
  const fileName = `Fee_Transactions_${classNameForFile}_${sanitizeFileName(academicYear)}.xlsx`;

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
};

const deleteFeeSessionHistory = async (req, res) => {
  const { academicYear, classRoomId, exportConfirmed } = req.body;
  if (!academicYear) throw createHttpError("Academic session is required.");
  if (!exportConfirmed) {
    throw createHttpError("Export confirmation is required before deleting fee history.", 409);
  }

  const payments = await getFeePaymentExportData({ academicYear, classRoomId });
  const paymentIds = payments.map((payment) => payment._id);
  const affectedStudentIds = [...new Set(payments.map((payment) => payment.studentId?._id?.toString()).filter(Boolean))];

  if (!paymentIds.length) {
    return res.json({ message: "No fee transactions found for the selected filters." });
  }

  await FeePayment.deleteMany({ _id: { $in: paymentIds } });
  await Promise.all(affectedStudentIds.map((studentId) => syncStudentFeeStatus(studentId)));

  res.json({
    message: "Fee transaction history deleted successfully. Student fee tracking has been recalculated.",
    deletedCount: paymentIds.length,
    affectedStudents: affectedStudentIds.length,
  });
};

const listFees = async (_req, res) => {
  const [structures, payments, students, reports] = await Promise.all([
    FeeStructure.find().sort({ academicYear: -1, className: 1 }).populate("classRoom", "name section academicYear"),
    FeePayment.find()
      .sort({ paymentDate: -1, createdAt: -1 })
      .populate({
        path: "studentId",
        populate: [
          { path: "user", select: "name email phone" },
          { path: "classRoom", select: "name section academicYear" },
        ],
      })
      .populate("feeStructure")
      .populate("createdBy", "name"),
    Student.find()
      .populate("user", "name email phone")
      .populate("classRoom", "name section academicYear")
      .populate("assignedFeeStructure"),
    (async () => {
      const reqLike = {};
      let output;
      await getFeeReports(reqLike, { json: (data) => { output = data; } });
      return output;
    })(),
  ]);

  const studentSummaries = await Promise.all(students.map((student) => buildStudentFeePayload(student)));
  res.json({ structures, payments, students: studentSummaries, reports });
};

const listNotifications = async (_req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
};

const createNotification = async (req, res) => {
  if (!req.body.title || !req.body.message) {
    throw createHttpError("Notification title and message are required.");
  }
  const notification = await Notification.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json(notification);
};

const markAttendance = async (req, res) => {
  const { student, classRoom, date, status, teacherId } = req.body;
  if (!student || !classRoom || !date || !status) {
    throw createHttpError("Student, class, date, and status are required.");
  }
  const attendance = await Attendance.findOneAndUpdate(
    { student, date: new Date(date) },
    { student, classRoom, date, status, markedBy: teacherId || null },
    { upsert: true, new: true, runValidators: true }
  );
  res.json(attendance);
};

const updateAttendance = async (req, res) => {
  const { student, classRoom, date, status, teacherId } = req.body;
  if (!student || !classRoom || !date || !status) {
    throw createHttpError("Student, class, date, and status are required.");
  }
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    { student, classRoom, date, status, markedBy: teacherId || null },
    { new: true, runValidators: true }
  )
    .populate({
      path: "student",
      populate: { path: "user", select: "name" },
    })
    .populate("classRoom", "name section")
    .populate({ path: "markedBy", populate: { path: "user", select: "name" } });
  if (!attendance) throw createHttpError("Attendance record not found.", 404);
  res.json(attendance);
};

const deleteAttendance = async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) throw createHttpError("Attendance record not found.", 404);
  await attendance.deleteOne();
  res.json({ message: "Attendance record deleted successfully." });
};

const listAttendance = async (_req, res) => {
  const attendance = await Attendance.find()
    .sort({ date: -1 })
    .populate({ path: "student", populate: { path: "user", select: "name email" } })
    .populate("classRoom");
  res.json(attendance);
};

module.exports = {
  getAdminSummary: asyncHandler(getAdminSummary),
  listStudents: asyncHandler(listStudents),
  createStudent: asyncHandler(createStudent),
  updateStudent: asyncHandler(updateStudent),
  deleteStudent: asyncHandler(deleteStudent),
  listTeachers: asyncHandler(listTeachers),
  createTeacher: asyncHandler(createTeacher),
  updateTeacher: asyncHandler(updateTeacher),
  deleteTeacher: asyncHandler(deleteTeacher),
  listParents: asyncHandler(listParents),
  createParent: asyncHandler(createParent),
  listClassRooms: asyncHandler(listClassRooms),
  createClassRoom: asyncHandler(createClassRoom),
  updateClassRoom: asyncHandler(updateClassRoom),
  deleteClassRoom: asyncHandler(deleteClassRoom),
  listAdmissions: asyncHandler(listAdmissions),
  createAdmission: asyncHandler(createAdmission),
  updateAdmission: asyncHandler(updateAdmission),
  approveAdmission: asyncHandler(approveAdmission),
  rejectAdmission: asyncHandler(rejectAdmission),
  deleteAdmission: asyncHandler(deleteAdmission),
  listAssignments: asyncHandler(listAssignments),
  createAssignment: asyncHandler(createAssignment),
  updateAssignment: asyncHandler(updateAssignment),
  deleteAssignment: asyncHandler(deleteAssignment),
  listResults: asyncHandler(listResults),
  upsertResult: asyncHandler(upsertResult),
  deleteResult: asyncHandler(deleteResult),
  listMaterials: asyncHandler(listMaterials),
  createMaterial: asyncHandler(createMaterial),
  updateMaterial: asyncHandler(updateMaterial),
  deleteMaterial: asyncHandler(deleteMaterial),
  listFeeStructures: asyncHandler(listFeeStructures),
  createFeeStructure: asyncHandler(createFeeStructure),
  updateFeeStructure: asyncHandler(updateFeeStructure),
  deleteFeeStructure: asyncHandler(deleteFeeStructure),
  assignFeeStructureToStudent: asyncHandler(assignFeeStructureToStudent),
  reviseStudentFeePlanRecord: asyncHandler(reviseStudentFeePlanRecord),
  listFeePayments: asyncHandler(listFeePayments),
  createFeePayment: asyncHandler(createFeePayment),
  updateFeePayment: asyncHandler(updateFeePayment),
  deleteFeePayment: asyncHandler(deleteFeePayment),
  getStudentFeeDetails: asyncHandler(getStudentFeeDetails),
  getFeeReports: asyncHandler(getFeeReports),
  exportFeeTransactions: asyncHandler(exportFeeTransactions),
  deleteFeeSessionHistory: asyncHandler(deleteFeeSessionHistory),
  listFees: asyncHandler(listFees),
  listNotifications: asyncHandler(listNotifications),
  createNotification: asyncHandler(createNotification),
  markAttendance: asyncHandler(markAttendance),
  listAttendance: asyncHandler(listAttendance),
  updateAttendance: asyncHandler(updateAttendance),
  deleteAttendance: asyncHandler(deleteAttendance),
};
