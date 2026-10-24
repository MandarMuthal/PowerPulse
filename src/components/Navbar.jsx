import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/exercises', label: 'Exercises' },
  { to: '/body-parts', label: 'Body parts' },
  { to: '/videos', label: 'Workout videos' },
  { to: '/about', label: 'About' },
];

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 font-medium transition-colors ${isActive ? 'text-lime-400' : 'text-iron-200 hover:text-iron-100'}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
     setOpen(false);
   }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-iron-700 bg-iron-950/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="PowerPulse home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400 text-iron-950">
            <Activity className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="font-display text-3xl font-extrabold tracking-tight">PowerPulse</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-iron-100 hover:bg-iron-800 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-iron-700 bg-iron-950 md:hidden">
          <div className="container-x flex flex-col py-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${linkClass({ isActive })} py-3 text-lg`}>{l.label}</NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
