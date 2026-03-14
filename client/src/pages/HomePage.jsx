import { useDeferredValue, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80";
const DEFAULT_PRINCIPAL_IMAGE =
  "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80";
const DEFAULT_CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80";

const quickAccess = [
  { title: "Student Portal", icon: "01", body: "Timetable, attendance, homework, exam results, and materials in one secure place.", link: "/portal/login" },
  { title: "Teacher Workspace", icon: "02", body: "Assignments, attendance registers, study materials, and class updates.", link: "/portal/login" },
  { title: "Parent Connect", icon: "03", body: "Follow your child’s attendance, notifications, progress, and fee records.", link: "/portal/login" },
  { title: "Admissions Desk", icon: "04", body: "Online applications, counseling, downloadable forms, and onboarding guidance.", link: "/admissions" },
];

const defaultFacilityCards = [
  { title: "Smart Classrooms", body: "Interactive lessons with digital boards and multimedia learning tools." },
  { title: "Science Laboratories", body: "Hands-on practical learning in physics, chemistry, and biology labs." },
  { title: "Computer Lab", body: "Technology-enabled learning with coding, research, and digital literacy." },
  { title: "Sports Facilities", body: "Structured physical education with outdoor games and indoor activity zones." },
  { title: "Experienced Teachers", body: "Mentors who combine strong pedagogy with discipline and student care." },
  { title: "Digital Learning", body: "Portal access, study resources, announcements, and academic support online." },
];

const defaultTestimonials = [
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
];

function StatTile({ label, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <p className="font-display text-4xl text-primary-700">{value}</p>
      <p className="mt-2 text-sm uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { loading, content, events, notices, faculty, notifications, gallery } = usePublicData();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const searchResults = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    const regex = new RegExp(deferredQuery, "i");
    return [
      ...notices.filter((item) => regex.test(item.title) || regex.test(item.description)).map((item) => ({ type: "Notice", title: item.title })),
      ...events.filter((item) => regex.test(item.title) || regex.test(item.description)).map((item) => ({ type: "Event", title: item.title })),
      ...faculty.filter((item) => regex.test(item.user?.name || "") || regex.test(item.department || "")).map((item) => ({ type: "Faculty", title: item.user?.name || "Faculty Member" })),
    ].slice(0, 6);
  }, [deferredQuery, notices, events, faculty]);

  const stats = useMemo(() => {
    const studentHighlight = content.highlights?.find((item) => /student/i.test(item.title));
    const teacherHighlight = content.highlights?.find((item) => /faculty|teacher/i.test(item.title));
    return {
      students: studentHighlight?.value || "1,200+",
      teachers: teacherHighlight?.value || `${faculty.length || 65}+`,
      years: "25+",
      achievements: "150+",
    };
  }, [content.highlights, faculty.length]);

  const facilities = content.facilities?.length ? content.facilities : defaultFacilityCards;
  const testimonials = content.testimonials?.length ? content.testimonials : defaultTestimonials;

  if (loading) return <Loader variant="skeleton-cards" count={10} text="Loading school platform..." />;

  return (
    <>
      <Helmet>
        <title>{content.schoolName} | School Management Platform</title>
        <meta
          name="description"
          content="Official school website with admissions, academics, faculty, campus life, announcements, events, gallery, and secure role-based portals."
        />
      </Helmet>

      <section className="hero-section overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <div className="hero-grid grid items-stretch lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.35),_rgba(12,79,168,0.98)_55%)] p-6 text-white sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_55%)]" />
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Integrated School Platform</p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-title mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl"
              >
                {content.schoolName}
              </motion.h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-50 sm:text-lg">{content.tagline}</p>
              <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/admissions")}
                  className="relative z-20 rounded-xl bg-white px-5 py-3 text-center font-semibold text-primary-700"
                >
                  Apply Online
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/portal/login")}
                  className="relative z-20 rounded-xl border border-white/60 px-5 py-3 text-center"
                >
                  Open Portal
                </button>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(content.highlights || []).map((item) => (
                  <article key={item.title} className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
                    <p className="text-2xl font-display">{item.value}</p>
                    <p className="mt-1 text-sm text-blue-100">{item.title}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="grid content-stretch bg-slate-100 dark:bg-slate-900">
            <img src={content.heroImageUrl || DEFAULT_HERO_IMAGE} alt="School life" className="hero-image h-full min-h-[320px] w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Quick Access</p>
            <h2 className="mt-2 font-display text-3xl">Everything the school community needs, right away</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {quickAccess.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 font-display text-lg text-primary-700 dark:bg-slate-900">
                  {item.icon}
                </span>
                <span className="text-primary-700 transition group-hover:translate-x-1">→</span>
              </div>
              <h3 className="mt-5 font-display text-2xl text-primary-700">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <img src={content.aboutImageUrl || DEFAULT_ABOUT_IMAGE} alt="Students on campus" className="h-full min-h-[320px] w-full object-cover" loading="lazy" />
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.18em] text-primary-700">About the School</p>
          <h2 className="mt-2 font-display text-3xl">A values-driven institution with academic ambition</h2>
          <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
            {content.aboutHistory}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.14em] text-primary-700">Mission</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{content.mission}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.14em] text-primary-700">Vision</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{content.vision}</p>
            </div>
          </div>
          <Link to="/about" className="mt-6 inline-flex rounded-xl bg-primary-700 px-5 py-3 text-white">
            Read More
          </Link>
        </article>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <img src={content.principalPhotoUrl || DEFAULT_PRINCIPAL_IMAGE} alt={content.principalName} className="h-full min-h-[320px] w-full object-cover" loading="lazy" />
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Principal's Message</p>
          <h2 className="mt-2 font-display text-3xl">{content.principalName}</h2>
          <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">{content.principalMessage}</p>
          <div className="mt-6 rounded-2xl bg-primary-50 p-5 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-[0.16em] text-primary-700">Our Promise</p>
            <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
              We aim to shape capable, disciplined, and compassionate learners through a culture of excellence, structure, and care.
            </p>
          </div>
        </article>
      </section>

      <section id="facilities" className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Why Choose Our School</p>
        <h2 className="mt-2 font-display text-3xl">A campus designed for deep learning and balanced growth</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {facilities.map((item, index) => (
            <article key={item.title} className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white font-display text-primary-700 shadow dark:bg-slate-800">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-display text-2xl text-primary-700">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary-700">School Highlights</p>
            <h2 className="mt-2 font-display text-3xl">Numbers that reflect our scale and consistency</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total Students" value={stats.students} />
          <StatTile label="Teachers" value={stats.teachers} />
          <StatTile label="Years of Excellence" value={stats.years} />
          <StatTile label="Achievements" value={stats.achievements} />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Latest News</p>
              <h2 className="mt-2 font-display text-3xl">Announcements, schedules, and school updates</h2>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campus updates"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 lg:max-w-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="mt-5 grid gap-4">
            {(searchResults.length
              ? searchResults
              : notices.map((item) => ({ type: "Notice", title: item.title, body: item.description }))
            )
              .slice(0, 6)
              .map((item) => (
                <article key={`${item.type}-${item.title}`} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-700">{item.type}</p>
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  {item.body ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.body}</p> : null}
                </article>
              ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Live Bulletin</p>
          <h2 className="mt-2 font-display text-3xl">This week's important updates</h2>
          <div className="mt-5 space-y-4">
            {(notifications.length ? notifications : notices).slice(0, 5).map((item, index) => (
              <div key={item._id || `${item.title}-${index}`} className="flex gap-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <span className="mt-1 h-3 w-3 rounded-full bg-primary-600" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.message || item.description ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message || item.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Upcoming Events</p>
            <h2 className="mt-2 font-display text-3xl">A lively campus calendar throughout the year</h2>
          </div>
          <Link to="/events" className="text-sm font-medium text-primary-700">View all events</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.slice(0, 6).map((item) => (
            <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm uppercase tracking-[0.16em] text-primary-700">{new Date(item.eventDate).toLocaleDateString()}</p>
              <h3 className="mt-3 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
              <p className="mt-4 text-sm text-slate-500">{item.location || "JMS Campus"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Gallery Preview</p>
            <h2 className="mt-2 font-display text-3xl">Moments from school life, learning, and celebrations</h2>
          </div>
          <Link to="/gallery" className="rounded-xl bg-primary-700 px-5 py-3 text-white">View Full Gallery</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.slice(0, 8).map((item) => (
            <article key={item._id} className="overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-slate-950">
              <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Testimonials</p>
        <h2 className="mt-2 font-display text-3xl">What families and learners say about the school</h2>
        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.author} className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-900">
              <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">"{item.quote}"</p>
              <p className="mt-5 font-semibold text-primary-700">{item.author}</p>
              <p className="text-sm text-slate-500">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Contact and Map</p>
          <h2 className="mt-2 font-display text-3xl">Visit the campus or reach the school office</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold text-slate-900 dark:text-white">Email:</span> {content.contactEmail}</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Phone:</span> {content.contactPhone}</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Address:</span> {content.address}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-xl bg-primary-700 px-5 py-3 text-white">Open Contact Page</Link>
            <Link to="/admissions" className="rounded-xl border border-slate-300 px-5 py-3 dark:border-slate-700">Admission Help</Link>
          </div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <img
            src={content.contactImageUrl || DEFAULT_CONTACT_IMAGE}
            alt="School campus entrance"
            className="h-52 w-full object-cover"
            loading="lazy"
          />
          <iframe title="School Map" src={content.googleMapEmbedUrl} className="h-[340px] w-full" loading="lazy" />
        </article>
      </section>
    </>
  );
}
