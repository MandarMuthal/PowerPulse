import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import ExerciseImage from '../components/ExerciseImage.jsx';
import ExerciseGrid from '../components/ExerciseGrid.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getExercise, getExercises } from '../services/exerciseService.js';
import { sentenceCase, titleCase } from '../utils/format.js';

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-iron-700 bg-iron-900 p-4">
      <dt className="text-sm text-iron-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold capitalize">{value}</dd>
    </div>
  );
}

export default function ExerciseDetails() {
  const { id } = useParams();
  const { data: ex, loading, error, retry } = useAsync((signal) => getExercise(id, signal), [id]);

  const related = useAsync(
    async (signal) => {
      const filter = ex.target ? { target: ex.target } : { bodyPart: ex.bodyPart };
      const res = await getExercises({ ...filter, limit: 7 }, signal);
      return (res.items || []).filter((e) => e.id !== ex.id).slice(0, 6);
    },
    [ex?.id],
    { enabled: Boolean(ex && (ex.target || ex.bodyPart)) },
  );

  useEffect(() => {
    document.title = ex ? `${titleCase(ex.name)} | PowerPulse` : 'PowerPulse';
    return () => { document.title = 'PowerPulse: exercises, form guides and workout videos'; };
  }, [ex]);

  const back = (
    <Link to="/exercises" className="inline-flex items-center gap-2 text-iron-300 hover:text-lime-300">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to exercises
    </Link>
  );

  if (loading) {
    return (
      <div className="container-x py-12" aria-busy="true">
        {back}
        <div className="mt-6 grid animate-pulse gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-iron-800" />
          <div className="space-y-4"><div className="h-14 w-3/4 rounded bg-iron-800" /><div className="h-24 rounded bg-iron-800" /><div className="h-40 rounded bg-iron-800" /></div>
        </div>
      </div>
    );
  }

  if (error || !ex) {
    const notFound = error?.status === 404;
    return (
      <div className="container-x py-12">
        {back}
        <ErrorMessage
          className="mt-6"
          title={notFound ? 'Exercise not found' : 'Could not load this exercise'}
          message={error?.message}
          onRetry={notFound ? undefined : retry}
        />
      </div>
    );
  }

  const videoQuery = `${ex.name} exercise tutorial`;
  const secondary = ex.secondaryMuscles.filter(Boolean);

  return (
    <div className="container-x py-12">
      {back}
      <article className="mt-6 grid gap-10 lg:grid-cols-2">
        <ExerciseImage src={ex.gifUrl} alt={ex.name} className="aspect-square w-full overflow-hidden rounded-2xl border border-iron-700" />

        <div>
          <h1 className="text-5xl capitalize sm:text-6xl">{ex.name}</h1>
          {ex.description && <p className="mt-4 max-w-prose text-iron-300">{ex.description}</p>}

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Fact label="Body part" value={ex.bodyPart} />
            <Fact label="Target muscle" value={ex.target} />
            <Fact label="Equipment" value={ex.equipment} />
          </dl>

          {secondary.length > 0 && (
            <div className="mt-5">
              <h2 className="text-2xl">Also works</h2>
              <ul className="mt-2 flex flex-wrap gap-2">{secondary.map((m) => <li key={m} className="chip">{m}</li>)}</ul>
            </div>
          )}

          <h2 className="mt-8 text-3xl">How to do it</h2>
          {ex.instructions.length > 0 ? (
            <ol className="mt-3 list-decimal space-y-3 pl-6 text-iron-200 marker:font-semibold marker:text-lime-400">
              {ex.instructions.map((step, i) => <li key={i} className="max-w-prose pl-1">{sentenceCase(step)}</li>)}
            </ol>
          ) : (
            <p className="mt-3 text-iron-300">Step-by-step instructions are not available for this exercise. Watch a video demonstration instead.</p>
          )}

          <Link to={`/videos?q=${encodeURIComponent(videoQuery)}`} className="btn-primary mt-8">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Find workout videos
          </Link>
        </div>
      </article>

      {(related.loading || related.error || (related.data || []).length > 0) && (
        <section className="mt-20" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title mb-8">
            Related exercises
          </h2>
          <ExerciseGrid
            items={related.data || []}
            loading={related.loading}
            error={related.error}
            onRetry={related.retry}
            skeletonCount={6}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          />
        </section>
      )}
    </div>
  );
}
