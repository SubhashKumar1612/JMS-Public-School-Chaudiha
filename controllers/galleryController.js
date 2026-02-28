const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");
const uploadBufferToCloudinary = require("../utils/cloudinaryUpload");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const getGalleryPhotos = async (_req, res) => {
  const photos = await Gallery.find().sort({ createdAt: -1 });
  res.json(photos);
};

const uploadGalleryPhotos = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Please upload at least one image." });
  }

  const uploads = await Promise.all(
    req.files.map(async (file) => {
      const cloudinaryResult = await uploadBufferToCloudinary(file.buffer, "jms-school/gallery");
      return {
        title: req.body.title || "School Moment",
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        uploadedBy: req.user._id,
      };
    })
  );

  const savedPhotos = await Gallery.insertMany(uploads);
  res.status(201).json(savedPhotos);
};

const deleteGalleryPhoto = async (req, res) => {
  const photo = await Gallery.findById(req.params.id);
  if (!photo) {
    return res.status(404).json({ message: "Photo not found." });
  }

  if (isCloudinaryConfigured() && !photo.cloudinaryId.startsWith("local-")) {
    await cloudinary.uploader.destroy(photo.cloudinaryId);
  }
  await photo.deleteOne();

  res.json({ message: "Photo deleted successfully." });
};

module.exports = { getGalleryPhotos, uploadGalleryPhotos, deleteGalleryPhoto };
