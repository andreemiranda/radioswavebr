export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  country: string;
  state?: string;
  tags?: string[];
  favicon?: string;
  codec?: string;
  bitrate?: number;
  votes?: number;
  /** Radio-Browser API flags this stream as an HLS (.m3u8) playlist, even when the URL itself doesn't end in .m3u8. */
  hls?: boolean;
}

export interface Tag {
  name: string;
  stationcount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total: number;
  error?: string;
}

export interface SearchFilters {
  name?: string;
  tag?: string;
  state?: string;
  limit?: number;
  offset?: number;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
