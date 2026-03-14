const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, default: "" },
    qualification: { type: String, default: "" },
    designation: { type: String, default: "Teacher" },
    subjects: { type: [String], default: [] },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
