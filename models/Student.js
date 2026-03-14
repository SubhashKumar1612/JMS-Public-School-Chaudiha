const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admissionNumber: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", default: null },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", default: null },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    attendancePercentage: { type: Number, default: 0 },
    feeStatus: { type: String, enum: ["paid", "partial", "due"], default: "due" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
