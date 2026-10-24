import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-iron-700 bg-iron-900">
      <div className="container-x grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-3xl font-extrabold">
            <Activity className="h-6 w-6 text-lime-400" strokeWidth={3} aria-hidden="true" /> PowerPulse
          </p>
          <p className="mt-3 max-w-xs text-iron-300">Look up any exercise, learn the form, and watch it done right.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2 text-iron-300">
            <li><Link className="hover:text-lime-300" to="/exercises">Exercises</Link></li>
            <li><Link className="hover:text-lime-300" to="/body-parts">Body parts</Link></li>
            <li><Link className="hover:text-lime-300" to="/videos">Workout videos</Link></li>
            <li><Link className="hover:text-lime-300" to="/about">About</Link></li>
          </ul>
        </nav>
        <p className="text-sm text-iron-400">
          Exercise data from ExerciseDB. Videos from YouTube. Always warm up and train within your limits; talk to a doctor before starting a new program.
        </p>
      </div>
      <div className="border-t border-iron-700 py-4 text-center text-sm text-iron-400">© {new Date().getFullYear()} PowerPulse</div>
    </footer>
  );
}
