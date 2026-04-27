const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect, allowTeacherOrAdmin } = require("../middleware/authMiddleware");
const { task, handleValidation } = require("../middleware/validators");
const { getTasks, getTask, createTask, updateTask, deleteTask } = require("../controllers/taskController");

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../uploads/tasks"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

router.get("/", protect, getTasks);
router.get("/:id", protect, getTask);
router.post("/", protect, allowTeacherOrAdmin, upload.single("file"), task, handleValidation, createTask);
router.put("/:id", protect, allowTeacherOrAdmin, upload.single("file"), task, handleValidation, updateTask);
router.delete("/:id", protect, allowTeacherOrAdmin, deleteTask);

module.exports = router;
