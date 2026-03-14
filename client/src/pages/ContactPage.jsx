import { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../api/api";
import usePublicData from "../utils/usePublicData";

const DEFAULT_CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80";

export default function ContactPage() {
  const { content } = usePublicData();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent successfully.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>Contact | JMS Public School Chaudiha</title></Helmet>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Contact the School</p>
        <h1 className="mt-2 font-display text-4xl text-primary-700">We are here to help families, learners, and visitors</h1>
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <img
            src={content.contactImageUrl || DEFAULT_CONTACT_IMAGE}
            alt="School contact"
            className="h-72 w-full object-cover"
            loading="lazy"
          />
          <div className="p-6">
            <h2 className="font-display text-xl">Contact Details</h2>
            <p className="mt-3 text-slate-600">Email: {content.contactEmail}</p>
            <p className="text-slate-600">Phone: {content.contactPhone}</p>
            <p className="text-slate-600">Address: {content.address}</p>
            <iframe title="School Map" src={content.googleMapEmbedUrl} className="mt-4 h-64 w-full rounded-lg border" loading="lazy" />
          </div>
        </section>

        <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-soft space-y-3 dark:bg-slate-950">
          <h2 className="font-display text-2xl">Send an inquiry</h2>
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full rounded-lg border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea className="w-full rounded-lg border px-3 py-2" rows="5" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button disabled={submitting} className="rounded-lg bg-primary-700 px-5 py-2 text-white transition hover:bg-primary-900 disabled:opacity-60">
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </>
  );
}
