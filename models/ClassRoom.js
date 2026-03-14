const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "" },
  },
  { _id: false }
);

const classRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    academicYear: { type: String, default: "2026-27" },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    subjects: { type: [subjectSchema], default: [] },
    schedule: {
      type: [
        new mongoose.Schema(
          {
            day: String,
            slots: [
              new mongoose.Schema(
                {
                  time: String,
                  subject: String,
                  teacherName: String,
                },
                { _id: false }
              ),
            ],
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassRoom", classRoomSchema);
