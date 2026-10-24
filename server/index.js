import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

const PORT = process.env.PORT || 8787;
const KEY = process.env.RAPIDAPI_KEY;
const EX_HOST = process.env.EXERCISEDB_HOST || 'exercisedb.p.rapidapi.com';
const YT_HOST = process.env.YOUTUBE_HOST || 'youtube-search-and-download.p.rapidapi.com';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* ---------- tiny cache with in-flight de-duplication ---------- */
const cache = new Map();
const inflight = new Map();

async function cached(key, ttl, loader) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  if (inflight.has(key)) return inflight.get(key);
  const promise = loader()
    .then((value) => {
      if (cache.size > 400) cache.delete(cache.keys().next().value);
      cache.set(key, { value, expires: Date.now() + ttl });
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

/* ---------- RapidAPI helper ---------- */
async function rapid(host, pathname, params = {}) {
  if (!KEY) {
    throw new HttpError(
      503,
      'RAPIDAPI_KEY is not set on the server. Add it to your .env file and restart.',
      'MISSING_KEY',
    );
  }
  const url = new URL(`https://${host}${pathname}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }

  let res;
  try {
    res = await fetch(url, {
      headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': host },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new HttpError(502, 'Could not reach the data provider. Try again in a moment.', 'UPSTREAM_UNREACHABLE');
  }

  if (res.status === 429) {
    throw new HttpError(429, 'The API rate limit for your plan has been reached. Wait a moment or upgrade your RapidAPI plan.', 'RATE_LIMIT');
  }
  if (res.status === 401 || res.status === 403) {
    throw new HttpError(502, 'RapidAPI rejected the request. Check your key and make sure you are subscribed to this API.', 'UPSTREAM_AUTH');
  }
  if (res.status === 404) throw new HttpError(404, 'Not found.', 'NOT_FOUND');
  if (!res.ok) throw new HttpError(502, `The data provider returned an error (${res.status}).`, 'UPSTREAM_ERROR');

  try {
    return await res.json();
  } catch {
    throw new HttpError(502, 'The data provider sent an unreadable response.', 'UPSTREAM_BAD_RESPONSE');
  }
}

/* ---------- normalizers (defend against missing fields) ---------- */
const toArray = (d) => (Array.isArray(d) ? d : []);
const str = (v) => (typeof v === 'string' ? v : '');

function normExercise(e = {}) {
  const instructions = Array.isArray(e.instructions)
    ? e.instructions.filter((s) => typeof s === 'string' && s.trim())
    : typeof e.instructions === 'string' && e.instructions.trim()
      ? [e.instructions]
      : [];
  return {
    id: e.id != null ? String(e.id) : '',
    name: str(e.name) || 'Untitled exercise',
    bodyPart: str(e.bodyPart),
    target: str(e.target),
    equipment: str(e.equipment),
    gifUrl: str(e.gifUrl) || str(e.imageUrl),
    secondaryMuscles: Array.isArray(e.secondaryMuscles) ? e.secondaryMuscles.filter((s) => typeof s === 'string') : [],
    instructions,
    description: str(e.description),
    difficulty: str(e.difficulty),
  };
}

function normVideo(item = {}) {
  const v = item.video;
  if (!v || !v.videoId) return null;
  const thumbs = Array.isArray(v.thumbnails) ? v.thumbnails.filter((t) => t && t.url) : [];
  const best = thumbs.reduce((a, b) => (!a || (b.width || 0) > (a.width || 0) ? b : a), null);
  return {
    id: v.videoId,
    title: str(v.title) || 'Untitled video',
    channel: str(v.channelName),
    thumbnail: best ? best.url : '',
    duration: str(v.lengthText),
    views: str(v.viewCountText),
    published: str(v.publishedTimeText),
    url: `https://www.youtube.com/watch?v=${encodeURIComponent(v.videoId)}`,
  };
}

/* ---------- app ---------- */
const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Vary', 'Origin');
  }
  next();
});

// Basic per-IP limiter so a public deployment cannot burn through your API quota.
const hits = new Map();
setInterval(() => hits.clear(), MIN).unref();
app.use('/api', (req, res, next) => {
  const ip = req.ip || 'unknown';
  const n = (hits.get(ip) || 0) + 1;
  hits.set(ip, n);
  if (n > 120) return next(new HttpError(429, 'Too many requests. Please slow down.', 'RATE_LIMIT'));
  return next();
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const clean = (v) => String(v ?? '').trim().toLowerCase().slice(0, 80);

app.get('/api/health', (req, res) => res.json({ ok: true, hasKey: Boolean(KEY) }));

app.get('/api/filters', wrap(async (req, res) => {
  const list = (kind) => cached(`list:${kind}`, 6 * HOUR, async () => toArray(await rapid(EX_HOST, `/exercises/${kind}List`)));
  const [bodyParts, targets, equipment] = await Promise.all([list('bodyPart'), list('target'), list('equipment')]);
  res.json({ bodyParts, targets, equipment });
}));

app.get('/api/exercises', wrap(async (req, res) => {
  const q = clean(req.query.q);
  const bodyPart = clean(req.query.bodyPart);
  const target = clean(req.query.target);
  const equipment = clean(req.query.equipment);
  const limit = clamp(parseInt(req.query.limit, 10) || 12, 1, 60);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  // No filters: use the API's own limit/offset pagination.
  if (!q && !bodyPart && !target && !equipment) {
    const data = await cached(`ex:all:${limit}:${offset}`, 10 * MIN, () => rapid(EX_HOST, '/exercises', { limit, offset }));
    const items = toArray(data).map(normExercise).filter((e) => e.id);
    return res.json({ items, total: null, hasMore: toArray(data).length === limit });
  }

  // Filters: the API supports one filter per call, so fetch the most selective
  // list once (cached), apply the remaining filters here, then paginate.
  const [kind, value] = q ? ['name', q] : target ? ['target', target] : bodyPart ? ['bodyPart', bodyPart] : ['equipment', equipment];
  const full = await cached(`ex:${kind}:${value}`, 10 * MIN, async () => {
    const data = await rapid(EX_HOST, `/exercises/${kind}/${encodeURIComponent(value)}`, { limit: 0 });
    return toArray(data).map(normExercise).filter((e) => e.id);
  });

  const matches = full.filter(
    (e) =>
      (!bodyPart || e.bodyPart.toLowerCase() === bodyPart) &&
      (!target || e.target.toLowerCase() === target) &&
      (!equipment || e.equipment.toLowerCase() === equipment),
  );
  return res.json({
    items: matches.slice(offset, offset + limit),
    total: matches.length,
    hasMore: offset + limit < matches.length,
  });
}));

app.get('/api/exercises/:id', wrap(async (req, res) => {
  const { id } = req.params;
  if (!/^[\w-]{1,64}$/.test(id)) throw new HttpError(400, 'Invalid exercise id.', 'BAD_REQUEST');
  const data = await cached(`ex:id:${id}`, 10 * MIN, () => rapid(EX_HOST, `/exercises/exercise/${encodeURIComponent(id)}`));
  const exercise = normExercise(data);
  if (!exercise.id) throw new HttpError(404, 'Exercise not found.', 'NOT_FOUND');
  res.json(exercise);
}));

app.get('/api/videos', wrap(async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 100);
  if (!q) throw new HttpError(400, 'Enter an exercise or workout to search for.', 'BAD_REQUEST');
  const data = await cached(`yt:${q.toLowerCase()}`, 10 * MIN, () => rapid(YT_HOST, '/search', { query: q, type: 'v', sort: 'r' }));
  const items = toArray(data?.contents).map(normVideo).filter(Boolean).slice(0, 24);
  res.json({ items });
}));

app.use('/api', (req, res, next) => next(new HttpError(404, 'Unknown API route.', 'NOT_FOUND')));

// Production: serve the built React app and fall back to index.html for client routes.
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { maxAge: '1h', index: false }));
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500 && !(err instanceof HttpError)) console.error(err);
  res.status(status).json({ error: err instanceof HttpError ? err.message : 'Something went wrong on the server.', code: err.code || 'SERVER_ERROR' });
});

app.listen(PORT, () => {
  console.log(`PowerPulse API listening on http://localhost:${PORT}`);
  if (!KEY) console.warn('Warning: RAPIDAPI_KEY is not set. API requests will fail until you add it to .env');
});
