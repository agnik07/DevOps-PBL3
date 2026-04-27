const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");
const Task = require("../models/Task");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

const writeSimplePdf = (res, title, lines) => {
  const doc = new PDFDocument({ margin: 32 });
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.fontSize(18).text(title).moveDown();
  lines.forEach((line) => doc.fontSize(11).text(line));
  doc.end();
};

const attendanceSummary = (rows) => {
  const presentDays = rows.filter((a) => a.status === "present").length;
  const absentDays = rows.filter((a) => a.status === "absent").length;
  const total = presentDays + absentDays;
  const percentage = total ? Math.round((presentDays / total) * 100) : 0;
  return { presentDays, absentDays, percentage };
};

const buildStudentReport = async (studentId) => {
  const student = await User.findOne({ _id: studentId, role: "student" }).select("-password");
  if (!student) return null;

  const [attendance, marks, submissions, totalTasks] = await Promise.all([
    Attendance.find({ studentId: student._id }),
    Marks.find({ studentId: student._id }).sort({ updatedAt: -1 }),
    Submission.find({ studentId: student._id })
      .populate("taskId", "title description deadline subject createdBy")
      .sort({ submittedAt: -1, createdAt: -1 }),
    Task.countDocuments(),
  ]);

  const attendanceStats = attendanceSummary(attendance);
  const tasksSubmitted = submissions.filter((s) => ["submitted", "approved", "rejected", "graded"].includes(s.status)).length;
  const tasksGraded = submissions.filter((s) => s.status === "graded").length;
  const gradedMarks = submissions.filter((s) => s.status === "graded" && typeof s.marks === "number").map((s) => s.marks);
  const averageMarks = gradedMarks.length ? Math.round(gradedMarks.reduce((sum, v) => sum + v, 0) / gradedMarks.length) : 0;

  return {
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      rollNo: student.rollNo,
      className: student.className,
    },
    attendance: attendanceStats,
    marks: marks.map((m) => ({ id: m._id, subject: m.subject, score: m.score, remarks: m.remarks, updatedAt: m.updatedAt })),
    submissions: submissions.map((s) => ({
      id: s._id,
      status: s.status,
      submittedAt: s.submittedAt,
      marks: s.marks ?? null,
      feedback: s.feedback || "",
      file: s.file || "",
      task: s.taskId
        ? {
            id: s.taskId._id,
            title: s.taskId.title,
            subject: s.taskId.subject || "",
            deadline: s.taskId.deadline,
          }
        : null,
    })),
    summary: {
      tasksAssigned: totalTasks,
      tasksSubmitted,
      tasksGraded,
      averageMarks,
    },
  };
};

const getDashboardStats = async (req, res) => {
  if (req.user.role === "teacher") {
    const [totalStudents, tasksAssigned, submissionsPending] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Task.countDocuments({ createdBy: req.user._id }),
      Submission.countDocuments({ status: { $in: ["submitted", "pending"] } }),
    ]);
    const marks = await Marks.find();
    const averageMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length) : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceToday = await Attendance.countDocuments({ date: today, status: "present" });
    return res.json({ totalStudents, tasksAssigned, submissionsPending, attendanceToday, averageMarks });
  }

  const [submissions, attendance, marks, taskCount] = await Promise.all([
    Submission.find({ studentId: req.user._id }),
    Attendance.find({ studentId: req.user._id }),
    Marks.find({ studentId: req.user._id }),
    Task.countDocuments(),
  ]);
  const completedTasks = submissions.length;
  const pendingTasks = Math.max(taskCount - completedTasks, 0);
  const attendancePercent = attendance.length
    ? Math.round((attendance.filter((a) => a.status === "present").length / attendance.length) * 100)
    : 0;
  const marksAverage = marks.length ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length) : 0;
  return res.json({ pendingTasks, completedTasks, attendancePercent, marksAverage });
};

const studentPdf = async (req, res) => {
  const id = req.params.id === "me" ? req.user._id : req.params.id;
  if (req.user.role === "student" && String(id) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const report = await buildStudentReport(id);
  if (!report) return res.status(404).json({ message: "Student not found." });

  const lines = [
    `Name: ${report.student.name}`,
    `Email: ${report.student.email}`,
    `Roll No: ${report.student.rollNo || "-"}`,
    `Class: ${report.student.className || "-"}`,
    `Attendance: ${report.attendance.percentage}% (Present ${report.attendance.presentDays}, Absent ${report.attendance.absentDays})`,
    `Tasks Assigned: ${report.summary.tasksAssigned}`,
    `Tasks Submitted: ${report.summary.tasksSubmitted}`,
    `Tasks Graded: ${report.summary.tasksGraded}`,
    `Average Marks (graded): ${report.summary.averageMarks}`,
    "",
    "Marks by Subject:",
    ...(report.marks.length ? report.marks.map((m) => `- ${m.subject}: ${m.score} (${m.remarks || "no remarks"})`) : ["- None"]),
    "",
    "Recent Submissions:",
    ...(report.submissions.slice(0, 10).map((s) => `- ${s.task?.title || "Unknown task"}: ${s.status}${s.marks !== null ? ` (${s.marks})` : ""}`) || []),
  ];
  writeSimplePdf(res, `Student Report - ${report.student.name}`, lines);
};

const allPdf = async (req, res) => {
  const students = await User.find({ role: "student" }).select("name email rollNo className");
  const lines = students.map((s) => `${s.name} | ${s.email} | ${s.rollNo || "-"} | ${s.className || "-"}`);
  writeSimplePdf(res, "All Students Report", lines.length ? lines : ["No students found"]);
};

const allCsv = async (req, res) => {
  const students = await User.find({ role: "student" }).select("name email rollNo className");
  const csv = new Parser({ fields: ["name", "email", "rollNo", "className"] }).parse(
    students.map((s) => s.toObject())
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=students.csv");
  return res.send(csv);
};

const allExcel = async (req, res) => {
  const students = await User.find({ role: "student" }).select("name email rollNo className");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Students");
  ws.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Roll No", key: "rollNo", width: 15 },
    { header: "Class", key: "className", width: 20 },
  ];
  students.forEach((s) => ws.addRow(s.toObject()));
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
  await wb.xlsx.write(res);
  res.end();
};

const studentReport = async (req, res) => {
  const id = req.params.id === "me" ? req.user._id : req.params.id;
  if (req.user.role === "student" && String(id) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const report = await buildStudentReport(id);
  if (!report) return res.status(404).json({ message: "Student not found." });
  return res.json(report);
};

const allStudentsReport = async (req, res) => {
  const students = await User.find({ role: "student" }).select("_id");
  const reports = (await Promise.all(students.map((s) => buildStudentReport(s._id)))).filter(Boolean);
  return res.json(reports);
};

module.exports = {
  getDashboardStats,
  studentPdf,
  allPdf,
  allCsv,
  allExcel,
  studentReport,
  allStudentsReport,
};
