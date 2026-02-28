import { Helmet } from "react-helmet-async";
import usePublicData from "../utils/usePublicData";
import Loader from "../components/common/Loader";

export default function GalleryPage() {
  const { gallery, loading } = usePublicData();
  if (loading) return <Loader text="Loading gallery..." variant="skeleton-cards" count={6} />;

  return (
    <>
      <Helmet><title>Gallery | JMS Public School Chaudiha</title></Helmet>
      <h1 className="font-display text-3xl text-primary-700">School Gallery</h1>
      {gallery.length === 0 ? (
        <article className="mt-6 bg-white rounded-xl p-6 shadow-soft text-slate-600">
          No gallery photos yet. Please check back soon.
        </article>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {gallery.map((photo) => (
            <article key={photo._id} className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition">
              <img src={photo.imageUrl} alt={photo.title} className="h-56 w-full object-cover" loading="lazy" />
              <p className="px-4 py-3 text-sm text-slate-600">{photo.title}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
