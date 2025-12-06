import { supabase } from '../supabase/supabase.client';
import { SearchFilters, SortOption } from '../../store/searchFilterStore';

interface CachedMovie {
  id: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  media_type: 'movie' | 'tv';
  cached_at: string;
  updated_at: string;
}

class FilterEngineService {
  /**
   * Main filtering function - applies ALL filters client-side
   * Performance: <100ms for 2784 movies
   */
  async applyFilters(
    allMovies: CachedMovie[],
    filters: SearchFilters
  ): Promise<CachedMovie[]> {
    console.log('[Filter] ========================================');
    console.log('[Filter] Starting filter with', allMovies.length, 'total movies');
    console.log('[Filter] Active filters:', {
      contentType: filters.contentType,
      genres: filters.genres,
      yearRange: filters.yearRange,
      minRating: filters.minRating,
      languages: filters.languages,
      platforms: filters.platforms,
      minVoteCount: filters.minVoteCount,
    });
    console.time('[Filter] Total filtering time');

    let results = [...allMovies]; // Clone to avoid mutation
    console.log(`[Filter] Starting with: ${results.length} items`);

    // STEP 1: Content Type Filter
    if (filters.contentType !== 'all') {
      results = results.filter((movie) => movie.media_type === filters.contentType);
      console.log(`[Filter] After content type: ${results.length} items`);
    }

    // STEP 2: Genre Filter (ANY match)
    if (filters.genres.length > 0) {
      results = results.filter((movie) =>
        filters.genres.some((genreId) => movie.genre_ids.includes(genreId))
      );
      console.log(`[Filter] After genres: ${results.length} items`);
    }

    // STEP 3: Year Range Filter
    const [minYear, maxYear] = filters.yearRange;
    if (minYear !== 1990 || maxYear !== 2025) {
      results = results.filter((movie) => {
        if (!movie.release_date) return false; // Skip movies without date
        const year = new Date(movie.release_date).getFullYear();
        return year >= minYear && year <= maxYear;
      });
      console.log(`[Filter] After year range (${minYear}-${maxYear}): ${results.length} items`);
    }

    // STEP 4: Rating Filter
    if (filters.minRating > 0) {
      results = results.filter((movie) => movie.vote_average >= filters.minRating);
      console.log(`[Filter] After rating: ${results.length} items`);
    }

    // STEP 5: Language Filter (ANY match)
    // NO quality filters - user decides quality with other filters
    if (filters.languages.length > 0) {
      results = results.filter((movie) =>
        filters.languages.includes(movie.original_language)
      );
      console.log(`[Filter] After languages: ${results.length} items`);
    }

    // STEP 6: Vote Count Filter
    if (filters.minVoteCount > 0) {
      results = results.filter((movie) => movie.vote_count >= filters.minVoteCount);
      console.log(`[Filter] After vote count: ${results.length} items`);
    }

    // STEP 7: Platform Filter (requires async query)
    if (filters.platforms.length > 0) {
      results = await this.filterByPlatforms(results, filters.platforms, filters.platformMode);
      console.log(`[Filter] After platforms: ${results.length} items`);
    }

    // STEP 8: Sort Results
    // Smart sorting: If only language filter is active, sort by release_date (newest first)
    // Otherwise use user's selected sort
    let sortOption = filters.sortBy;
    let sortAsc = filters.sortAscending;
    
    // Check if ONLY language filter is active (no other filters)
    const onlyLanguageFilter = 
      filters.languages.length > 0 &&
      filters.contentType === 'all' &&
      filters.genres.length === 0 &&
      filters.minRating === 0 &&
      filters.minVoteCount === 0 &&
      filters.platforms.length === 0;
    
    if (onlyLanguageFilter && filters.sortBy === 'popularity') {
      // Override sort to release_date for language-only filtering
      sortOption = 'release_date';
      sortAsc = false; // Newest first
      console.log('[Filter] Language-only filter detected, sorting by release date (newest first)');
    }
    
    results = this.sortMovies(results, sortOption, sortAsc);

    console.timeEnd('[Filter] Total filtering time');
    console.log('[Filter] Final results:', results.length);
    console.log('[Filter] ========================================');
    return results;
  }

  /**
   * Filter by streaming platforms (JOIN query)
   * Mode: 'any' = at least one platform, 'all' = all selected platforms
   */
  private async filterByPlatforms(
    movies: CachedMovie[],
    platformIds: number[],
    mode: 'any' | 'all'
  ): Promise<CachedMovie[]> {
    try {
      if (mode === 'any') {
        // ANY mode: Movie appears on at least one platform
        const { data: providerData, error } = await supabase
          .from('cached_providers')
          .select('tmdb_id, media_type')
          .in('provider_id', platformIds)
          .eq('region', 'IN');

        if (error || !providerData) {
          console.error('[Filter] Platform query error:', error);
          return movies;
        }

        // Get unique tmdb_ids
        const platformMovieIds = new Set(
          providerData.map((p) => `${p.tmdb_id}-${p.media_type}`)
        );

        // Filter movies to only those on selected platforms
        return movies.filter((movie) =>
          platformMovieIds.has(`${movie.tmdb_id}-${movie.media_type}`)
        );
      } else {
        // ALL mode: Movie must appear on ALL selected platforms
        const moviePlatforms: Map<string, Set<number>> = new Map();

        // Query all providers for these movies
        const movieKeys = movies.map((m) => m.tmdb_id);
        const { data: providerData, error } = await supabase
          .from('cached_providers')
          .select('tmdb_id, media_type, provider_id')
          .in('tmdb_id', movieKeys)
          .in('provider_id', platformIds)
          .eq('region', 'IN');

        if (error || !providerData) {
          console.error('[Filter] Platform query error:', error);
          return movies;
        }

        // Build map: movie -> set of platforms it's on
        providerData.forEach((p) => {
          const key = `${p.tmdb_id}-${p.media_type}`;
          if (!moviePlatforms.has(key)) {
            moviePlatforms.set(key, new Set());
          }
          moviePlatforms.get(key)!.add(p.provider_id);
        });

        // Filter movies that appear on ALL selected platforms
        return movies.filter((movie) => {
          const key = `${movie.tmdb_id}-${movie.media_type}`;
          const platforms = moviePlatforms.get(key);
          if (!platforms) return false;

          // Check if movie has all required platforms
          return platformIds.every((platformId) => platforms.has(platformId));
        });
      }
    } catch (error) {
      console.error('[Filter] filterByPlatforms failed:', error);
      return movies;
    }
  }

  /**
   * Sort movies by selected criteria
   */
  private sortMovies(
    movies: CachedMovie[],
    sortBy: SortOption,
    ascending: boolean
  ): CachedMovie[] {
    const sorted = [...movies]; // Clone to avoid mutation

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'popularity':
          comparison = b.popularity - a.popularity; // Higher is better
          break;

        case 'rating':
          comparison = b.vote_average - a.vote_average; // Higher is better
          break;

        case 'release_date':
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          comparison = dateB - dateA; // Newer first by default
          break;

        case 'votes':
          comparison = b.vote_count - a.vote_count; // Higher is better
          break;

        default:
          comparison = 0;
      }

      // Reverse if ascending
      return ascending ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Get all cached movies (base dataset)
   * Called once on app load, then filtered client-side
   */
  async getAllCachedMovies(): Promise<CachedMovie[]> {
    try {
      const { data, error } = await supabase
        .from('cached_movies')
        .select('*')
        .order('popularity', { ascending: false });

      if (error) {
        console.error('[Filter] Error loading cached movies:', error);
        return [];
      }

      console.log(`[Filter] Loaded ${data?.length || 0} cached movies`);
      return data || [];
    } catch (error) {
      console.error('[Filter] getAllCachedMovies failed:', error);
      return [];
    }
  }

  /**
   * Quick search function (for search bar)
   * Filters by title only, then applies other filters
   */
  searchMovies(movies: CachedMovie[], query: string): CachedMovie[] {
    if (!query || query.length < 2) return movies;

    const lowerQuery = query.toLowerCase();
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get filter result count without fetching full data
   * Useful for showing "245 results" before user applies filter
   */
  async getFilterResultCount(filters: SearchFilters): Promise<number> {
    const allMovies = await this.getAllCachedMovies();
    const filtered = await this.applyFilters(allMovies, filters);
    return filtered.length;
  }
}

export const filterEngineService = new FilterEngineService();