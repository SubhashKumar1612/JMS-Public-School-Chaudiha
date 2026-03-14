import { Helmet } from "react-helmet-async";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

export default function DownloadsPage() {
  const { content, loading } = usePublicData();
  if (loading) return <Loader variant="skeleton-list" count={4} text="Loading downloads..." />;

  return (
    <>
      <Helmet><title>Downloads | JMS Public School Chaudiha</title></Helmet>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Downloads</p>
        <h1 className="mt-2 font-display text-4xl">Forms, documents, and syllabus resources</h1>
      </section>
      <section className="mt-8 space-y-4">
        {content.downloads.map((item) => (
          <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:bg-slate-950 dark:border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-primary-700">{item.category}</p>
              <h2 className="mt-1 font-display text-2xl">{item.title}</h2>
            </div>
            <a href={item.fileUrl} className="rounded-xl bg-primary-700 px-5 py-3 text-white text-center" target="_blank" rel="noreferrer">
              Download
            </a>
          </article>
        ))}
      </section>
    </>
  );
}
