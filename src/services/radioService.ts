import axios from 'axios';
import { RadioStation, Tag, ApiResponse, SearchFilters } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Cleans up raw station names coming from the Radio Browser API:
 * - Removes "sinal fraco" (and similar weak-signal notes), replacing with "sem sinal"
 * - Removes stray hyphens used as separators/hyphenation
 * - Collapses extra whitespace left behind
 */
function cleanStationName(rawName: string): string {
  if (!rawName) return '';

  let name = rawName
    .replace(/\(?\s*sinal\s+fraco\s*\)?/gi, 'Sem Sinal')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return name;
}

/**
 * Service to handle radio station data fetching and normalization.
 */
export const radioService = {
  /**
   * Normalizes raw API data to the RadioStation interface.
   */
  normalize(raw: any): RadioStation {
    return {
      id: raw.stationuuid,
      name: cleanStationName(raw.name),
      streamUrl: raw.url_resolved || raw.url,
      country: raw.country,
      state: raw.state || '',
      tags: raw.tags ? raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      favicon: raw.favicon,
      codec: raw.codec,
      bitrate: raw.bitrate,
      votes: raw.votes,
      hls: raw.hls === 1 || raw.hls === true
    };
  },

  /**
   * Fetches popular Brazilian stations.
   */
  async getBrazilStations(limit = 24, offset = 0): Promise<ApiResponse<RadioStation[]>> {
    const response = await axios.get<{ success: boolean; data: any[]; total: number; error?: string }>(
      `${API_BASE}/stations/bycountry/Brazil`,
      {
        params: {
          limit,
          offset,
          order: 'votes',
          reverse: 'true',
          hidebroken: 'true'
        }
      }
    );

    const stations = Array.isArray(response.data?.data) ? response.data.data : [];

    return {
      success: response.data?.success ?? true,
      data: stations.map(s => this.normalize(s)),
      total: response.data?.total ?? (offset + stations.length)
    };
  },

  /**
   * Searches for stations with filters.
   */
  async searchStations(filters: SearchFilters): Promise<ApiResponse<RadioStation[]>> {
    const { name, tag, state, limit = 20, offset = 0 } = filters;
    const response = await axios.get<{ success: boolean; data: any[]; total: number; error?: string }>(
      `${API_BASE}/stations/search`,
      {
        params: {
          name,
          tag,
          state,
          limit,
          offset,
          country: 'Brazil',
          order: 'votes',
          reverse: 'true',
          hidebroken: 'true'
        }
      }
    );

    const stations = Array.isArray(response.data?.data) ? response.data.data : [];

    return {
      success: response.data?.success ?? true,
      data: stations.map(s => this.normalize(s)),
      total: response.data?.total ?? (offset + stations.length)
    };
  },

  /**
   * Fetches popular tags/genres.
   */
  async getTags(limit = 30): Promise<ApiResponse<Tag[]>> {
    const response = await axios.get<{ success: boolean; data: Tag[]; total: number; error?: string }>(
      `${API_BASE}/tags`,
      {
        params: {
          limit,
          order: 'stationcount',
          reverse: 'true',
          hidebroken: 'true'
        }
      }
    );

    const tags = Array.isArray(response.data?.data) ? response.data.data : [];

    return {
      success: response.data?.success ?? true,
      data: tags,
      total: response.data?.total ?? tags.length
    };
  }
};
