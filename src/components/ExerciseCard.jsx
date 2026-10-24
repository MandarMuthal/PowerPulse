import { Link } from 'react-router-dom';
import ExerciseImage from './ExerciseImage.jsx';
import { titleCase } from '../utils/format.js';

export default function ExerciseCard({ exercise }) {
  const { id, name, bodyPart, target, equipment, gifUrl } = exercise;
  const tags = [bodyPart, target, equipment].filter(Boolean);

  return (
    <Link
      to={`/exercises/${encodeURIComponent(id)}`}
      className="group block overflow-hidden rounded-xl border border-iron-700 bg-iron-900 transition hover:-translate-y-1 hover:border-lime-400/70"
    >
      <ExerciseImage src={gifUrl} alt={name} className="aspect-square w-full" />
      <div className="p-4">
        <h3 className="line-clamp-2 text-2xl leading-tight group-hover:text-lime-300">{titleCase(name)}</h3>
        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <li key={`${tag}-${i}`} className="chip">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
