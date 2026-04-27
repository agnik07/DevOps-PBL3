const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo,
  className: user.className,
  avatar: user.avatar,
});

const register = async (req, res) => {
  const { name, email, password, role, rollNo, className, avatar } = req.body;
  const userRole = String(role || "").toLowerCase();
  if (!["teacher", "student"].includes(userRole)) {
    return res.status(400).json({ message: "Role must be teacher or student." });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already registered." });

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    role: userRole,
    rollNo: userRole === "student" ? (rollNo || "") : "",
    className: className || "",
    avatar: avatar || "",
  });

  const token = signToken(user._id, user.role);
  return res.status(201).json({ token, user: sanitizeUser(user) });
};

const login = async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials." });
  if (role && user.role !== role) return res.status(401).json({ message: "Invalid role." });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials." });

  const token = signToken(user._id, user.role);
  return res.json({ token, user: sanitizeUser(user) });
};

const me = async (req, res) => res.json({ user: sanitizeUser(req.user) });

module.exports = { register, login, me };
