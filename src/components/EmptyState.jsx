import { SearchX } from 'lucide-react';

export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-iron-600 p-10 text-center">
      <SearchX className="mx-auto h-9 w-9 text-iron-400" aria-hidden="true" />
      <h3 className="mt-3 text-2xl">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-md text-iron-300">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
