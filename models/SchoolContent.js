const mongoose = require("mongoose");

const schoolContentSchema = new mongoose.Schema(
  {
    schoolName: { type: String, default: "JMS Public School Chaudiha" },
    tagline: { type: String, default: "Nurturing Minds, Building Futures" },
    aboutHistory: {
      type: String,
      default: "JMS Public School Chaudiha has served the community with quality education and values-driven learning.",
    },
    mission: {
      type: String,
      default: "To provide holistic education that empowers students academically, socially, and ethically.",
    },
    vision: {
      type: String,
      default: "To become a center of excellence where every learner reaches their highest potential.",
    },
    principalMessage: {
      type: String,
      default: "Welcome to JMS Public School Chaudiha. We are committed to excellence in education and character development.",
    },
    contactEmail: { type: String, default: "info@jmsschool.com" },
    contactPhone: { type: String, default: "+91-00000-00000" },
    address: { type: String, default: "Chaudiha, India" },
    googleMapEmbedUrl: {
      type: String,
      default:
        "https://www.google.com/maps?q=Chaudiha&output=embed",
    },
    heroImageUrl: { type: String, default: "" },
    heroImagePublicId: { type: String, default: "" },
    admissionTemplateUrl: { type: String, default: "" },
    admissionTemplateName: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchoolContent", schoolContentSchema);
