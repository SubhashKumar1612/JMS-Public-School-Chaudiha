const ContactMessage = require("../models/ContactMessage");

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

module.exports = { submitContactForm, getMessages };
