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

  // Cast & Crew - NEW METHODS
  async getMovieCredits(movieId: number): Promise<any> {
    return this.fetch(`/movie/${movieId}/credits`);
  }

  async getTVCredits(showId: number): Promise<any> {
    return this.fetch(`/tv/${showId}/credits`);
  }

  // Similar & Recommendations - NEW METHODS
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

  // Watch Providers - NEW METHODS
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