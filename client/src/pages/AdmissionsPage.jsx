import { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import api from "../api/api";
import Loader from "../components/common/Loader";
import usePublicData from "../utils/usePublicData";

export default function AdmissionsPage() {
  const { content, loading } = usePublicData();
  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    email: "",
    phone: "",
    classApplyingFor: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loader variant="skeleton-cards" count={3} text="Loading admissions..." />;

  const submitAdmission = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/public/admissions", form);
      toast.success("Admission form submitted.");
      setForm({ studentName: "", parentName: "", email: "", phone: "", classApplyingFor: "", notes: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit admission form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>Admissions | JMS Public School Chaudiha</title></Helmet>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
          <p className="text-sm uppercase tracking-[0.18em] text-primary-700">Admissions</p>
          <h1 className="mt-2 font-display text-4xl">Join the school community</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 leading-8">{content.admissionsInfo}</p>
          <a
            href={content.admissionTemplateUrl || "/admission-form-template.txt"}
            download={content.admissionTemplateName || "JMS-Admission-Form-Template.txt"}
            className="mt-6 inline-flex rounded-xl bg-primary-700 px-5 py-3 text-white"
          >
            Download Admission Form
          </a>
        </article>
        <form onSubmit={submitAdmission} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
          <h2 className="font-display text-2xl">Online Admission Enquiry</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["studentName", "Student Name"],
              ["parentName", "Parent Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["classApplyingFor", "Class Applying For"],
            ].map(([key, label]) => (
              <input
                key={key}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
                className="rounded-xl border border-slate-200 px-4 py-3 dark:bg-slate-900 dark:border-slate-700"
              />
            ))}
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Message or notes"
              rows="5"
              className="md:col-span-2 rounded-xl border border-slate-200 px-4 py-3 dark:bg-slate-900 dark:border-slate-700"
            />
          </div>
          <button disabled={submitting} className="mt-5 rounded-xl bg-primary-700 px-5 py-3 text-white disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit Admission Form"}
          </button>
        </form>
      </section>
    </>
  );
}
