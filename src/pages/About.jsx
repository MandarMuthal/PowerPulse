import { Link } from 'react-router-dom';

const STEPS = [
  ['Find an exercise', 'Search by name or filter by body part, target muscle and equipment.'],
  ['Learn the movement', 'Each exercise has a demonstration and step-by-step instructions.'],
  ['Watch it done', 'Jump to workout videos for the same exercise when you want a second look.'],
];

export default function About() {
  return (
    <div className="container-x py-12">
      <h1 className="text-6xl sm:text-7xl">About PowerPulse</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-lg text-iron-300">
        <p>PowerPulse is a free exercise reference for people who want to train with better form and less guesswork.</p>
        <p>Exercise data and demonstrations come from ExerciseDB. Video results come from YouTube, and every video opens on YouTube itself.</p>
      </div>

      <h2 className="section-title mt-14">How it works</h2>
      <ol className="mt-6 grid gap-5 md:grid-cols-3">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="rounded-xl border border-iron-700 bg-iron-900 p-6">
            <span className="font-display text-5xl font-extrabold text-lime-400" aria-hidden="true">{i + 1}</span>
            <h3 className="mt-2 text-3xl">{title}</h3>
            <p className="mt-2 text-iron-300">{text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 max-w-2xl rounded-xl border border-iron-700 bg-iron-900 p-6">
        <h2 className="text-3xl">Train safely</h2>
        <p className="mt-2 text-iron-300">PowerPulse is general information, not medical advice. Warm up, start light, stop if something hurts, and check with a doctor or qualified coach before starting a new program or if you have an injury.</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/exercises" className="btn-primary">Explore exercises</Link>
        <Link to="/videos" className="btn-outline">Browse workout videos</Link>
      </div>
    </div>
  );
}
