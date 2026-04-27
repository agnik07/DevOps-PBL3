const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");

const getStudents = async (req, res) => {
  const { search = "", className = "", page = 1, limit = 10 } = req.query;
  const query = { role: "student" };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { rollNo: { $regex: search, $options: "i" } },
    ];
  }
  if (className) query.className = className;
  const skip = (Number(page) - 1) * Number(limit);
  const [rows, total] = await Promise.all([
    User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  return res.json({ data: rows, pagination: { page: Number(page), limit: Number(limit), total } });
};

const getStudentProfile = async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: "student" }).select("-password");
  if (!student) return res.status(404).json({ message: "Student not found." });
  const [attendance, marks] = await Promise.all([
    Attendance.find({ studentId: student._id }),
    Marks.find({ studentId: student._id }),
  ]);
  const attendancePct = attendance.length
    ? Math.round((attendance.filter((a) => a.status === "present").length / attendance.length) * 100)
    : 0;
  const avgMarks = marks.length ? Math.round(marks.reduce((sum, m) => sum + m.score, 0) / marks.length) : 0;
  return res.json({ student, attendancePct, avgMarks });
};

module.exports = { getStudents, getStudentProfile };

