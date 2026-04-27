const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["teacher", "student"], required: true },
    rollNo: { type: String, trim: true, default: "" },
    className: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, className: 1 });
userSchema.index({ rollNo: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
