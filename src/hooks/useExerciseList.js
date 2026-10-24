import { useCallback, useEffect, useRef, useState } from 'react';
import { getExercises } from '../services/exerciseService.js';

const INITIAL = { items: [], loading: true, loadingMore: false, error: null, moreError: null, hasMore: false, total: null };

export function useExerciseList(filters, pageSize = 12, enabled = true) {
  const key = JSON.stringify(filters);
  const [state, setState] = useState(INITIAL);
  const [attempt, setAttempt] = useState(0);
  const offsetRef = useRef(0);
  const controllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    offsetRef.current = 0;

    if (!enabled) {
      setState({ ...INITIAL, loading: false });
      return undefined;
    }
    setState(INITIAL);

    getExercises({ ...filters, limit: pageSize, offset: 0 }, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        offsetRef.current = pageSize;
        setState({ ...INITIAL, items: res.items || [], loading: false, hasMore: Boolean(res.hasMore), total: res.total ?? null });
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === 'AbortError') return;
        setState({ ...INITIAL, loading: false, error });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pageSize, attempt, enabled]);

  const loadMore = useCallback(() => {
    if (state.loading || state.loadingMore || !state.hasMore || !controllerRef.current) return;
    const { signal } = controllerRef.current;
    setState((s) => ({ ...s, loadingMore: true, moreError: null }));

    getExercises({ ...filters, limit: pageSize, offset: offsetRef.current }, signal)
      .then((res) => {
        if (signal.aborted) return;
        offsetRef.current += pageSize;
        setState((s) => {
          const seen = new Set(s.items.map((e) => e.id));
          const fresh = (res.items || []).filter((e) => !seen.has(e.id));
          return { ...s, items: [...s.items, ...fresh], loadingMore: false, hasMore: Boolean(res.hasMore), total: res.total ?? s.total };
        });
      })
      .catch((error) => {
        if (signal.aborted || error.name === 'AbortError') return;
        setState((s) => ({ ...s, loadingMore: false, moreError: error }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loading, state.loadingMore, state.hasMore, key, pageSize]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, loadMore, retry };
}
