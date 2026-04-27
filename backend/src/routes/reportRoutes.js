const express = require("express");
const { protect, allowTeacher } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  studentPdf,
  allPdf,
  allCsv,
  allExcel,
  studentReport,
  allStudentsReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/student/:id", protect, studentReport);
router.get("/all-students", protect, allowTeacher, allStudentsReport);
router.get("/student/:id/pdf", protect, studentPdf);
router.get("/all/pdf", protect, allowTeacher, allPdf);
router.get("/all/csv", protect, allowTeacher, allCsv);
router.get("/all/excel", protect, allowTeacher, allExcel);

module.exports = router;
