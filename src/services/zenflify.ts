import apiClient from '../utils/api';
import { Subtitle } from '../types/player';

export interface ZenflifyStream {
  id: number;
  name: string;
  url: string;
  provider: string;
  quality: string;
}

export interface ZenflifySubtitle {
  url: string;
  label: string;
  language: string;
  kind?: 'subtitles' | 'captions';
}

export interface ZenflifyResponse {
  streams?: ZenflifyStream[];
  sources?: ZenflifyStream[];
  subtitles?: ZenflifySubtitle[];
  captions?: ZenflifySubtitle[];
  count?: number;
  cached?: boolean;
  fresh?: boolean;
}

export interface WatchProgress {
  movieId: string;
  currentTime: number;
  duration: number;
  lastWatched: string;
  completed: boolean;
}

/**
 * Get streaming sources from Zenflify for movies
 */
export async function getZenflifyMovieStreams(
  tmdbId: number,
  title?: string
): Promise<ZenflifyResponse> {
  try {
    const params = title ? { title } : {};
    const response = await apiClient.get(`/api/zentlify/movie/${tmdbId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch movie streams:', error);
    throw new Error('Unable to load streaming sources');
  }
}

/**
 * Get streaming sources from Zenflify for series
 */
export async function getZenflifySeriesStreams(
  tmdbId: number,
  season: number,
  episode: number,
  title?: string
): Promise<ZenflifyResponse> {
  try {
    const params = { season, episode, ...(title ? { title } : {}) };
    const response = await apiClient.get(`/api/zentlify/series/${tmdbId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch series streams:', error);
    throw new Error('Unable to load streaming sources');
  }
}

/**
 * Get streaming sources from Zenflify for anime
 */
export async function getZenflifyAnimeStreams(
  tmdbId: number,
  season: number,
  episode: number,
  title?: string
): Promise<ZenflifyResponse> {
  try {
    const params = { season, episode, ...(title ? { title } : {}) };
    const response = await apiClient.get(`/api/zentlify/anime/${tmdbId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch anime streams:', error);
    throw new Error('Unable to load streaming sources');
  }
}

/**
 * Save watch progress
 */
export async function saveWatchProgress(
  movieId: string,
  currentTime: number,
  duration: number
): Promise<void> {
  try {
    await apiClient.post(`/api/progress/${movieId}`, {
      currentTime,
      duration,
      watched: (currentTime / duration) * 100,
    });
  } catch (error) {
    console.error('Failed to save watch progress:', error);
    // Don't throw - progress saving shouldn't break playback
  }
}

/**
 * Get watch progress
 */
export async function getWatchProgress(movieId: string): Promise<WatchProgress | null> {
  try {
    const response = await apiClient.get(`/api/progress/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get watch progress:', error);
    return null;
  }
}

/**
 * Get subtitle files
 */
export async function getSubtitles(movieId: string): Promise<Subtitle[]> {
  try {
    const response = await apiClient.get(`/api/subtitles/${movieId}`);
    return response.data.map((sub: ZenflifySubtitle) => ({
      ...sub,
      kind: sub.kind || 'subtitles'
    }));
  } catch (error) {
    console.error('Failed to fetch subtitles:', error);
    return [];
  }
}
