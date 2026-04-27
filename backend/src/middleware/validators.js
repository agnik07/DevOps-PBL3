const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  return next();
};

const auth = {
  register: [
    body("name").trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["teacher", "student"]),
  ],
  login: [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
};

const task = [body("title").notEmpty(), body("description").notEmpty(), body("deadline").isISO8601()];
const marks = [body("studentId").isMongoId(), body("subject").notEmpty(), body("score").isFloat({ min: 0, max: 100 })];
const attendanceMark = [body("studentId").isMongoId(), body("status").isIn(["present", "absent"])];

module.exports = { auth, task, marks, attendanceMark, handleValidation };
