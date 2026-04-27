const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const client = require("prom-client");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Multer setup for submissions
const submissionDir = path.join(__dirname, "..", "uploads", "submissions");
const taskDir = path.join(__dirname, "..", "uploads", "tasks");
if (!fs.existsSync(submissionDir)) fs.mkdirSync(submissionDir, { recursive: true });
if (!fs.existsSync(taskDir)) fs.mkdirSync(taskDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, submissionDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|zip|png|jpg|jpeg/i;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only pdf, doc, docx, zip, png, jpg allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

client.collectDefaultMetrics();

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "academic-management-api" }));
app.get("/api/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes(upload));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

module.exports = app;
