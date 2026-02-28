const express = require("express");
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getNotices);
router.post("/", protect, authorize("admin"), createNotice);
router.put("/:id", protect, authorize("admin"), updateNotice);
router.delete("/:id", protect, authorize("admin"), deleteNotice);

module.exports = router;
