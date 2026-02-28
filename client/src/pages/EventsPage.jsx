import { Helmet } from "react-helmet-async";
import usePublicData from "../utils/usePublicData";
import Loader from "../components/common/Loader";

export default function EventsPage() {
  const { events, loading } = usePublicData();
  if (loading) return <Loader text="Loading events..." variant="skeleton-list" count={4} />;

  return (
    <>
      <Helmet><title>Events | JMS Public School Chaudiha</title></Helmet>
      <h1 className="font-display text-3xl text-primary-700">Events</h1>
      {events.length === 0 ? (
        <article className="mt-6 bg-white rounded-xl p-6 shadow-soft text-slate-600">
          No upcoming events right now.
        </article>
      ) : (
        <div className="space-y-4 mt-6">
          {events.map((event) => (
            <article key={event._id} className="bg-white p-5 rounded-xl shadow-soft hover:shadow-lg transition">
              <h2 className="font-display text-xl">{event.title}</h2>
              <p className="text-slate-500 text-sm mt-1">{new Date(event.eventDate).toLocaleDateString()} | {event.location}</p>
              <p className="text-slate-600 mt-2">{event.description}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
