const SchoolContent = require("../models/SchoolContent");
const cloudinary = require("../config/cloudinary");
const uploadBufferToCloudinary = require("../utils/cloudinaryUpload");

const getOrCreateContent = async () => {
  let content = await SchoolContent.findOne();
  if (!content) content = await SchoolContent.create({});
  return content;
};

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const getContent = async (_req, res) => {
  const content = await getOrCreateContent();
  res.json(content);
};

const updateContent = async (req, res) => {
  const content = await getOrCreateContent();

  Object.keys(req.body).forEach((key) => {
    content[key] = req.body[key];
  });

  const updated = await content.save();
  res.json(updated);
};

const uploadAdmissionTemplate = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a template file." });
  }

  const content = await getOrCreateContent();
  const cloudinaryResult = await uploadBufferToCloudinary(
    req.file.buffer,
    "jms-school/admission-templates",
    { resource_type: "auto", mimeType: req.file.mimetype }
  );

  content.admissionTemplateUrl = cloudinaryResult.secure_url;
  content.admissionTemplateName = req.file.originalname;
  const updated = await content.save();

  res.status(201).json(updated);
};

const uploadHeroImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a hero image file." });
  }

  const content = await getOrCreateContent();

  if (
    isCloudinaryConfigured() &&
    content.heroImagePublicId &&
    !content.heroImagePublicId.startsWith("local-")
  ) {
    await cloudinary.uploader.destroy(content.heroImagePublicId);
  }

  const cloudinaryResult = await uploadBufferToCloudinary(
    req.file.buffer,
    "jms-school/hero-images",
    { resource_type: "image", mimeType: req.file.mimetype }
  );

  content.heroImageUrl = cloudinaryResult.secure_url;
  content.heroImagePublicId = cloudinaryResult.public_id;
  const updated = await content.save();

  res.status(201).json(updated);
};

const deleteHeroImage = async (_req, res) => {
  const content = await getOrCreateContent();

  if (
    isCloudinaryConfigured() &&
    content.heroImagePublicId &&
    !content.heroImagePublicId.startsWith("local-")
  ) {
    await cloudinary.uploader.destroy(content.heroImagePublicId);
  }

  content.heroImageUrl = "";
  content.heroImagePublicId = "";
  const updated = await content.save();

  res.json(updated);
};

module.exports = {
  getContent,
  updateContent,
  uploadAdmissionTemplate,
  uploadHeroImage,
  deleteHeroImage,
};
