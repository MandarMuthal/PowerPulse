import { request } from './api.js';

export const getExercises = (params, signal) => request('/exercises', { params, signal });

export const getExercise = (id, signal) => request(`/exercises/${encodeURIComponent(id)}`, { signal });

// The filter lists (body parts, muscles, equipment) rarely change, so share one request.
let filtersPromise = null;
export function getFilters() {
  if (!filtersPromise) {
    filtersPromise = request('/filters').catch((err) => {
      filtersPromise = null;
      throw err;
    });
  }
  return filtersPromise;
}
