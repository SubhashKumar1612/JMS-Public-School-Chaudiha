const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

dotenv.config();
connectDB();

const app = express();

// Security headers for production-ready hardening
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Basic brute-force protection for admin login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again later." },
});

app.use("/api/auth/login", loginLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "JMS School API is running." });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


