const express = require("express");
const { getPortalDashboard } = require("../controllers/portalController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", protect, authorize("student", "teacher", "parent"), getPortalDashboard);

module.exports = router;
