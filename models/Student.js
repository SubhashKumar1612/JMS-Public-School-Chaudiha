const mongoose = require("mongoose");

const feePlanSnapshotSchema = new mongoose.Schema(
  {
    className: { type: String, default: "" },
    academicYear: { type: String, default: "2026-27" },
    tuitionFee: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    transportEnabled: { type: Boolean, default: true },
    totalMonthlyFee: { type: Number, default: 0 },
    totalYearlyFee: { type: Number, default: 0 },
  },
  { _id: false }
);

const feePlanRevisionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    effectiveMonth: { type: Number, required: true, min: 1, max: 12 },
    revisionDate: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
    previousStructure: { type: feePlanSnapshotSchema, required: true },
    updatedStructure: { type: feePlanSnapshotSchema, required: true },
  },
  { _id: true }
);

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admissionNumber: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", default: null },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", default: null },
    assignedFeeStructure: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure", default: null },
    academicYear: { type: String, default: "2026-27" },
    feePlan: {
      overrideActive: { type: Boolean, default: false },
      startMonth: { type: Number, default: 1 },
      structureSnapshot: { type: feePlanSnapshotSchema, default: null },
      revisions: { type: [feePlanRevisionSchema], default: [] },
    },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    attendancePercentage: { type: Number, default: 0 },
    feeStatus: { type: String, enum: ["paid", "partial", "due"], default: "due" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
