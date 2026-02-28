const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "School Moment" },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
