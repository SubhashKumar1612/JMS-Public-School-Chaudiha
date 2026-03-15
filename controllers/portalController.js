const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const StudyMaterial = require("../models/StudyMaterial");
const Notification = require("../models/Notification");
const ClassRoom = require("../models/ClassRoom");
const asyncHandler = require("../middleware/asyncHandler");
const { getStudentFeeSummary } = require("../utils/feeManagement");

const getPortalDashboard = async (req, res) => {
  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id })
      .populate("classRoom")
      .populate("assignedFeeStructure");
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const [assignments, attendance, results, materials, notices, feeSummary] = await Promise.all([
      Assignment.find({ classRoom: student.classRoom?._id }).sort({ dueDate: 1 }).limit(6),
      Attendance.find({ student: student._id }).sort({ date: -1 }).limit(10),
      Result.find({ student: student._id }).sort({ createdAt: -1 }).limit(4),
      StudyMaterial.find({ classRoom: student.classRoom?._id }).sort({ createdAt: -1 }).limit(8),
      Notification.find({ $or: [{ audience: "all" }, { audience: "students" }] }).sort({ createdAt: -1 }).limit(6),
      getStudentFeeSummary(student),
    ]);

    return res.json({ role: "student", profile: student, assignments, attendance, results, materials, feeSummary, notices });
  }

  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });

    const classRooms = await ClassRoom.find({ $or: [{ classTeacher: teacher._id }, { "subjects.name": { $exists: true } }] }).limit(10);
    const [assignments, materials, notices, results] = await Promise.all([
      Assignment.find({ createdBy: teacher._id }).sort({ createdAt: -1 }).limit(8),
      StudyMaterial.find({ uploadedBy: teacher._id }).sort({ createdAt: -1 }).limit(8),
      Notification.find({ $or: [{ audience: "all" }, { audience: "teachers" }] }).sort({ createdAt: -1 }).limit(6),
      Result.find().sort({ createdAt: -1 }).limit(8),
    ]);

    return res.json({ role: "teacher", profile: teacher, classRooms, assignments, materials, notices, results });
  }

  if (req.user.role === "parent") {
    const parent = await Parent.findOne({ user: req.user._id }).populate({
      path: "children",
      populate: [{ path: "classRoom" }, { path: "assignedFeeStructure" }, { path: "user", select: "name email phone" }],
    });
    if (!parent) return res.status(404).json({ message: "Parent profile not found." });

    const childIds = parent.children.map((child) => child._id);
    const [attendance, results, notices, feeSummaries] = await Promise.all([
      Attendance.find({ student: { $in: childIds } }).sort({ date: -1 }).limit(12).populate("student", "rollNumber"),
      Result.find({ student: { $in: childIds } }).sort({ createdAt: -1 }).limit(8).populate("student", "rollNumber"),
      Notification.find({ $or: [{ audience: "all" }, { audience: "parents" }] }).sort({ createdAt: -1 }).limit(6),
      Promise.all(parent.children.map((child) => getStudentFeeSummary(child))),
    ]);

    return res.json({
      role: "parent",
      profile: parent,
      attendance,
      results,
      feeSummaries: feeSummaries.map((summary, index) => ({
        ...summary,
        studentName: parent.children[index]?.user?.name || "Child",
        rollNumber: parent.children[index]?.rollNumber || "",
      })),
      notices,
    });
  }

  return res.status(403).json({ message: "Dashboard not available for this role." });
};

module.exports = { getPortalDashboard: asyncHandler(getPortalDashboard) };
