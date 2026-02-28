const express = require("express");
const { loginAdmin, getMe } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protect, authorize("admin"), getMe);

module.exports = router;
