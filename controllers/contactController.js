const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../middleware/asyncHandler");

const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }

  const created = await ContactMessage.create({ name, email, message });
  res.status(201).json({ message: "Message submitted successfully.", id: created._id });
};

const getMessages = async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
};

const deleteMessage = async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return res.status(404).json({ message: "Contact message not found." });
  }

  await message.deleteOne();
  res.json({ message: "Contact message deleted successfully." });
};

module.exports = {
  submitContactForm: asyncHandler(submitContactForm),
  getMessages: asyncHandler(getMessages),
  deleteMessage: asyncHandler(deleteMessage),
};
