import ExerciseCard from './ExerciseCard.jsx';
import { ExerciseSkeleton } from './Loader.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import EmptyState from './EmptyState.jsx';

export default function ExerciseGrid({
  items,
  loading,
  error,
  onRetry,
  skeletonCount = 8,
  emptyTitle = 'No exercises found',
  emptyMessage = 'Try a different name or clear some filters.',
  emptyAction,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}) {
  if (loading) {
    return (
      <div className={`grid gap-5 ${columns}`} aria-busy="true" aria-label="Loading exercises">
        {Array.from({ length: skeletonCount }, (_, i) => <ExerciseSkeleton key={i} />)}
      </div>
    );
  }
  if (error) {
    return <ErrorMessage title="Could not load exercises" message={error.message} onRetry={onRetry} />;
  }
  if (!items.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }
  return (
    <ul className={`grid gap-5 ${columns}`}>
      {items.map((exercise) => (
        <li key={exercise.id}><ExerciseCard exercise={exercise} /></li>
      ))}
    </ul>
  );
}
