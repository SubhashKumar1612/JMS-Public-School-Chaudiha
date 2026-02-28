const mongoose = require("mongoose");

const connectDB = async () => {
  const localUri = "mongodb://127.0.0.1:27017/jms_school";
  const uris = [];

  if (process.env.MONGO_URI) {
    uris.push(process.env.MONGO_URI);
  }
  if (!process.env.MONGO_URI || process.env.MONGO_URI !== localUri) {
    uris.push(localUri);
  }

  let lastError;
  for (const uri of uris) {
    try {
      const conn = await mongoose.connect(uri);
      if (uri === localUri) {
        console.log("Connected to local MongoDB.");
      } else {
        console.log("Connected to JMS Cloud.");
      }
      if (uri === localUri && process.env.MONGO_URI) {
        console.log("Primary cloud URI failed, connected to local MongoDB fallback.");
      }
      return;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection failed for URI (${uri}): ${error.message}`);
    }
  }

  console.error(`Database connection error: ${lastError?.message || "Unknown error"}`);
  process.exit(1);
};

module.exports = connectDB;
