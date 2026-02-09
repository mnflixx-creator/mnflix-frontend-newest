export const SAVE_INTERVAL_MS = 120000; // 2 minutes
export const SYNC_DELAY_MS = 3000; // 3 seconds
export const FORCE_SYNC_MAX_AGE_MS = 300000; // 5 minutes
export const POSITION_THRESHOLD = 30; // seconds
export const MIN_SAVE_POSITION = 5; // seconds
export const COMPLETE_THRESHOLD = 0.93; // 93%
export const RESUME_BLOCK_THRESHOLD = 0.95; // 95%
export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const KEY_PREFIX = "progress:";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const toFiniteNumber = (value: any, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizePart = (value: any): number => {
  const n = toFiniteNumber(value, 0);
  return n >= 0 ? Math.floor(n) : 0;
};

export const buildProgressKey = (movieId: string | number, season = 0, episode = 0): string => {
  return `${KEY_PREFIX}${movieId}:${normalizePart(season)}:${normalizePart(episode)}`;
};

interface CachedProgress {
  position: number;
  duration: number;
  updated: number;
}

const parseCachedProgress = (raw: string | null): CachedProgress | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const position = toFiniteNumber(parsed?.position, -1);
    const duration = toFiniteNumber(parsed?.duration, -1);
    const updated = toFiniteNumber(parsed?.updated, 0);

    if (position < 0 || duration <= 0 || updated <= 0) return null;

    return {
      position: Math.floor(position),
      duration: Math.floor(duration),
      updated,
    };
  } catch {
    return null;
  }
};

export const isCompletedPosition = (position: number, duration: number): boolean => {
  const pos = toFiniteNumber(position, 0);
  const dur = toFiniteNumber(duration, 0);
  if (dur <= 0) return false;
  return pos / dur >= COMPLETE_THRESHOLD;
};

export const getStoredProgressData = (
  movieId: string | number,
  season = 0,
  episode = 0
): CachedProgress | null => {
  if (!movieId || !isBrowser()) return null;

  const key = buildProgressKey(movieId, season, episode);
  const data = parseCachedProgress(window.localStorage.getItem(key));
  if (!data) return null;

  const age = Date.now() - data.updated;
  if (age > CACHE_MAX_AGE_MS) {
    window.localStorage.removeItem(key);
    return null;
  }

  if (data.position / data.duration >= RESUME_BLOCK_THRESHOLD) {
    return null;
  }

  return data;
};

export const getStoredProgress = (
  movieId: string | number,
  season = 0,
  episode = 0
): number | null => {
  const data = getStoredProgressData(movieId, season, episode);
  return data ? data.position : null;
};

export const saveStoredProgress = (
  movieId: string | number,
  season = 0,
  episode = 0,
  position: number,
  duration: number
): void => {
  if (!movieId || !isBrowser()) return;

  const pos = toFiniteNumber(position, -1);
  const dur = toFiniteNumber(duration, -1);
  if (pos < 0 || dur <= 0) return;

  const key = buildProgressKey(movieId, season, episode);

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        position: Math.floor(pos),
        duration: Math.floor(dur),
        updated: Date.now(),
      })
    );
  } catch {
    // Ignore storage quota/private mode errors.
  }
};

export const clearStoredProgress = (
  movieId: string | number,
  season = 0,
  episode = 0
): void => {
  if (!movieId || !isBrowser()) return;

  try {
    window.localStorage.removeItem(buildProgressKey(movieId, season, episode));
  } catch {
    // no-op
  }
};

export const cleanupOldProgress = (): void => {
  if (!isBrowser()) return;

  const now = Date.now();

  try {
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(KEY_PREFIX)) continue;

      const data = parseCachedProgress(window.localStorage.getItem(key));
      if (!data) {
        window.localStorage.removeItem(key);
        continue;
      }

      if (now - data.updated > CACHE_MAX_AGE_MS) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // no-op
  }
};
