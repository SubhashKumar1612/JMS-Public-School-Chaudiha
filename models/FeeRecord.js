const mongoose = require("mongoose");

const feeRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    term: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["paid", "partial", "due"], default: "due" },
    paidOn: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeRecord", feeRecordSchema);
