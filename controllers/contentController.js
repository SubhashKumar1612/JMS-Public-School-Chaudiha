const SchoolContent = require("../models/SchoolContent");
const cloudinary = require("../config/cloudinary");
const uploadBufferToCloudinary = require("../utils/cloudinaryUpload");
const asyncHandler = require("../middleware/asyncHandler");

const getOrCreateContent = async () => {
  let content = await SchoolContent.findOne();
  if (!content) content = await SchoolContent.create({});
  if (typeof content.facilities === "undefined") {
    content.facilities = SchoolContent.schema.path("facilities").defaultValue;
  }
  if (typeof content.testimonials === "undefined") {
    content.testimonials = SchoolContent.schema.path("testimonials").defaultValue;
  }
  if (content.isModified()) {
    await content.save();
  }
  return content;
};

const imageFieldConfig = {
  heroImage: { url: "heroImageUrl", publicId: "heroImagePublicId", folder: "jms-school/hero-images" },
  aboutImage: { url: "aboutImageUrl", publicId: "aboutImagePublicId", folder: "jms-school/about-images" },
  principalPhoto: { url: "principalPhotoUrl", publicId: "principalPhotoPublicId", folder: "jms-school/principal-photo" },
  contactImage: { url: "contactImageUrl", publicId: "contactImagePublicId", folder: "jms-school/contact-images" },
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

const uploadContentImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image file." });
  }

  const field = req.body.field;
  const config = imageFieldConfig[field];

  if (!config) {
    return res.status(400).json({ message: "Invalid image field." });
  }

  const content = await getOrCreateContent();

  if (
    isCloudinaryConfigured() &&
    content[config.publicId] &&
    !content[config.publicId].startsWith("local-")
  ) {
    await cloudinary.uploader.destroy(content[config.publicId]);
  }

  const uploaded = await uploadBufferToCloudinary(req.file.buffer, config.folder, {
    resource_type: "image",
    mimeType: req.file.mimetype,
  });

  content[config.url] = uploaded.secure_url;
  content[config.publicId] = uploaded.public_id;
  const updated = await content.save();

  res.status(201).json(updated);
};

const deleteContentImage = async (req, res) => {
  const field = req.query.field || req.body.field;
  const config = imageFieldConfig[field];

  if (!config) {
    return res.status(400).json({ message: "Invalid image field." });
  }

  const content = await getOrCreateContent();

  if (
    isCloudinaryConfigured() &&
    content[config.publicId] &&
    !content[config.publicId].startsWith("local-")
  ) {
    await cloudinary.uploader.destroy(content[config.publicId]);
  }

  content[config.url] = "";
  content[config.publicId] = "";
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
  getContent: asyncHandler(getContent),
  updateContent: asyncHandler(updateContent),
  uploadContentImage: asyncHandler(uploadContentImage),
  deleteContentImage: asyncHandler(deleteContentImage),
  uploadAdmissionTemplate: asyncHandler(uploadAdmissionTemplate),
  uploadHeroImage: asyncHandler(uploadHeroImage),
  deleteHeroImage: asyncHandler(deleteHeroImage),
};
