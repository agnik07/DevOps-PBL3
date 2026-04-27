const Task = require("../models/Task");
const Submission = require("../models/Submission");

const toTaskDtoForStudent = (task, submission) => {
  const base = task.toObject();
  if (!submission) {
    return {
      ...base,
      status: "pending",
      submittedAt: null,
      marks: null,
      feedback: "",
    };
  }
  return {
    ...base,
    status: submission.status || "submitted",
    submittedAt: submission.submittedAt || null,
    marks: submission.marks ?? null,
    feedback: submission.feedback || "",
  };
};

const getTasks = async (req, res) => {
  const tasks = await Task.find()
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
  if (req.user.role === "student") {
    const submissions = await Submission.find({ studentId: req.user._id })
      .select("taskId status submittedAt marks feedback")
      .lean();
    const byTaskId = new Map(submissions.map((s) => [String(s.taskId), s]));
    return res.json(tasks.map((t) => toTaskDtoForStudent(t, byTaskId.get(String(t._id)))));
  }
  return res.json(tasks);
};

const getTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate("createdBy", "name email");
  if (!task) return res.status(404).json({ message: "Task not found." });
  return res.json(task);
};

const createTask = async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject || "",
    deadline: req.body.deadline,
    createdBy: req.user._id,
    file: req.file ? `/uploads/tasks/${req.file.filename}` : "",
  });
  return res.status(201).json(task);
};

const updateTask = async (req, res) => {
  const update = {
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject || "",
    deadline: req.body.deadline,
  };
  if (req.file) update.file = `/uploads/tasks/${req.file.filename}`;
  const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: "Task not found." });
  return res.json(task);
};

const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found." });
  await Submission.deleteMany({ taskId: task._id });
  return res.json({ message: "Task deleted." });
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
