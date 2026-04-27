const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

marksSchema.index({ studentId: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);
