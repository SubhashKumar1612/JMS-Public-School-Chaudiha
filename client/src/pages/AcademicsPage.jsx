import { Helmet } from "react-helmet-async";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

export default function AcademicsPage() {
  const { content, materials, loading } = usePublicData();
  if (loading) return <Loader variant="skeleton-cards" count={4} text="Loading academics..." />;

  return (
    <>
      <Helmet><title>Academics | JMS Public School Chaudiha</title></Helmet>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Academic Programs</p>
        <h1 className="mt-2 font-display text-4xl">Structured learning from early years to board classes</h1>
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {content.academicPrograms.map((program) => (
          <article key={program.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
            <h2 className="font-display text-2xl text-primary-700">{program.title}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-7">{program.description}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <h2 className="font-display text-2xl">Study Materials and Resources</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((item) => (
            <article key={item._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.16em] text-primary-700">{item.subject}</p>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
