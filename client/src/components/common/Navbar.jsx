import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/academics", "Academics"],
  ["/admissions", "Admissions"],
  ["/gallery", "Gallery"],
  ["/events", "Events"],
  ["/notices", "Notices"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `transition ${isActive ? "text-primary-700 font-semibold" : "text-slate-700 hover:text-primary-700"}`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="pr-2">
            <p className="font-display text-primary-700 text-lg sm:text-xl leading-tight">
              JMS Public School Chaudiha
            </p>
            <p className="text-xs text-slate-500">Excellence in Education</p>
          </div>

          <ul className="hidden md:flex gap-5 font-body text-sm">
            {links.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} className={linkClass}>{label}</NavLink>
              </li>
            ))}
          </ul>

          <NavLink
            to="/admin/login"
            className="hidden md:inline-flex rounded-lg bg-primary-700 text-white px-4 py-2 text-sm hover:bg-primary-900 transition"
          >
            Admin
          </NavLink>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[520px] opacity-100 pb-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-3 border-t border-slate-200 pt-3">
          <ul className="flex flex-col gap-1 font-body text-sm">
            {links.map(([to, label]) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `block rounded-md px-2 py-2 transition ${
                      isActive ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavLink
            to="/admin/login"
            className="mt-3 block w-full rounded-lg bg-primary-700 text-center text-white px-4 py-2 text-sm hover:bg-primary-900 transition"
          >
            Admin
          </NavLink>
        </div>
      </div>
    </header>
  );
}
