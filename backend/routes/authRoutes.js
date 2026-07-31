const express = require("express");
const router = express.Router();
const { login, getMe, changePassword } = require("../controllers/authController");
const { enrolFace, verifyFace } = require("../controllers/faceController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/login", login);

// Protected
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

// Face routes — protected (token from password login is enough to call these)
router.post("/face/enrol", protect, enrolFace);
router.post("/face/verify", protect, verifyFace);

module.exports = router;