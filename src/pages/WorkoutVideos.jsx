import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import RecentSearches from '../components/RecentSearches.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { VideoSkeleton } from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useRecentSearches } from '../hooks/useRecentSearches.js';
import { searchVideos } from '../services/youtubeService.js';
import { VIDEO_SUGGESTIONS } from '../utils/constants.js';

export default function WorkoutVideos() {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const recent = useRecentSearches('pp:recent-video-searches');
  const { data, loading, error, retry } = useAsync((signal) => searchVideos(q, signal), [q], { enabled: Boolean(q) });

  const search = (term) => {
    if (term) recent.add(term);
    setParams(term ? { q: term } : {});
  };
  const items = data?.items || [];

  return (
    <div className="container-x py-12">
      <h1 className="text-6xl sm:text-7xl">Workout videos</h1>
      <p className="mt-3 max-w-2xl text-lg text-iron-300">Search an exercise name to find form tutorials and full workouts. Videos open on YouTube.</p>

      <div className="mt-8 max-w-2xl">
        <SearchBar defaultValue={q} onSubmit={search} label="Search workout videos" placeholder="Exercise or workout, e.g. “deadlift form”" />
        <RecentSearches items={recent.items} onPick={search} onClear={recent.clear} />
      </div>

      <div className="mt-10" aria-live="polite">
        {!q && (
          <div>
            <h2 className="text-3xl">Try one of these</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {VIDEO_SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => search(s)} className="chip px-4 py-2 text-base hover:border-lime-400 hover:text-lime-300">{s}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {q && loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading videos">
            {Array.from({ length: 8 }, (_, i) => <VideoSkeleton key={i} />)}
          </div>
        )}

        {q && error && (
          <ErrorMessage
            title={error.code === 'RATE_LIMIT' ? 'Video search limit reached' : 'Could not load videos'}
            message={error.message}
            onRetry={retry}
          />
        )}

        {q && !loading && !error && items.length === 0 && (
          <EmptyState title={`No videos found for “${q}”`} message="Check the spelling or try a broader search, like the muscle group or equipment." />
        )}

        {q && !loading && !error && items.length > 0 && (
          <>
            <p className="mb-5 text-iron-300">{items.length} videos for “{q}”</p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((v) => <li key={v.id}><VideoCard video={v} /></li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
