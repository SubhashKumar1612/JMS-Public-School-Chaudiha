import { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../api/api";
import usePublicData from "../utils/usePublicData";

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
      <h1 className="font-display text-3xl text-primary-700">Contact Us</h1>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-soft space-y-3">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button disabled={submitting} className="bg-primary-700 text-white px-5 py-2 rounded-lg hover:bg-primary-900 transition disabled:opacity-60">
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>

        <section className="bg-white p-6 rounded-xl shadow-soft">
          <h2 className="font-display text-xl">Contact Details</h2>
          <p className="mt-2 text-slate-600">Email: {content.contactEmail}</p>
          <p className="text-slate-600">Phone: {content.contactPhone}</p>
          <p className="text-slate-600">Address: {content.address}</p>
          <iframe title="School Map" src={content.googleMapEmbedUrl} className="w-full h-64 mt-4 rounded-lg border" loading="lazy" />
        </section>
      </div>
    </>
  );
}
