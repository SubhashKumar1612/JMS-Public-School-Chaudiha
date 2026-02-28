import { Helmet } from "react-helmet-async";
import usePublicData from "../utils/usePublicData";
import Loader from "../components/common/Loader";

export default function AboutPage() {
  const { content, loading } = usePublicData();
  if (loading) return <Loader text="Loading school information..." variant="skeleton-cards" count={4} />;

  return (
    <>
      <Helmet><title>About | JMS Public School Chaudiha</title></Helmet>
      <h1 className="font-display text-3xl text-primary-700">About Us</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <section className="bg-white p-6 rounded-xl shadow-soft">
          <h2 className="font-display text-xl">School History</h2>
          <p className="mt-2 text-slate-600">{content.aboutHistory}</p>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-soft">
          <h2 className="font-display text-xl">Mission</h2>
          <p className="mt-2 text-slate-600">{content.mission}</p>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-soft">
          <h2 className="font-display text-xl">Vision</h2>
          <p className="mt-2 text-slate-600">{content.vision}</p>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-soft">
          <h2 className="font-display text-xl">Principal Message</h2>
          <p className="mt-2 text-slate-600">{content.principalMessage}</p>
        </section>
      </div>
    </>
  );
}
