import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import usePublicData from "../utils/usePublicData";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80";

export default function HomePage() {
  const { content } = usePublicData();
  const heroImage = content.heroImageUrl || DEFAULT_HERO_IMAGE;
  const schoolName = content.schoolName || "JMS Public School Chaudiha";
  const tagline =
    content.tagline || "Nurturing minds with values, discipline, and academic excellence.";

  return (
    <>
      <Helmet>
        <title>JMS Public School Chaudiha | Home</title>
      </Helmet>

      <section className="hero-section rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-primary-900 via-primary-700 to-primary-500 text-white shadow-soft">
        <div className="hero-grid grid lg:grid-cols-2 items-center">
          <div className="p-5 sm:p-8 md:p-10">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-title font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {schoolName}
            </motion.h1>
            <p className="mt-4 text-blue-100 text-base sm:text-lg leading-relaxed">{tagline}</p>
            <div className="hero-actions mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
              <a href="/admissions" className="bg-white text-primary-700 px-5 py-2.5 rounded-lg font-semibold text-center w-full sm:w-auto">Apply Now</a>
              <a href="/about" className="border border-white px-5 py-2.5 rounded-lg text-center w-full sm:w-auto">Learn More</a>
            </div>
          </div>
          <img
            src={heroImage}
            alt="School campus"
            className="hero-image w-full h-56 sm:h-72 lg:h-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      <section className="feature-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
        {["Quality Faculty", "Modern Learning", "Holistic Growth"].map((item) => (
          <article key={item} className="bg-white h-full p-5 sm:p-6 rounded-xl shadow-soft hover:-translate-y-1 transition">
            <h3 className="font-display text-lg sm:text-xl text-primary-700">{item}</h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">We foster a future-ready learning environment for every student.</p>
          </article>
        ))}
      </section>
    </>
  );
}
