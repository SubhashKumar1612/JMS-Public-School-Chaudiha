const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const ClassRoom = require("../models/ClassRoom");
const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const StudyMaterial = require("../models/StudyMaterial");
const FeeRecord = require("../models/FeeRecord");
const Notification = require("../models/Notification");

dotenv.config();

async function ensureUser({ name, email, password, role, phone }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ name, email, password, role, phone });
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed platform demo data.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const teacherUser = await ensureUser({
    name: "Anita Verma",
    email: "teacher@jmsschool.com",
    password: "Portal@123",
    role: "teacher",
    phone: "9999999991",
  });

  const parentUser = await ensureUser({
    name: "Rakesh Kumar",
    email: "parent@jmsschool.com",
    password: "Portal@123",
    role: "parent",
    phone: "9999999992",
  });

  const studentUser = await ensureUser({
    name: "Aarav Kumar",
    email: "student@jmsschool.com",
    password: "Portal@123",
    role: "student",
    phone: "9999999993",
  });

  let teacher = await Teacher.findOne({ user: teacherUser._id });
  if (!teacher) {
    teacher = await Teacher.create({
      user: teacherUser._id,
      employeeId: "TCH-101",
      department: "Science",
      qualification: "M.Sc, B.Ed",
      designation: "Senior Science Teacher",
      subjects: ["Science", "Biology"],
      bio: "Focuses on inquiry-led learning and structured academic mentoring.",
    });
  }

  let classRoom = await ClassRoom.findOne({ name: "Class 8", section: "A" });
  if (!classRoom) {
    classRoom = await ClassRoom.create({
      name: "Class 8",
      section: "A",
      academicYear: "2026-27",
      classTeacher: teacher._id,
      subjects: [
        { name: "English", code: "ENG8" },
        { name: "Mathematics", code: "MTH8" },
        { name: "Science", code: "SCI8" },
      ],
      schedule: [
        {
          day: "Monday",
          slots: [
            { time: "08:30", subject: "English", teacherName: "Anita Verma" },
            { time: "09:20", subject: "Science", teacherName: "Anita Verma" },
          ],
        },
      ],
    });
  }

  let parent = await Parent.findOne({ user: parentUser._id });
  if (!parent) {
    parent = await Parent.create({
      user: parentUser._id,
      occupation: "Business",
      address: "Chaudiha",
    });
  }

  let student = await Student.findOne({ user: studentUser._id });
  if (!student) {
    student = await Student.create({
      user: studentUser._id,
      admissionNumber: "ADM-2026-001",
      rollNumber: "08A-01",
      classRoom: classRoom._id,
      parent: parent._id,
      gender: "male",
      attendancePercentage: 94,
      feeStatus: "partial",
    });
    parent.children = [student._id];
    await parent.save();
  }

  const assignmentCount = await Assignment.countDocuments({ classRoom: classRoom._id });
  if (!assignmentCount) {
    await Assignment.create({
      title: "Science Project Journal",
      description: "Prepare a 5-page journal on ecosystems.",
      classRoom: classRoom._id,
      subject: "Science",
      dueDate: new Date("2026-03-30"),
      createdBy: teacher._id,
    });
  }

  const materialCount = await StudyMaterial.countDocuments({ classRoom: classRoom._id });
  if (!materialCount) {
    await StudyMaterial.create({
      title: "Photosynthesis Revision Notes",
      description: "Concept notes and practice questions.",
      classRoom: classRoom._id,
      subject: "Science",
      fileUrl: "#",
      uploadedBy: teacher._id,
    });
  }

  const attendanceCount = await Attendance.countDocuments({ student: student._id });
  if (!attendanceCount) {
    await Attendance.create({
      student: student._id,
      classRoom: classRoom._id,
      date: new Date("2026-03-14"),
      status: "present",
      markedBy: teacher._id,
    });
  }

  const resultCount = await Result.countDocuments({ student: student._id });
  if (!resultCount) {
    await Result.create({
      student: student._id,
      classRoom: classRoom._id,
      examName: "Unit Test 1",
      term: "Term 1",
      marks: [
        { subject: "English", obtained: 42, total: 50 },
        { subject: "Mathematics", obtained: 46, total: 50 },
        { subject: "Science", obtained: 45, total: 50 },
      ],
      percentage: 88.6,
      grade: "A",
    });
  }

  const feeCount = await FeeRecord.countDocuments({ student: student._id });
  if (!feeCount) {
    await FeeRecord.create({
      student: student._id,
      term: "Quarter 1",
      amount: 12500,
      dueDate: new Date("2026-04-10"),
      status: "partial",
    });
  }

  const notificationCount = await Notification.countDocuments();
  if (!notificationCount) {
    await Notification.create({
      title: "Parent-Teacher Interaction Week",
      message: "PTM sessions begin next Monday. Please schedule your slot through school reception.",
      audience: ["all"],
      createdBy: teacherUser._id,
    });
  }

  console.log("Platform demo data ready.");
  console.log("Teacher login: teacher@jmsschool.com / Portal@123");
  console.log("Student login: student@jmsschool.com / Portal@123");
  console.log("Parent login: parent@jmsschool.com / Portal@123");

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
