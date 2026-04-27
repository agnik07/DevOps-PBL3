const Marks = require("../models/Marks");
const Submission = require("../models/Submission");

const getStudentMarks = async (req, res) => {
  const studentId = req.params.id === "me" ? req.user._id : req.params.id;
  if (req.user.role === "student" && String(studentId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const marks = await Marks.find({ studentId }).sort({ updatedAt: -1 });
  return res.json(marks);
};

const getMyMarks = async (req, res) => {
  const graded = await Submission.find({ studentId: req.user._id, status: "graded" })
    .populate("taskId", "title deadline subject")
    .select("taskId marks feedback updatedAt")
    .sort({ updatedAt: -1 });

  const bySubject = new Map();
  for (const s of graded) {
    const subject = String(s.taskId?.subject || "").trim() || "General";
    if (!bySubject.has(subject)) bySubject.set(subject, []);
    bySubject.get(subject).push({
      submissionId: s._id,
      taskId: s.taskId?._id,
      taskTitle: s.taskId?.title || "",
      gradedAt: s.updatedAt,
      marks: s.marks ?? null,
      feedback: s.feedback || "",
    });
  }

  const subjects = Array.from(bySubject.entries()).map(([subject, items]) => {
    const total = items.reduce((sum, it) => sum + (typeof it.marks === "number" ? it.marks : 0), 0);
    const average = items.length ? Math.round(total / items.length) : 0;
    return { subject, total, average, items };
  });

  const overallTotal = subjects.reduce((sum, s) => sum + s.total, 0);
  const overallCount = subjects.reduce((sum, s) => sum + s.items.length, 0);
  const overallAverage = overallCount ? Math.round(overallTotal / overallCount) : 0;

  return res.json({ subjects, summary: { overallTotal, overallAverage, gradedCount: overallCount } });
};

const createMark = async (req, res) => {
  const mark = await Marks.findOneAndUpdate(
    { studentId: req.body.studentId, subject: req.body.subject },
    { score: req.body.score, remarks: req.body.remarks || "" },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return res.status(201).json(mark);
};

module.exports = {
  getStudentMarks,
  getMyMarks,
  createMark,
};
