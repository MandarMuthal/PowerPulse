import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import RecentSearches from '../components/RecentSearches.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import ExerciseGrid from '../components/ExerciseGrid.jsx';
import Loader from '../components/Loader.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useExerciseList } from '../hooks/useExerciseList.js';
import { useRecentSearches } from '../hooks/useRecentSearches.js';
import { getFilters } from '../services/exerciseService.js';

const PAGE_SIZE = 12;

export default function Exercises() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const bodyPart = params.get('bodyPart') || '';
  const target = params.get('target') || '';
  const equipment = params.get('equipment') || '';

  const recent = useRecentSearches('pp:recent-exercise-searches');
  const filterLists = useAsync(() => getFilters(), []);
  const list = useExerciseList({ q, bodyPart, target, equipment }, PAGE_SIZE);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const search = (term) => {
    recent.add(term);
    update({ q: term });
  };
  const hasFilters = Boolean(q || bodyPart || target || equipment);

  return (
    <div className="container-x py-12">
      <h1 className="text-6xl sm:text-7xl">Exercise library</h1>
      <p className="mt-3 max-w-2xl text-lg text-iron-300">Search by name, then narrow by body part, muscle and equipment.</p>

      <div className="mt-8 max-w-2xl">
        <SearchBar defaultValue={q} onSubmit={search} label="Search exercises by name" placeholder="Search by exercise name" />
        <RecentSearches items={recent.items} onPick={search} onClear={recent.clear} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <FilterSidebar
          lists={filterLists.data}
          loading={filterLists.loading}
          error={filterLists.error}
          onRetry={filterLists.retry}
          values={{ bodyPart, target, equipment }}
          onChange={(name, value) => update({ [name]: value })}
          onClear={() => update({ bodyPart: '', target: '', equipment: '' })}
        />

        <section aria-live="polite">
          {!list.loading && !list.error && (
            <p className="mb-4 text-iron-300">
              {list.total != null ? `${list.total} exercise${list.total === 1 ? '' : 's'} found` : `Showing ${list.items.length} exercises`}
              {q && <> for “{q}”</>}
            </p>
          )}

          <ExerciseGrid
            items={list.items}
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            skeletonCount={PAGE_SIZE}
            columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            emptyAction={hasFilters && <button type="button" className="btn-outline" onClick={() => setParams({})}>Reset search and filters</button>}
          />

          {list.loadingMore && <Loader label="Loading more exercises" />}
          {list.moreError && (
            <p role="alert" className="mt-6 text-center text-red-300">
              {list.moreError.message}{' '}
              <button type="button" onClick={list.loadMore} className="underline">Try again</button>
            </p>
          )}
          {list.hasMore && !list.loadingMore && !list.loading && !list.moreError && (
            <div className="mt-10 text-center">
              <button type="button" onClick={list.loadMore} className="btn-primary">Load more</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
