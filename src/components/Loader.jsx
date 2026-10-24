export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-iron-300" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-iron-600 border-t-lime-400" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function ExerciseSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-iron-700 bg-iron-900" aria-hidden="true">
      <div className="aspect-square bg-iron-800" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-iron-800" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-iron-800" />
          <div className="h-6 w-20 rounded-full bg-iron-800" />
        </div>
      </div>
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-video rounded-xl bg-iron-800" />
      <div className="mt-3 h-4 w-11/12 rounded bg-iron-800" />
      <div className="mt-2 h-4 w-1/2 rounded bg-iron-800" />
    </div>
  );
}
