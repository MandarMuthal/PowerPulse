export default function RecentSearches({ items, onPick, onClear }) {
  if (!items.length) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-iron-400">Recent:</span>
      {items.map((term) => (
        <button key={term} type="button" onClick={() => onPick(term)} className="chip hover:border-lime-400 hover:text-lime-300">
          {term}
        </button>
      ))}
      <button type="button" onClick={onClear} className="text-iron-400 underline-offset-2 hover:text-iron-100 hover:underline">
        Clear
      </button>
    </div>
  );
}
