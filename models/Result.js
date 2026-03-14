const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ClassRoom", required: true },
    examName: { type: String, required: true, trim: true },
    term: { type: String, default: "" },
    marks: {
      type: [
        new mongoose.Schema(
          {
            subject: String,
            obtained: Number,
            total: Number,
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
