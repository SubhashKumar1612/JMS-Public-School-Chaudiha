const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    occupation: { type: String, default: "" },
    address: { type: String, default: "" },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", parentSchema);
