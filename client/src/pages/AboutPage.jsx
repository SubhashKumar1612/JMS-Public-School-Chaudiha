import { Helmet } from "react-helmet-async";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

const DEFAULT_ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80";
const DEFAULT_PRINCIPAL_IMAGE =
  "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80";

export default function AboutPage() {
  const { content, loading } = usePublicData();
  if (loading) return <Loader variant="skeleton-cards" count={4} text="Loading school story..." />;

  return (
    <>
      <Helmet><title>About | JMS Public School Chaudiha</title></Helmet>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
          <p className="text-sm uppercase tracking-[0.18em] text-primary-700">{content.schoolHistoryTitle}</p>
          <h1 className="mt-2 font-display text-4xl">About the School</h1>
          <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">{content.aboutHistory}</p>
          <img
            src={content.aboutImageUrl || DEFAULT_ABOUT_IMAGE}
            alt="About the school"
            className="mt-6 h-72 w-full rounded-3xl object-cover"
            loading="lazy"
          />
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
          <img
            src={content.principalPhotoUrl || DEFAULT_PRINCIPAL_IMAGE}
            alt={content.principalName}
            className="h-64 w-full rounded-3xl object-cover"
            loading="lazy"
          />
          <h2 className="mt-5 font-display text-2xl">Principal's Message</h2>
          <p className="mt-3 text-primary-700 font-semibold">{content.principalName}</p>
          <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">{content.principalMessage}</p>
        </article>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl bg-primary-700 p-6 text-white shadow-soft">
          <h2 className="font-display text-2xl">Mission</h2>
          <p className="mt-4 leading-8 text-blue-50">{content.mission}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
          <h2 className="font-display text-2xl">Vision</h2>
          <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">{content.vision}</p>
        </article>
      </section>
    </>
  );
}
