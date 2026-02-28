const express = require("express");
const {
  getContent,
  updateContent,
  uploadAdmissionTemplate,
  uploadHeroImage,
  deleteHeroImage,
} = require("../controllers/contentController");
const { protect, authorize } = require("../middleware/auth");
const uploadDocs = require("../middleware/uploadDocs");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getContent);
router.put("/", protect, authorize("admin"), updateContent);
router.post(
  "/admission-template",
  protect,
  authorize("admin"),
  uploadDocs.single("template"),
  uploadAdmissionTemplate
);
router.post(
  "/hero-image",
  protect,
  authorize("admin"),
  upload.single("image"),
  uploadHeroImage
);
router.delete("/hero-image", protect, authorize("admin"), deleteHeroImage);

module.exports = router;
