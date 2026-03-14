const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    classApplyingFor: { type: String, required: true, trim: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", default: null },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["new", "reviewing", "approved", "rejected"], default: "new" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: "" },
    portalEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
