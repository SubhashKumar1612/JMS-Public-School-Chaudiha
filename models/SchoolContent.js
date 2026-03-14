const mongoose = require("mongoose");

const schoolContentSchema = new mongoose.Schema(
  {
    schoolName: { type: String, default: "JMS Public School Chaudiha" },
    tagline: { type: String, default: "Nurturing Minds, Building Futures" },
    aboutHistory: {
      type: String,
      default: "JMS Public School Chaudiha has served the community with quality education and values-driven learning.",
    },
    aboutImageUrl: { type: String, default: "" },
    aboutImagePublicId: { type: String, default: "" },
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
    principalName: { type: String, default: "Dr. A. Sharma" },
    principalPhotoUrl: { type: String, default: "" },
    principalPhotoPublicId: { type: String, default: "" },
    schoolHistoryTitle: { type: String, default: "A Legacy of Learning" },
    facultyIntro: {
      type: String,
      default: "Our educators combine subject expertise with mentorship, discipline, and student-first care.",
    },
    admissionsInfo: {
      type: String,
      default: "Admissions remain open for the current academic year. Apply online or visit campus for counseling and document verification.",
    },
    feeStructure: {
      type: [
        new mongoose.Schema(
          {
            label: String,
            amount: String,
            note: String,
          },
          { _id: false }
        ),
      ],
      default: [
        { label: "Admission Fee", amount: "INR 8,000", note: "One time" },
        { label: "Monthly Tuition", amount: "INR 2,500", note: "Per month" },
        { label: "Transport", amount: "INR 1,200", note: "Optional" },
      ],
    },
    academicPrograms: {
      type: [
        new mongoose.Schema(
          {
            title: String,
            description: String,
          },
          { _id: false }
        ),
      ],
      default: [
        { title: "Foundational Stage", description: "Activity-led literacy, numeracy, and social learning for early grades." },
        { title: "Middle School", description: "Concept-driven academics with labs, clubs, and project-based learning." },
        { title: "Senior Secondary", description: "Board preparation, career guidance, and competitive exam mentoring." },
      ],
    },
    downloads: {
      type: [
        new mongoose.Schema(
          {
            title: String,
            fileUrl: String,
            category: String,
          },
          { _id: false }
        ),
      ],
      default: [
        { title: "Admission Form", fileUrl: "/admission-form-template.txt", category: "Admissions" },
        { title: "Academic Syllabus", fileUrl: "#", category: "Academics" },
      ],
    },
    facilities: {
      type: [
        new mongoose.Schema(
          {
            title: String,
            body: String,
          },
          { _id: false }
        ),
      ],
      default: [
        { title: "Smart Classrooms", body: "Interactive lessons with digital boards and multimedia learning tools." },
        { title: "Science Laboratories", body: "Hands-on practical learning in physics, chemistry, and biology labs." },
        { title: "Computer Lab", body: "Technology-enabled learning with coding, research, and digital literacy." },
        { title: "Sports Facilities", body: "Structured physical education with outdoor games and indoor activity zones." },
        { title: "Experienced Teachers", body: "Mentors who combine strong pedagogy with discipline and student care." },
        { title: "Digital Learning", body: "Portal access, study resources, announcements, and academic support online." },
      ],
    },
    testimonials: {
      type: [
        new mongoose.Schema(
          {
            quote: String,
            author: String,
            role: String,
          },
          { _id: false }
        ),
      ],
      default: [
        {
          quote: "The school balances discipline and warmth beautifully. My child has become more confident and independent.",
          author: "Mrs. Pooja Singh",
          role: "Parent",
        },
        {
          quote: "Teachers stay genuinely involved in student growth. The portal and classroom support make learning feel connected.",
          author: "Rohan Kumar",
          role: "Student",
        },
        {
          quote: "Admissions, updates, and communication are all much clearer here. It feels like a school with vision and structure.",
          author: "Mr. Amit Yadav",
          role: "Parent",
        },
      ],
    },
    highlights: {
      type: [
        new mongoose.Schema(
          {
            title: String,
            value: String,
          },
          { _id: false }
        ),
      ],
      default: [
        { title: "Students", value: "1,200+" },
        { title: "Faculty", value: "65+" },
        { title: "Board Results", value: "98%" },
      ],
    },
    contactEmail: { type: String, default: "info@jmsschool.com" },
    contactPhone: { type: String, default: "+91-00000-00000" },
    address: { type: String, default: "Chaudiha, India" },
    contactImageUrl: { type: String, default: "" },
    contactImagePublicId: { type: String, default: "" },
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
