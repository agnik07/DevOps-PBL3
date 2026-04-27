const express = require("express");
const { protect, allowStudent, allowTeacher } = require("../middleware/authMiddleware");
const {
  submitTask,
  getSubmissionsByTask,
  reviewSubmission,
  gradeSubmission,
  mySubmissions,
  teacherSubmissions,
} = require("../controllers/submissionController");

const initRoutes = (upload) => {
  const router = express.Router();

  router.post("/:taskId", protect, allowStudent, upload.single("file"), submitTask);
  router.get("/my", protect, allowStudent, mySubmissions);
  router.get("/teacher", protect, allowTeacher, teacherSubmissions);
  router.get("/task/:taskId", protect, getSubmissionsByTask);
  router.put("/:id/grade", protect, allowTeacher, gradeSubmission);
  router.put("/:id/review", protect, allowTeacher, reviewSubmission);

  return router;
};

module.exports = initRoutes;
