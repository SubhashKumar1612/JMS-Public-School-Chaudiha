const User = require("../models/User");
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
const Notification = require("../models/Notification");
const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../middleware/asyncHandler");

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const generateCode = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

const generatePortalPassword = () => `JMS@${Math.random().toString(36).slice(-4)}${Date.now().toString().slice(-4)}`;

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
    FeeRecord.countDocuments({ status: { $ne: "paid" } }),
    ContactMessage.countDocuments(),
  ]);

  res.json({ students, teachers, parents, admissions, assignments, dues, messages });
};

const listStudents = async (_req, res) => {
  const students = await Student.find()
    .populate("user", "name email phone")
    .populate("classRoom", "name section academicYear")
    .populate({ path: "parent", populate: { path: "user", select: "name email phone" } });
  res.json(students);
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
    });

    if (parentId) {
      await Parent.findByIdAndUpdate(parentId, { $addToSet: { children: student._id } });
    }

    res.status(201).json(
      await student.populate([
        { path: "user", select: "name email phone" },
        { path: "classRoom", select: "name section academicYear" },
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

  const { classRoomId, parentId, admissionNumber, rollNumber, gender, feeStatus, attendancePercentage, ...userFields } = req.body;

  if (classRoomId) {
    const classRoom = await ClassRoom.findById(classRoomId);
    if (!classRoom) throw createHttpError("Selected class was not found.");
  }

  if (parentId) {
    const parent = await Parent.findById(parentId);
    if (!parent) throw createHttpError("Selected parent was not found.");
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
      .populate({ path: "parent", populate: { path: "user", select: "name email phone" } })
  );
};

const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw createHttpError("Student not found.", 404);

  await Promise.all([
    Parent.updateMany({ children: student._id }, { $pull: { children: student._id } }),
    FeeRecord.deleteMany({ student: student._id }),
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

const listFees = async (_req, res) => {
  const fees = await FeeRecord.find().populate({
    path: "student",
    populate: { path: "user", select: "name" },
  });
  res.json(fees);
};

const createFeeRecord = async (req, res) => {
  const { student, term, amount, dueDate } = req.body;
  if (!student || !term || !amount || !dueDate) {
    throw createHttpError("Student, term, amount, and due date are required.");
  }
  const fee = await FeeRecord.create(req.body);
  res.status(201).json(fee);
};

const updateFeeRecord = async (req, res) => {
  const fee = await FeeRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!fee) throw createHttpError("Fee record not found.", 404);
  res.json(fee);
};

const deleteFeeRecord = async (req, res) => {
  const fee = await FeeRecord.findById(req.params.id);
  if (!fee) throw createHttpError("Fee record not found.", 404);
  await fee.deleteOne();
  res.json({ message: "Fee record deleted successfully." });
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
  listFees: asyncHandler(listFees),
  createFeeRecord: asyncHandler(createFeeRecord),
  updateFeeRecord: asyncHandler(updateFeeRecord),
  deleteFeeRecord: asyncHandler(deleteFeeRecord),
  listNotifications: asyncHandler(listNotifications),
  createNotification: asyncHandler(createNotification),
  markAttendance: asyncHandler(markAttendance),
  listAttendance: asyncHandler(listAttendance),
  updateAttendance: asyncHandler(updateAttendance),
  deleteAttendance: asyncHandler(deleteAttendance),
};
