export default function Loader({ text = "Loading...", variant = "spinner", count = 3 }) {
  if (variant === "skeleton-cards") {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="h-44 bg-slate-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "skeleton-list") {
    return (
      <div className="space-y-4 mt-6 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow-soft space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-700" />
      <span className="ml-3 text-slate-600">{text}</span>
    </div>
  );
}
