const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");

const getStudents = async (req, res) => {
  try {
    const { search, status, role = "student", page = 1, limit = 20, department } = req.query;
    const query = { role: role.toLowerCase(), status: status || "active" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query.department = department;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Compute stats for each
    const studentsWithStats = await Promise.all(users.map(async (user) => {
      const attCount = await Attendance.countDocuments({ studentId: user._id });
      const presentCount = await Attendance.countDocuments({ studentId: user._id, finalStatus: "present" });
      const attPercent = attCount > 0 ? Math.round((presentCount / attCount) * 100) : 0;

      const marks = await Marks.find({ studentId: user._id });
      const avgMarks = marks.length > 0 ? marks.reduce((sum, m) => sum + m.marks, 0) / marks.length : 0;

      return { ...user, attendancePercent: attPercent, marksAverage: Math.round(avgMarks) };
    }));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: studentsWithStats,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });

    const attCount = await Attendance.countDocuments({ studentId: user._id });
    const presentCount = await Attendance.countDocuments({ studentId: user._id, finalStatus: "present" });
    const attPercent = attCount > 0 ? Math.round((presentCount / attCount) * 100) : 0;

    const marks = await Marks.find({ studentId: user._id });
    const avgMarks = marks.length > 0 ? marks.reduce((sum, m) => sum + m.marks, 0) / marks.length : 0;

    res.json({
      success: true,
      data: { ...user.toObject(), attendancePercent: attPercent, marksAverage: Math.round(avgMarks) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.role) delete updates.role; // Prevent role change
    if (updates.email && updates.email !== req.user.email) return res.status(400).json({ success: false, message: 'Email cannot be changed' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudents, getStudentById, updateStudent, deleteStudent };

