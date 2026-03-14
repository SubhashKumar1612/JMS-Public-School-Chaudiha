const express = require("express");
const {
  getPublicOverview,
  searchPublicContent,
  createPublicAdmission,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/overview", getPublicOverview);
router.get("/search", searchPublicContent);
router.post("/admissions", createPublicAdmission);

module.exports = router;
