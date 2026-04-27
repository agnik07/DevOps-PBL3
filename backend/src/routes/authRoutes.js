const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { auth, handleValidation } = require("../middleware/validators");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", auth.register, handleValidation, register);
router.post("/login", auth.login, handleValidation, login);
router.get("/me", protect, me);

module.exports = router;
