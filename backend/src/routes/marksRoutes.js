const express = require("express");
const { protect, allowTeacher, allowStudent } = require("../middleware/authMiddleware");
const { marks, handleValidation } = require("../middleware/validators");
const { createMark, getStudentMarks, getMyMarks } = require("../controllers/marksController");

const router = express.Router();

router.post("/", protect, allowTeacher, marks, handleValidation, createMark);
router.get("/my", protect, allowStudent, getMyMarks);
router.get("/student/:id", protect, getStudentMarks);

module.exports = router;
