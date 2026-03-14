import { Helmet } from "react-helmet-async";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

export default function FacultyPage() {
  const { faculty, content, loading } = usePublicData();
  if (loading) return <Loader variant="skeleton-cards" count={6} text="Loading faculty..." />;

  return (
    <>
      <Helmet><title>Faculty | JMS Public School Chaudiha</title></Helmet>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Faculty and Staff</p>
        <h1 className="mt-2 font-display text-4xl">Meet the academic team behind the school</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">{content.facultyIntro}</p>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {faculty.map((member) => (
          <article key={member._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
            <div className="h-16 w-16 rounded-2xl bg-primary-100 text-primary-700 grid place-items-center font-display text-2xl">
              {(member.user?.name || "F").charAt(0)}
            </div>
            <h2 className="mt-4 font-display text-2xl">{member.user?.name}</h2>
            <p className="text-primary-700 mt-1">{member.designation}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{member.department}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{member.qualification}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{member.bio || "Dedicated to student growth, discipline, and academic clarity."}</p>
          </article>
        ))}
      </section>
    </>
  );
}
