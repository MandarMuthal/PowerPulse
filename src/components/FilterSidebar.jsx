import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { titleCase } from '../utils/format.js';

function Select({ id, label, value, options, onChange, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-iron-300">{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="field capitalize">
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{titleCase(o)}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterSidebar({ lists, loading, error, onRetry, values, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const active = ['bodyPart', 'target', 'equipment'].filter((k) => values[k]).length;
  const disabled = loading || Boolean(error);

  return (
    <aside aria-label="Exercise filters" className="rounded-xl border border-iron-700 bg-iron-900 p-4 lg:sticky lg:top-24">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filter-panel"
        className="flex w-full items-center justify-between text-left lg:pointer-events-none"
      >
        <span className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <SlidersHorizontal className="h-5 w-5 text-lime-400" aria-hidden="true" />
          Filters{active > 0 && <span className="text-lime-400">({active})</span>}
        </span>
        <span className="text-sm text-iron-400 lg:hidden">{open ? 'Hide' : 'Show'}</span>
      </button>

      <div id="filter-panel" className={`${open ? 'block' : 'hidden'} mt-4 space-y-4 lg:block`}>
        {error && (
          <p role="alert" className="text-sm text-red-300">
            Filter options could not load.{' '}
            <button type="button" onClick={onRetry} className="underline">Retry</button>
          </p>
        )}
        <Select id="f-body" label="Body part" value={values.bodyPart} options={lists?.bodyParts || []} disabled={disabled} onChange={(v) => onChange('bodyPart', v)} />
        <Select id="f-target" label="Target muscle" value={values.target} options={lists?.targets || []} disabled={disabled} onChange={(v) => onChange('target', v)} />
        <Select id="f-equip" label="Equipment" value={values.equipment} options={lists?.equipment || []} disabled={disabled} onChange={(v) => onChange('equipment', v)} />
        <button type="button" onClick={onClear} disabled={active === 0} className="btn-outline w-full">
          Clear filters
        </button>
      </div>
    </aside>
  );
}
