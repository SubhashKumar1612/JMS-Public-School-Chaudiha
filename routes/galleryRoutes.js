const express = require("express");
const {
  getGalleryPhotos,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
} = require("../controllers/galleryController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getGalleryPhotos);
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  uploadGalleryPhotos
);
router.delete("/:id", protect, authorize("admin"), deleteGalleryPhoto);

module.exports = router;
