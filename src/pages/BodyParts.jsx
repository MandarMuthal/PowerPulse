import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Dumbbell, Footprints, HeartPulse } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ExerciseGrid from '../components/ExerciseGrid.jsx';
import Loader from '../components/Loader.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useExerciseList } from '../hooks/useExerciseList.js';
import { getFilters } from '../services/exerciseService.js';
import { BODY_PART_HINTS } from '../utils/constants.js';
import { titleCase } from '../utils/format.js';

const PAGE_SIZE = 12;
const TABS = [
  { type: 'bodyPart', label: 'Body parts', listKey: 'bodyParts' },
  { type: 'target', label: 'Target muscles', listKey: 'targets' },
];

function iconFor(name) {
  if (name.includes('leg') || name.includes('calves') || name === 'glutes') return Footprints;
  if (name.includes('cardio')) return HeartPulse;
  if (name === 'waist' || name === 'abs' || name === 'neck' || name === 'spine') return Activity;
  return Dumbbell;
}

export default function BodyParts() {
  const [params, setParams] = useSearchParams();
  const type = params.get('type') === 'target' ? 'target' : 'bodyPart';
  const value = params.get('value') || '';
  const tab = TABS.find((t) => t.type === type);

  const filters = useAsync(() => getFilters(), []);
  const list = useExerciseList({ [type]: value }, PAGE_SIZE, Boolean(value));
  const resultsRef = useRef(null);

  useEffect(() => {
    if (value && resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [type, value]);

  const options = filters.data?.[tab.listKey] || [];
  const select = (v) => setParams({ type, value: v });

  return (
    <div className="container-x py-12">
      <h1 className="text-6xl sm:text-7xl">Body parts and muscles</h1>
      <p className="mt-3 max-w-2xl text-lg text-iron-300">Choose where you want to train and see every matching exercise.</p>

      <div role="tablist" aria-label="Browse by" className="mt-8 inline-flex rounded-lg border border-iron-700 bg-iron-900 p-1">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            role="tab"
            aria-selected={t.type === type}
            onClick={() => setParams({ type: t.type })}
            className={`rounded-md px-4 py-2 font-semibold transition-colors ${t.type === type ? 'bg-lime-400 text-iron-950' : 'text-iron-300 hover:text-iron-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filters.loading && <Loader label="Loading categories" />}
        {filters.error && <ErrorMessage title="Could not load categories" message={filters.error.message} onRetry={filters.retry} />}
        {!filters.loading && !filters.error && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {options.map((name) => {
              const Icon = iconFor(name);
              const active = name === value;
              return (
                <li key={name}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(name)}
                    className={`flex h-full w-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${active ? 'border-lime-400 bg-lime-400/10' : 'border-iron-700 bg-iron-900 hover:border-lime-400/70'}`}
                  >
                    <Icon className={`h-6 w-6 ${active ? 'text-lime-400' : 'text-iron-300'}`} aria-hidden="true" />
                    <span className="font-display text-2xl font-extrabold leading-none">{titleCase(name)}</span>
                    {type === 'bodyPart' && BODY_PART_HINTS[name] && <span className="text-sm text-iron-400">{BODY_PART_HINTS[name]}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <section ref={resultsRef} className="scroll-mt-24 pt-14" aria-live="polite">
        {!value ? (
          <p className="rounded-xl border border-dashed border-iron-600 p-8 text-center text-iron-300">
            Select a {type === 'target' ? 'muscle' : 'body part'} above to see exercises.
          </p>
        ) : (
          <>
            <h2 className="section-title mb-6">{titleCase(value)} exercises</h2>
            <ExerciseGrid
              items={list.items}
              loading={list.loading}
              error={list.error}
              onRetry={list.retry}
              skeletonCount={PAGE_SIZE}
              emptyTitle={`No exercises found for ${value}`}
              emptyMessage="This category has no matching exercises right now."
            />
            {list.loadingMore && <Loader label="Loading more exercises" />}
            {list.moreError && (
              <p role="alert" className="mt-6 text-center text-red-300">
                {list.moreError.message} <button type="button" onClick={list.loadMore} className="underline">Try again</button>
              </p>
            )}
            {list.hasMore && !list.loadingMore && !list.loading && !list.moreError && (
              <div className="mt-10 text-center"><button type="button" onClick={list.loadMore} className="btn-primary">Load more</button></div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
