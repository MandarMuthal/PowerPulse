import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

export function useRecentSearches(key, max = 5) {
  const [items, setItems] = useLocalStorage(key, []);

  const add = useCallback(
    (term) => {
      const value = term.trim();
      if (!value) return;
      setItems((prev) => [value, ...prev.filter((t) => t.toLowerCase() !== value.toLowerCase())].slice(0, max));
    },
    [setItems, max],
  );
  const clear = useCallback(() => setItems([]), [setItems]);

  return { items, add, clear };
}
