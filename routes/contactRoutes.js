const express = require("express");
const {
  submitContactForm,
  getMessages,
  deleteMessage,
} = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", submitContactForm);
router.get("/messages", protect, authorize("admin"), getMessages);
router.delete("/messages/:id", protect, authorize("admin"), deleteMessage);

module.exports = router;
