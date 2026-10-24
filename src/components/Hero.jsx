import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import { HERO_IMAGE } from '../utils/constants.js';

export default function Hero() {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-iron-700">
      <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
        <div>
          <h1 className="text-6xl leading-[0.95] sm:text-7xl xl:text-8xl">
            Know every rep before you start.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-iron-300">
            Search the full exercise library, see how each movement is performed, and follow along with workout videos.
          </p>
          <SearchBar
            className="mt-8 max-w-xl"
            placeholder="Try “bench press” or “lunge”"
            label="Search exercises"
            onSubmit={(q) => navigate(q ? `/exercises?q=${encodeURIComponent(q)}` : '/exercises')}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/exercises" className="btn-primary">Explore exercises</Link>
            <Link to="/body-parts" className="btn-outline">Start training</Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-iron-700 bg-iron-900 lg:aspect-square">
          {!imgFailed && (
            <img src={HERO_IMAGE} alt="Barbells racked in a gym" onError={() => setImgFailed(true)} className="h-full w-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-iron-950/80 via-transparent to-transparent" aria-hidden="true" />
          <svg viewBox="0 0 400 80" className="absolute inset-x-0 bottom-6 w-full px-6" aria-hidden="true" fill="none">
            <path
              d="M0 40 H110 L130 40 L148 8 L172 72 L190 40 H250 L264 28 L280 52 L294 40 H400"
              pathLength="1"
              stroke="#a3e635"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
              className="animate-draw"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
