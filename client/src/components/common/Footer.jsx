import { Link } from "react-router-dom";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: "f" },
  { label: "Instagram", href: "https://instagram.com", icon: "◎" },
  { label: "YouTube", href: "https://youtube.com", icon: "▶" },
];

export default function Footer() {
  return (
    <footer className="relative isolate z-20 mt-16 overflow-hidden rounded-t-[2rem] bg-primary-900 text-white pointer-events-auto">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-200">JMS Public School Chaudiha</p>
          <h3 className="mt-3 font-display text-3xl">A complete school platform for academics, campus life, and community.</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-blue-100">
            Explore admissions, academic programs, events, announcements, and secure portal access for students, teachers, parents, and administrators.
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm transition hover:bg-white hover:text-primary-900"
                aria-label={item.label}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <div className="mt-4 space-y-3 text-sm text-blue-100">
            <Link className="relative z-10 block hover:text-white" to="/about">About the School</Link>
            <Link className="relative z-10 block hover:text-white" to="/academics">Academic Programs</Link>
            <Link className="relative z-10 block hover:text-white" to="/admissions">Admissions</Link>
            <Link className="relative z-10 block hover:text-white" to="/downloads">Downloads</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Campus Life</h4>
          <div className="mt-4 space-y-3 text-sm text-blue-100">
            <Link className="relative z-10 block hover:text-white" to="/events">Events</Link>
            <Link className="relative z-10 block hover:text-white" to="/gallery">Gallery</Link>
            <Link className="relative z-10 block hover:text-white" to="/fees">Fee Structure</Link>
            <Link className="relative z-10 block hover:text-white" to="/portal/login">Portal Login</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-blue-100">
            <p>Chaudiha, India</p>
            <p>info@jmsschool.com</p>
            <p>+91-00000-00000</p>
            <Link className="relative z-10 inline-flex rounded-xl bg-white px-4 py-2 font-medium text-primary-900" to="/contact">
              Visit Contact Page
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-blue-100">
        Copyright {new Date().getFullYear()} JMS Public School Chaudiha. All rights reserved.
      </div>
    </footer>
  );
}
