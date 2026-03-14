import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function PublicLayout() {
  return (
    <div className="w-full font-body text-slate-800 dark:text-slate-100 min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="site-main w-full mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
