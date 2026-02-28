const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const uploadBufferToCloudinary = (buffer, folder = "jms-school", options = {}) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      const base64 = buffer.toString("base64");
      return resolve({
        secure_url: `data:${options.mimeType || "application/octet-stream"};base64,${base64}`,
        public_id: `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

module.exports = uploadBufferToCloudinary;
