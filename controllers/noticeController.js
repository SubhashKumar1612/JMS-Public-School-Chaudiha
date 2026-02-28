const Notice = require("../models/Notice");

const getNotices = async (_req, res) => {
  const notices = await Notice.find().sort({ isPinned: -1, createdAt: -1 });
  res.json(notices);
};

const createNotice = async (req, res) => {
  const notice = await Notice.create(req.body);
  res.status(201).json(notice);
};

const updateNotice = async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!notice) return res.status(404).json({ message: "Notice not found." });
  res.json(notice);
};

const deleteNotice = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ message: "Notice not found." });

  await notice.deleteOne();
  res.json({ message: "Notice deleted successfully." });
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
