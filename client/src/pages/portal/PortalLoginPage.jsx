import { useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function PortalLoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const data = await login(form.email, form.password);
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/portal/dashboard");
      }
      toast.success(`Signed in as ${data.user.role}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <>
      <Helmet><title>Portal Login | JMS Public School Chaudiha</title></Helmet>
      <section className="mx-auto max-w-5xl rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-soft dark:bg-slate-950 dark:border-slate-800 lg:grid lg:grid-cols-[1fr_0.9fr]">
        <div className="bg-primary-700 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-blue-100">Role-Based Access</p>
          <h1 className="mt-3 font-display text-4xl">Portal Login</h1>
          <p className="mt-4 text-blue-100">Students, teachers, parents, and admins can access their workspace from one secure entry point.</p>
        </div>
        <form onSubmit={submit} className="p-8">
          <h2 className="font-display text-2xl">Sign in</h2>
          <div className="mt-5 space-y-4">
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:bg-slate-900 dark:border-slate-700" />
            <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" placeholder="Password" className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:bg-slate-900 dark:border-slate-700" />
            <button disabled={loading} className="w-full rounded-xl bg-primary-700 px-5 py-3 text-white disabled:opacity-60">
              {loading ? "Signing in..." : "Open Dashboard"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
