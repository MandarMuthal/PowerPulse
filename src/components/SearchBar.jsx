import { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  defaultValue = '',
  onSubmit,
  placeholder = 'Search exercises',
  label = 'Search',
  buttonLabel = 'Search',
  className = '',
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);

    useEffect(() => {
     setValue(defaultValue);
   }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={`flex w-full gap-2 ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-iron-400" aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={100}
          className="field pl-12"
        />
      </div>
      <button type="submit" className="btn-primary">{buttonLabel}</button>
    </form>
  );
}
