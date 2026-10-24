import { request } from './api.js';

export const searchVideos = (q, signal) => request('/videos', { params: { q }, signal });
