const Event = require("../models/Event");

const getEvents = async (_req, res) => {
  const events = await Event.find().sort({ eventDate: 1 });
  res.json(events);
};

const createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
};

const updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) return res.status(404).json({ message: "Event not found." });
  res.json(event);
};

const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });

  await event.deleteOne();
  res.json({ message: "Event deleted successfully." });
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
