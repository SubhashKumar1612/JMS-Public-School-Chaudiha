import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

export default function AdminLoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Email and password are required.");

    try {
      await login(form.email, form.password);
      toast.success("Login successful.");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-500 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-7 shadow-soft">
        <h1 className="font-display text-2xl text-primary-700">Admin Login</h1>
        <p className="text-sm text-slate-500 mt-1">JMS Public School Chaudiha</p>
        <div className="mt-5 space-y-3">
          <input type="email" placeholder="Email" className="w-full border rounded-lg px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" className="w-full border rounded-lg px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={loading} className="w-full bg-primary-700 text-white py-2 rounded-lg hover:bg-primary-900 transition disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </section>
  );
}
