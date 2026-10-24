import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/Hero.jsx';
import ExerciseGrid from '../components/ExerciseGrid.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { VideoSkeleton } from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getExercises } from '../services/exerciseService.js';
import { searchVideos } from '../services/youtubeService.js';
import { POPULAR_BODY_PARTS, POPULAR_TARGETS } from '../utils/constants.js';

const dayOfYear = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

async function loadFeatured(signal) {
  // A different slice each day so the section feels fresh without extra storage.
  const offset = (dayOfYear() * 8) % 1000;
  const res = await getExercises({ limit: 8, offset }, signal);
  if (res.items?.length) return res.items;
  return (await getExercises({ limit: 8, offset: 0 }, signal)).items;
}

function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      {to && (
        <Link to={to} className="hidden items-center gap-1 font-semibold text-lime-400 hover:text-lime-300 sm:inline-flex">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const featured = useAsync(loadFeatured, []);
  const videos = useAsync((signal) => searchVideos('full body workout for beginners', signal), []);

  return (
    <>
      <Hero />

      <section className="container-x pt-16" aria-labelledby="browse-heading">
        <h2 id="browse-heading" className="section-title mb-8">Train what matters today</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-2xl">By body part</h3>
            <ul className="flex flex-wrap gap-2">
              {POPULAR_BODY_PARTS.map((p) => (
                <li key={p}>
                  <Link to={`/body-parts?type=bodyPart&value=${encodeURIComponent(p)}`} className="chip px-4 py-2 text-base hover:border-lime-400 hover:text-lime-300">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-2xl">By target muscle</h3>
            <ul className="flex flex-wrap gap-2">
              {POPULAR_TARGETS.map((t) => (
                <li key={t}>
                  <Link to={`/body-parts?type=target&value=${encodeURIComponent(t)}`} className="chip px-4 py-2 text-base hover:border-lime-400 hover:text-lime-300">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-x pt-20">
        <SectionHeader title="Featured exercises" to="/exercises" linkLabel="See all exercises" />
        <ExerciseGrid items={featured.data || []} loading={featured.loading} error={featured.error} onRetry={featured.retry} />
      </section>

      <section className="container-x pt-20">
        <SectionHeader title="Recommended workout videos" to="/videos" linkLabel="Search videos" />
        {videos.loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => <VideoSkeleton key={i} />)}
          </div>
        )}
        {videos.error && <ErrorMessage title="Could not load videos" message={videos.error.message} onRetry={videos.retry} />}
        {!videos.loading && !videos.error && !(videos.data?.items || []).length && (
          <EmptyState title="No videos right now" message="Try searching for a specific workout." action={<Link to="/videos" className="btn-outline">Search videos</Link>} />
        )}
        {!videos.loading && !videos.error && (videos.data?.items || []).length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videos.data.items.slice(0, 4).map((v) => <li key={v.id}><VideoCard video={v} /></li>)}
          </ul>
        )}
      </section>

      <section className="container-x pt-24">
        <div className="rounded-2xl bg-lime-400 p-8 text-iron-950 sm:p-12">
          <h2 className="max-w-2xl text-5xl sm:text-6xl">Pick a muscle group and get to work.</h2>
          <p className="mt-3 max-w-xl text-lg text-iron-800">Every exercise comes with a demo and step-by-step instructions.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/body-parts" className="btn bg-iron-950 text-iron-100 hover:bg-iron-800">Start training</Link>
            <Link to="/exercises" className="btn border border-iron-950 text-iron-950 hover:bg-iron-950/10">Explore exercises</Link>
          </div>
        </div>
      </section>
    </>
  );
}
