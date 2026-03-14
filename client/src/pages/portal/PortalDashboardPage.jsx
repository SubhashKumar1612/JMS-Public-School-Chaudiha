import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";

export default function PortalDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/portal/dashboard");
        setDashboard(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load portal dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (loading) return <Loader variant="skeleton-cards" count={4} text="Loading portal dashboard..." />;

  return (
    <>
      <Helmet><title>{user?.role} Portal | JMS Public School Chaudiha</title></Helmet>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary-700">{dashboard.role} Portal</p>
            <h1 className="mt-2 font-display text-4xl">{user?.name}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {dashboard.role === "student" && "Track your academics, attendance, homework, and fee status."}
              {dashboard.role === "teacher" && "Manage classes, assignments, study materials, and outcomes."}
              {dashboard.role === "parent" && "Monitor your child’s school life, fees, and communication updates."}
            </p>
          </div>
          <button onClick={signOut} className="rounded-xl bg-red-600 px-4 py-3 text-white">Logout</button>
        </div>
      </section>

      {dashboard.role === "student" && <StudentDashboard dashboard={dashboard} />}
      {dashboard.role === "teacher" && <TeacherDashboard dashboard={dashboard} />}
      {dashboard.role === "parent" && <ParentDashboard dashboard={dashboard} />}
    </>
  );
}

function StudentDashboard({ dashboard }) {
  return (
    <>
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <MetricCard label="Attendance" value={`${dashboard.profile.attendancePercentage || 0}%`} />
        <MetricCard label="Fee Status" value={dashboard.profile.feeStatus || "due"} />
        <MetricCard label="Assignments" value={String(dashboard.assignments.length)} />
        <MetricCard label="Results" value={String(dashboard.results.length)} />
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <ListPanel title="Assignments" items={dashboard.assignments.map((item) => `${item.title} · ${item.subject}`)} />
        <ListPanel title="Study Materials" items={dashboard.materials.map((item) => `${item.title} · ${item.subject}`)} />
        <ListPanel title="Recent Notices" items={dashboard.notices.map((item) => item.title)} />
        <ListPanel title="Fee Records" items={dashboard.fees.map((item) => `${item.term} · ${item.status}`)} />
      </section>
    </>
  );
}

function TeacherDashboard({ dashboard }) {
  return (
    <>
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <MetricCard label="Classes" value={String(dashboard.classRooms.length)} />
        <MetricCard label="Assignments" value={String(dashboard.assignments.length)} />
        <MetricCard label="Materials" value={String(dashboard.materials.length)} />
        <MetricCard label="Notices" value={String(dashboard.notices.length)} />
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <ListPanel title="Class Schedules" items={dashboard.classRooms.map((item) => `${item.name} - ${item.section}`)} />
        <ListPanel title="Assignments Posted" items={dashboard.assignments.map((item) => `${item.title} · due ${new Date(item.dueDate).toLocaleDateString()}`)} />
        <ListPanel title="Study Materials" items={dashboard.materials.map((item) => item.title)} />
        <ListPanel title="Recent Results" items={dashboard.results.map((item) => `${item.examName} · ${item.grade || item.percentage + "%"}`)} />
      </section>
    </>
  );
}

function ParentDashboard({ dashboard }) {
  return (
    <>
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <MetricCard label="Children" value={String(dashboard.profile.children.length)} />
        <MetricCard label="Attendance Logs" value={String(dashboard.attendance.length)} />
        <MetricCard label="Results" value={String(dashboard.results.length)} />
        <MetricCard label="Fee Records" value={String(dashboard.fees.length)} />
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <ListPanel title="Attendance" items={dashboard.attendance.map((item) => `${item.student?.rollNumber || "Child"} · ${item.status}`)} />
        <ListPanel title="Exam Results" items={dashboard.results.map((item) => `${item.examName} · ${item.grade || item.percentage + "%"}`)} />
        <ListPanel title="Fee History" items={dashboard.fees.map((item) => `${item.term} · ${item.status}`)} />
        <ListPanel title="School Notifications" items={dashboard.notices.map((item) => item.title)} />
      </section>
    </>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:bg-slate-950 dark:border-slate-800">
      <p className="text-sm uppercase tracking-[0.16em] text-primary-700">{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </article>
  );
}

function ListPanel({ title, items }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:bg-slate-950 dark:border-slate-800">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-500">No records yet.</p>
        ) : (
          items.slice(0, 6).map((item) => (
            <div key={`${title}-${item}`} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <p className="text-sm">{item}</p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
