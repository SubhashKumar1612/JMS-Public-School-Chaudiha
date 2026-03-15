const mongoose = require("mongoose");

const toMoney = (value) => {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const feeStructureSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", default: null },
    tuitionFee: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    transportEnabled: { type: Boolean, default: true },
    totalMonthlyFee: { type: Number, default: 0 },
    totalYearlyFee: { type: Number, default: 0 },
    totalFee: { type: Number, default: 0 },
    academicYear: { type: String, default: "2026-27", trim: true },
  },
  { timestamps: true }
);

feeStructureSchema.index({ className: 1, academicYear: 1 }, { unique: true });

feeStructureSchema.pre("validate", function updateTotal(next) {
  this.tuitionFee = toMoney(this.tuitionFee);
  this.transportFee = toMoney(this.transportFee);
  this.libraryFee = toMoney(this.libraryFee);
  this.examFee = toMoney(this.examFee);
  this.otherCharges = toMoney(this.otherCharges);
  if (!this.transportEnabled) {
    this.transportFee = 0;
  }
  this.totalMonthlyFee = [
    this.tuitionFee,
    this.transportFee,
    this.libraryFee,
    this.examFee,
    this.otherCharges,
  ].reduce((sum, value) => sum + value, 0);
  this.totalYearlyFee = toMoney(this.totalMonthlyFee * 12);
  this.totalFee = this.totalYearlyFee;
  next();
});

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
