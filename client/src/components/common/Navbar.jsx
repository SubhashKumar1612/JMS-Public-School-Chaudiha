import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useTheme from "../../hooks/useTheme";

const navGroups = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Academics", to: "/academics" },
  {
    label: "Campus Life",
    items: [
      { label: "Events", to: "/events" },
      { label: "Gallery", to: "/gallery" },
      { label: "Facilities", to: "/#facilities" },
    ],
  },
  { label: "Admissions", to: "/admissions" },
  {
    label: "Resources",
    items: [
      { label: "Fees", to: "/fees" },
      { label: "Downloads", to: "/downloads" },
      { label: "Portal Login", to: "/portal/login" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

function DesktopDropdown({ label, items, isDark }) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={`flex items-center gap-1 transition ${
          isDark ? "text-slate-200 hover:text-white" : "text-slate-700 hover:text-primary-700"
        }`}
      >
        {label}
        <span className="text-xs">▼</span>
      </button>
      <div className="invisible absolute left-0 top-full z-20 mt-3 min-w-56 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-primary-50 font-semibold text-primary-700 dark:bg-slate-800"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup("");
  }, [location.pathname, location.hash]);

  const isDark = theme === "dark";
  const linkClass = ({ isActive }) =>
    `transition ${isActive ? "text-primary-700 font-semibold" : "text-slate-700 hover:text-primary-700 dark:text-slate-200 dark:hover:text-white"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <nav className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="pr-2">
            <p className="font-display text-lg leading-tight text-primary-700 sm:text-xl">
              JMS Public School Chaudiha
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Learning. Character. Community.</p>
          </div>

          <ul className="hidden items-center gap-5 font-body text-sm xl:flex">
            {navGroups.map((group) => (
              <li key={group.label}>
                {group.items ? (
                  <DesktopDropdown label={group.label} items={group.items} isDark={isDark} />
                ) : (
                  <NavLink to={group.to} className={linkClass}>
                    {group.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <NavLink
              to="/portal/login"
              className="rounded-xl bg-primary-700 px-4 py-2 text-sm text-white transition hover:bg-primary-900"
            >
              Portal Login
            </NavLink>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200 xl:hidden"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      <div className={`overflow-hidden transition-all duration-300 xl:hidden ${mobileOpen ? "max-h-[760px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
        <div className="mx-auto max-w-7xl border-t border-slate-200 px-3 pt-3 dark:border-slate-800">
          <div className="space-y-2">
            {navGroups.map((group) =>
              group.items ? (
                <div key={group.label} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setOpenGroup((current) => (current === group.label ? "" : group.label))}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {group.label}
                    <span className="text-xs">{openGroup === group.label ? "▲" : "▼"}</span>
                  </button>
                  {openGroup === group.label ? (
                    <div className="border-t border-slate-100 px-2 pb-2 pt-2 dark:border-slate-800">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `block rounded-xl px-3 py-3 text-sm ${
                              isActive
                                ? "bg-primary-50 font-semibold text-primary-700 dark:bg-slate-800"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <NavLink
                  key={group.to}
                  to={group.to}
                  className={({ isActive }) =>
                    `block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm ${
                      isActive
                        ? "bg-primary-50 font-semibold text-primary-700 dark:bg-slate-800"
                        : "text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    }`
                  }
                >
                  {group.label}
                </NavLink>
              )
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <NavLink
              to="/portal/login"
              className="block rounded-xl bg-primary-700 px-4 py-3 text-center text-sm text-white transition hover:bg-primary-900"
            >
              Portal Login
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
