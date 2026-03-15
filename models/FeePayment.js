const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure", default: null },
    paymentDate: { type: Date, required: true },
    paymentMonth: { type: String, required: true, trim: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "online", "bank"], required: true },
    receiptNumber: { type: String, required: true, trim: true, unique: true },
    paymentStatus: { type: String, enum: ["paid", "partial", "pending"], required: true, default: "partial" },
    remainingBalance: { type: Number, required: true, min: 0 },
    academicYear: { type: String, default: "2026-27", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

feePaymentSchema.index({ studentId: 1, paymentDate: -1 });
feePaymentSchema.index({ paymentMonth: 1, academicYear: 1 });

module.exports = mongoose.model("FeePayment", feePaymentSchema);
