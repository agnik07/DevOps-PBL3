const Attendance = require("../models/Attendance");
const User = require("../models/User");

const toDayStart = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const requestAttendance = async (req, res) => {
  const date = toDayStart();
  const record = await Attendance.findOneAndUpdate(
    { studentId: req.user._id, date },
    { requestedByStudent: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.status(201).json(record);
};

const markAttendance = async (req, res) => {
  const { studentId, status, date } = req.body;
  const student = await User.findOne({ _id: studentId, role: "student" });
  if (!student) return res.status(404).json({ message: "Student not found." });

  const day = toDayStart(date || new Date());
  const record = await Attendance.findOneAndUpdate(
    { studentId, date: day },
    { status, requestedByStudent: false, confirmedBy: req.user._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.json(record);
};

const getStudentAttendance = async (req, res) => {
  const studentId = req.params.id === "me" ? req.user._id : req.params.id;
  const rows = await Attendance.find({ studentId }).sort({ date: -1 });
  return res.json(rows);
};

const getAllAttendance = async (req, res) => {
  const rows = await Attendance.find()
    .populate("studentId", "name email rollNo className")
    .sort({ date: -1 });
  return res.json(rows);
};

module.exports = { requestAttendance, markAttendance, getStudentAttendance, getAllAttendance };
