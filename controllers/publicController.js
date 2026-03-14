const SchoolContent = require("../models/SchoolContent");
const Notice = require("../models/Notice");
const Event = require("../models/Event");
const Gallery = require("../models/Gallery");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const StudyMaterial = require("../models/StudyMaterial");
const Notification = require("../models/Notification");
const Admission = require("../models/Admission");
const asyncHandler = require("../middleware/asyncHandler");

const getPublicOverview = async (_req, res) => {
  const [content, notices, events, gallery, faculty, materials, notifications] = await Promise.all([
    SchoolContent.findOne(),
    Notice.find().sort({ isPinned: -1, createdAt: -1 }).limit(5),
    Event.find().sort({ eventDate: 1 }).limit(5),
    Gallery.find().sort({ createdAt: -1 }).limit(8),
    Teacher.find().populate("user", "name").sort({ createdAt: -1 }).limit(6),
    StudyMaterial.find().sort({ createdAt: -1 }).limit(6),
    Notification.find().sort({ createdAt: -1 }).limit(6),
  ]);

  res.json({
    content,
    notices,
    events,
    gallery,
    faculty,
    materials,
    notifications,
  });
};

const searchPublicContent = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) {
    return res.json({ notices: [], events: [], faculty: [], materials: [] });
  }

  const regex = new RegExp(q, "i");
  const [notices, events, users, materials] = await Promise.all([
    Notice.find({ $or: [{ title: regex }, { description: regex }] }).limit(10),
    Event.find({ $or: [{ title: regex }, { description: regex }, { location: regex }] }).limit(10),
    User.find({ role: "teacher", name: regex }).select("name email").limit(10),
    StudyMaterial.find({ $or: [{ title: regex }, { description: regex }, { subject: regex }] }).limit(10),
  ]);

  res.json({ notices, events, faculty: users, materials });
};

const createPublicAdmission = async (req, res) => {
  const { studentName, parentName, email, phone, classApplyingFor, notes } = req.body;
  if (!studentName || !parentName || !email || !phone || !classApplyingFor) {
    return res.status(400).json({ message: "All admission fields are required." });
  }

  const admission = await Admission.create({
    studentName,
    parentName,
    email,
    phone,
    classApplyingFor,
    notes: notes || "",
  });

  res.status(201).json({ message: "Admission application submitted.", id: admission._id });
};

module.exports = {
  getPublicOverview: asyncHandler(getPublicOverview),
  searchPublicContent: asyncHandler(searchPublicContent),
  createPublicAdmission: asyncHandler(createPublicAdmission),
};
