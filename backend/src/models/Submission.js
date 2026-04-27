const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    file: { type: String, default: "" },
    textAnswer: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    marks: { type: Number, default: null },
    feedback: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected", "graded"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ taskId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
