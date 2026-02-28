const express = require("express");
const { submitContactForm, getMessages } = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", submitContactForm);
router.get("/messages", protect, authorize("admin"), getMessages);

module.exports = router;
