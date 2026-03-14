import { Helmet } from "react-helmet-async";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

export default function FeesPage() {
  const { content, loading } = usePublicData();
  if (loading) return <Loader variant="skeleton-cards" count={3} text="Loading fee structure..." />;

  return (
    <>
      <Helmet><title>Fee Structure | JMS Public School Chaudiha</title></Helmet>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Transparent Fees</p>
        <h1 className="mt-2 font-display text-4xl">Fee structure and payment overview</h1>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {content.feeStructure.map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
            <p className="text-sm uppercase tracking-[0.16em] text-primary-700">{item.note}</p>
            <h2 className="mt-2 font-display text-2xl">{item.label}</h2>
            <p className="mt-4 text-3xl font-display">{item.amount}</p>
          </article>
        ))}
      </section>
    </>
  );
}
