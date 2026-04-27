const express = require("express");
const { protect, allowTeacher, allowStudent } = require("../middleware/authMiddleware");
const { attendanceMark, handleValidation } = require("../middleware/validators");
const { requestAttendance, markAttendance, getStudentAttendance, getAllAttendance } = require("../controllers/attendanceController");

const router = express.Router();

router.post("/request", protect, allowStudent, requestAttendance);
router.post("/mark", protect, allowTeacher, attendanceMark, handleValidation, markAttendance);
router.get("/student/:id", protect, getStudentAttendance);
router.get("/all", protect, allowTeacher, getAllAttendance);

module.exports = router;
