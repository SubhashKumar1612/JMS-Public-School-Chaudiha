import { Helmet } from "react-helmet-async";
import usePublicData from "../utils/usePublicData";
import Loader from "../components/common/Loader";

export default function NoticesPage() {
  const { notices, loading } = usePublicData();
  if (loading) return <Loader text="Loading notices..." variant="skeleton-list" count={4} />;

  return (
    <>
      <Helmet><title>Notice Board | JMS Public School Chaudiha</title></Helmet>
      <h1 className="font-display text-3xl text-primary-700">Notice Board</h1>
      {notices.length === 0 ? (
        <article className="mt-6 bg-white rounded-xl p-6 shadow-soft text-slate-600">
          No notices available currently.
        </article>
      ) : (
        <div className="space-y-4 mt-6">
          {notices.map((notice) => (
            <article key={notice._id} className="bg-white p-5 rounded-xl shadow-soft hover:shadow-lg transition">
              <h2 className="font-display text-xl flex items-center gap-2">
                {notice.title}
                {notice.isPinned ? <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">Pinned</span> : null}
              </h2>
              <p className="text-slate-500 text-sm mt-1">{new Date(notice.date).toLocaleDateString()}</p>
              <p className="text-slate-600 mt-2">{notice.description}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
