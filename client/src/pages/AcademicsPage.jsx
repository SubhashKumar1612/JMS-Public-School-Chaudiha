import { Helmet } from "react-helmet-async";

export default function AcademicsPage() {
  const classes = ["Nursery to Class V", "Class VI to VIII", "Class IX to XII"];
  return (
    <>
      <Helmet><title>Academics | JMS Public School Chaudiha</title></Helmet>
      <h1 className="font-display text-3xl text-primary-700">Academics</h1>
      <p className="mt-3 text-slate-600">Our curriculum is designed around conceptual learning, critical thinking, and co-curricular development.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {classes.map((item) => (
          <article key={item} className="bg-white p-6 rounded-xl shadow-soft hover:shadow-lg transition">
            <h3 className="font-display text-xl">{item}</h3>
            <p className="mt-2 text-slate-600">CBSE-aligned curriculum with activity-based pedagogy and regular assessments.</p>
          </article>
        ))}
      </div>
    </>
  );
}
