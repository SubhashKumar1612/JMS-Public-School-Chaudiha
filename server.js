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

const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (curl/Postman) where origin can be undefined.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Security headers for production-ready hardening
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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


