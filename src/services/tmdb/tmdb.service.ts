import { TMDB_BASE_URL } from '../../utils/constants';
import { TMDBResponse, TMDBMovie, TMDBTVShow } from './tmdb.types';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY!;

class TMDBService {
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // -------------------------
  // VIDEO HELPERS (NEW)
  // -------------------------
  private normalizeVideoItem(v: any) {
    // returns a consistent object for each TMDB video entry
    const key = v?.key ?? null;
    const site = v?.site ?? null;
    const type = v?.type ?? null;
    const name = v?.name ?? null;
    const url = key && site === 'YouTube' ? `https://www.youtube.com/watch?v=${key}` : null;
    const thumbnail = key ? `https://img.youtube.com/vi/${key}/hqdefault.jpg` : null;
    return { id: v.id, key, site, type, name, url, thumbnail, raw: v };
  }

  /**
   * Fetch all videos (trailers, teasers, clips...) for a movie and sort them by priority.
   * Returns: { list: Video[], preferredIndex: number }
   */
  async getMovieVideos(movieId: number): Promise<{ list: any[]; preferredIndex: number } | null> {
    try {
      const data = await this.fetch<{ results: any[] }>(`/movie/${movieId}/videos`);
      const results = data?.results ?? [];
      if (!results.length) return null;

      const normalized = results.map(r => this.normalizeVideoItem(r));

      // Sorting priority: Official Trailer → Trailer → Teaser → Clip → Featurette → Behind the Scenes → Others
      const priority = (item: any) => {
        const t = (item.type || '').toLowerCase();
        if (t.includes('official') && t.includes('trailer')) return 0;
        if (t.includes('trailer')) return 1;
        if (t.includes('teaser')) return 2;
        if (t.includes('clip')) return 3;
        if (t.includes('featurette')) return 4;
        if (t.includes('behind')) return 5;
        return 6;
      };

      normalized.sort((a: any, b: any) => {
        const pa = priority(a);
        const pb = priority(b);
        if (pa !== pb) return pa - pb;
        // prefer YouTube entries first (more reliable for embed)
        if (a.site === 'YouTube' && b.site !== 'YouTube') return -1;
        if (b.site === 'YouTube' && a.site !== 'YouTube') return 1;
        return 0;
      });

      // preferredIndex is the first YouTube Trailer-like item, else first item
      const preferredIndex = normalized.findIndex((x: any) => x.type?.toLowerCase().includes('trailer') && x.site === 'YouTube');
      const finalIndex = preferredIndex >= 0 ? preferredIndex : 0;

      return { list: normalized, preferredIndex: finalIndex };
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return null;
    }
  }

  /**
   * Fetch all videos for a TV show (same logic as movies)
   */
  async getTVVideos(showId: number): Promise<{ list: any[]; preferredIndex: number } | null> {
    try {
      const data = await this.fetch<{ results: any[] }>(`/tv/${showId}/videos`);
      const results = data?.results ?? [];
      if (!results.length) return null;

      const normalized = results.map(r => this.normalizeVideoItem(r));

      const priority = (item: any) => {
        const t = (item.type || '').toLowerCase();
        if (t.includes('official') && t.includes('trailer')) return 0;
        if (t.includes('trailer')) return 1;
        if (t.includes('teaser')) return 2;
        if (t.includes('clip')) return 3;
        if (t.includes('featurette')) return 4;
        if (t.includes('behind')) return 5;
        return 6;
      };

      normalized.sort((a: any, b: any) => {
        const pa = priority(a);
        const pb = priority(b);
        if (pa !== pb) return pa - pb;
        if (a.site === 'YouTube' && b.site !== 'YouTube') return -1;
        if (b.site === 'YouTube' && a.site !== 'YouTube') return 1;
        return 0;
      });

      const preferredIndex = normalized.findIndex((x: any) => x.type?.toLowerCase().includes('trailer') && x.site === 'YouTube');
      const finalIndex = preferredIndex >= 0 ? preferredIndex : 0;

      return { list: normalized, preferredIndex: finalIndex };
    } catch (error) {
      console.error('Error fetching TV videos:', error);
      return null;
    }
  }

  // Movies
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> {
    const data = await this.fetch<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`);
    return data.results;
  }

  async getPopularMovies(page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.fetch<TMDBResponse<TMDBMovie>>('/movie/popular', { page: page.toString() });
    return data.results;
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.fetch<TMDBResponse<TMDBMovie>>('/search/movie', {
      query,
      page: page.toString(),
    });
    return data.results;
  }

  async getMovieDetails(movieId: number): Promise<any> {
    return this.fetch(`/movie/${movieId}`);
  }

  async discoverMovies(params: {
    with_genres?: string;
    with_original_language?: string;
    page?: number;
  }): Promise<TMDBMovie[]> {
    const data = await this.fetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
      ...params,
      page: params.page?.toString() || '1',
    });
    return data.results;
  }

  // TV Shows
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBTVShow[]> {
    const data = await this.fetch<TMDBResponse<TMDBTVShow>>(`/trending/tv/${timeWindow}`);
    return data.results;
  }

  async getPopularTVShows(page: number = 1): Promise<TMDBTVShow[]> {
    const data = await this.fetch<TMDBResponse<TMDBTVShow>>('/tv/popular', { page: page.toString() });
    return data.results;
  }

  async searchTVShows(query: string, page: number = 1): Promise<TMDBTVShow[]> {
    const data = await this.fetch<TMDBResponse<TMDBTVShow>>('/search/tv', {
      query,
      page: page.toString(),
    });
    return data.results;
  }

  async getTVShowDetails(showId: number): Promise<any> {
    return this.fetch(`/tv/${showId}`);
  }

  async discoverTVShows(params: {
    with_genres?: string;
    with_original_language?: string;
    page?: number;
  }): Promise<TMDBTVShow[]> {
    const data = await this.fetch<TMDBResponse<TMDBTVShow>>('/discover/tv', {
      ...params,
      page: params.page?.toString() || '1',
    });
    return data.results;
  }

  // Genres
  async getMovieGenres(): Promise<{ id: number; name: string }[]> {
    const data = await this.fetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
    return data.genres;
  }

  async getTVGenres(): Promise<{ id: number; name: string }[]> {
    const data = await this.fetch<{ genres: { id: number; name: string }[] }>('/genre/tv/list');
    return data.genres;
  }

  // Cast & Crew
  async getMovieCredits(movieId: number): Promise<any> {
    return this.fetch(`/movie/${movieId}/credits`);
  }

  async getTVCredits(showId: number): Promise<any> {
    return this.fetch(`/tv/${showId}/credits`);
  }

  // Similar & Recommendations
  async getSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
    const data = await this.fetch<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/similar`);
    return data.results;
  }

  async getRecommendedMovies(movieId: number): Promise<TMDBMovie[]> {
    const data = await this.fetch<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/recommendations`);
    return data.results;
  }

  async getSimilarTVShows(showId: number): Promise<TMDBTVShow[]> {
    const data = await this.fetch<TMDBResponse<TMDBTVShow>>(`/tv/${showId}/similar`);
    return data.results;
  }

  async getRecommendedTVShows(showId: number): Promise<TMDBTVShow[]> {
    const data = await this.fetch<TMDBResponse<TMDBTVShow>>(`/tv/${showId}/recommendations`);
    return data.results;
  }

  // Watch Providers
  async getMovieWatchProviders(movieId: number): Promise<any> {
    return this.fetch(`/movie/${movieId}/watch/providers`);
  }

  async getTVWatchProviders(showId: number): Promise<any> {
    return this.fetch(`/tv/${showId}/watch/providers`);
  }

  // Helper to get image URL
  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbService = new TMDBService();
