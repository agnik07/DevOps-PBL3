const Submission = require("../models/Submission");
const Task = require("../models/Task");
const Marks = require("../models/Marks");

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const inferSubjectFromTask = (task) => {
  if (!task) return "General";
  if (task.subject) return String(task.subject).trim() || "General";
  const title = String(task.title || "").trim();
  if (!title) return "General";
  // Simple fallback: first token before "-" or ":" often denotes subject/category.
  const head = title.split(/[-:|]/)[0]?.trim();
  return head || "General";
};

const syncMarksForStudentSubject = async ({ studentId, subject }) => {
  const graded = await Submission.find({ studentId, status: "graded" })
    .populate("taskId", "title subject")
    .select("marks taskId");

  const relevant = graded.filter((s) => inferSubjectFromTask(s.taskId) === subject && typeof s.marks === "number");
  const avg = relevant.length ? Math.round(relevant.reduce((sum, s) => sum + s.marks, 0) / relevant.length) : 0;

  await Marks.findOneAndUpdate(
    { studentId, subject },
    { score: avg, remarks: relevant.length ? `Average from ${relevant.length} graded task(s)` : "" },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
};
const getSubmissionsByTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId).select("createdBy");
  if (!task) return res.status(404).json({ message: "Task not found." });

  const query = { taskId: req.params.taskId };
  if (req.user.role === "student") query.studentId = req.user._id;
  if (req.user.role === "teacher" && String(task.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const submissions = await Submission.find(query)
    .populate("studentId", "name email rollNo")
    .populate("taskId", "title deadline");
  return res.json(submissions);
};

const submitTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found." });

  const existing = await Submission.findOne({ taskId: task._id, studentId: req.user._id });
  const now = new Date();
  if (existing && now > task.deadline) {
    return res.status(400).json({ message: "Deadline passed. Resubmission blocked." });
  }

  const payload = {
    taskId: task._id,
    studentId: req.user._id,
    textAnswer: req.body.textAnswer || "",
    submittedAt: now,
    status: "submitted",
  };
  if (req.file) payload.file = `/uploads/submissions/${req.file.filename}`;

  const submission = await Submission.findOneAndUpdate(
    { taskId: task._id, studentId: req.user._id },
    payload,
    { upsert: true, new: true, runValidators: true }
  );
  return res.status(201).json(submission);
};

const gradeSubmission = async (req, res) => {
  const marks = req.body.marks === "" || req.body.marks === undefined ? null : Number(req.body.marks);
  const feedback = req.body.feedback || "";
  const requestedStatus = normalizeStatus(req.body.status);

  const submission = await Submission.findById(req.params.id).populate("taskId", "title subject createdBy deadline");
  if (!submission) return res.status(404).json({ message: "Submission not found." });

  // Teacher may explicitly approve/reject; providing marks implies graded.
  let nextStatus = requestedStatus;
  if (typeof marks === "number" && Number.isFinite(marks)) nextStatus = "graded";
  if (!["approved", "rejected", "graded"].includes(nextStatus)) {
    return res.status(400).json({ message: "Status must be approved, rejected, or graded." });
  }

  submission.marks = typeof marks === "number" && Number.isFinite(marks) ? marks : null;
  submission.feedback = feedback;
  submission.status = nextStatus;
  await submission.save();

  if (submission.status === "graded") {
    const subject = inferSubjectFromTask(submission.taskId);
    await syncMarksForStudentSubject({ studentId: submission.studentId, subject });
  }

  const fresh = await Submission.findById(submission._id)
    .populate("studentId", "name email rollNo className")
    .populate("taskId", "title deadline subject");
  return res.json(fresh);
};

const mySubmissions = async (req, res) => {
  const rows = await Submission.find({ studentId: req.user._id })
    .populate("taskId", "title deadline subject createdBy")
    .sort({ submittedAt: -1, createdAt: -1 });
  return res.json(rows);
};

const teacherSubmissions = async (req, res) => {
  // Primary intent: show submissions "relevant" to this teacher.
  // This project doesn't have a strict task->class mapping, so we:
  // - Prefer tasks created by this teacher
  // - If none exist, fall back to class-based view if teacher has className
  // - If still no filter applies, fall back to showing all submissions (avoids empty portal)
  const teacherTaskIds = await Task.find({ createdBy: req.user._id }).distinct("_id");

  const query = {};
  if (teacherTaskIds.length) {
    query.taskId = { $in: teacherTaskIds };
  } else if (req.user.className) {
    // Class-based fallback: match student className
    const studentIdsInClass = await require("../models/User")
      .find({ role: "student", className: req.user.className })
      .distinct("_id");
    query.studentId = { $in: studentIdsInClass };
  }

  const rows = await Submission.find(query)
    .populate("studentId", "name email rollNo className")
    .populate("taskId", "title deadline subject createdBy")
    .sort({ submittedAt: -1, createdAt: -1 });

  return res.json(rows);
};

module.exports = {
  getSubmissionsByTask,
  submitTask,
  reviewSubmission: gradeSubmission, // backward compat
  gradeSubmission,
  mySubmissions,
  teacherSubmissions,
};
