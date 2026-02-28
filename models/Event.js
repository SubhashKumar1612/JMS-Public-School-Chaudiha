const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    location: { type: String, trim: true, default: "JMS Campus" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
