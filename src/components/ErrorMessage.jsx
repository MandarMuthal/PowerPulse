import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorMessage({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div role="alert" className={`rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center ${className}`}>
      <AlertTriangle className="mx-auto h-8 w-8 text-red-400" aria-hidden="true" />
      <h3 className="mt-3 text-2xl text-iron-100">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-md text-iron-300">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-4">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
