import apiClient from '../utils/api';

export interface ZenflifyStream {
  id: number;
  name: string;
  url: string;
  provider: string;
  quality: string;
}

export interface ZenflifyResponse {
  streams?: ZenflifyStream[];
  sources?: ZenflifyStream[];
  subtitles?: any[];
  captions?: any[];
  count?: number;
  cached?: boolean;
  fresh?: boolean;
}

/**
 * Get streaming sources from Zenflify for movies
 */
export async function getZenflifyMovieStreams(
  tmdbId: number,
  title?: string
): Promise<ZenflifyResponse> {
  const params = title ? { title } : {};
  const response = await apiClient.get(`/api/zentlify/movie/${tmdbId}`, { params });
  return response.data;
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
  const params = { season, episode, ...(title ? { title } : {}) };
  const response = await apiClient.get(`/api/zentlify/series/${tmdbId}`, { params });
  return response.data;
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
  const params = { season, episode, ...(title ? { title } : {}) };
  const response = await apiClient.get(`/api/zentlify/anime/${tmdbId}`, { params });
  return response.data;
}
