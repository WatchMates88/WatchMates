import { supabase } from './supabase.client';

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

class CacheService {
  /**
   * Get movies by genre (from cache)
   */
  async getMoviesByGenre(genreId: number, limit: number = 20): Promise<CachedMovie[]> {
    try {
      const { data, error } = await supabase
        .from('cached_movies')
        .select('*')
        .contains('genre_ids', [genreId])
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Cache] Error fetching by genre:', error);
        throw error;
      }

      console.log(`[Cache] Found ${data?.length || 0} movies for genre ${genreId}`);
      return data || [];
    } catch (error) {
      console.error('[Cache] getMoviesByGenre failed:', error);
      return [];
    }
  }

  /**
   * Get movies by language (from cache)
   * Filters for quality content (6.0+ rating, 100+ votes)
   */
  async getMoviesByLanguage(languageCode: string, limit: number = 20): Promise<CachedMovie[]> {
    try {
      const { data, error } = await supabase
        .from('cached_movies')
        .select('*')
        .eq('original_language', languageCode)
        .gte('vote_average', 6.0)
        .gte('vote_count', 100)
        .order('vote_average', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Cache] Error fetching by language:', error);
        throw error;
      }

      console.log(`[Cache] Found ${data?.length || 0} movies for language ${languageCode}`);
      return data || [];
    } catch (error) {
      console.error('[Cache] getMoviesByLanguage failed:', error);
      return [];
    }
  }

  /**
   * Get movies by provider using JOIN (optimized single query)
   * Excludes Aha automatically (not in cached_providers)
   */
  async getMoviesByProvider(
    providerId: number, 
    region: string = 'IN', 
    limit: number = 20
  ): Promise<CachedMovie[]> {
    try {
      // Use JOIN to get movies in one query
      const { data, error } = await supabase
        .from('cached_providers')
        .select(`
          tmdb_id,
          cached_movies (*)
        `)
        .eq('provider_id', providerId)
        .eq('region', region)
        .limit(limit);

      if (error) {
        console.error('[Cache] Error fetching by provider:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log(`[Cache] No movies found for provider ${providerId} in ${region}`);
        return [];
      }

      // Extract movies from joined data
      const movies = data
        .map((item: any) => item.cached_movies)
        .filter(Boolean);

      console.log(`[Cache] Found ${movies.length} movies for provider ${providerId} in ${region}`);
      return movies;
    } catch (error) {
      console.error('[Cache] getMoviesByProvider failed:', error);
      return [];
    }
  }

  /**
   * Get popular movies (fallback)
   */
  async getPopularMovies(limit: number = 20): Promise<CachedMovie[]> {
    try {
      const { data, error } = await supabase
        .from('cached_movies')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Cache] Error fetching popular:', error);
        throw error;
      }

      console.log(`[Cache] Found ${data?.length || 0} popular movies`);
      return data || [];
    } catch (error) {
      console.error('[Cache] getPopularMovies failed:', error);
      return [];
    }
  }

  /**
   * Check if cache is fresh (less than 24 hours old)
   */
  async isCacheFresh(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cached_movies')
        .select('cached_at')
        .order('cached_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return false;

      const cacheAge = Date.now() - new Date(data.cached_at).getTime();
      const isStale = cacheAge > 24 * 60 * 60 * 1000; // 24 hours

      return !isStale;
    } catch {
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalMovies: number;
    totalShows: number;
    totalProviders: number;
    lastUpdate: string | null;
  }> {
    try {
      const [moviesCount, showsCount, providersCount, lastUpdate] = await Promise.all([
        supabase.from('cached_movies').select('id', { count: 'exact', head: true }).eq('media_type', 'movie'),
        supabase.from('cached_movies').select('id', { count: 'exact', head: true }).eq('media_type', 'tv'),
        supabase.from('cached_providers').select('id', { count: 'exact', head: true }),
        supabase.from('cached_movies').select('updated_at').order('updated_at', { ascending: false }).limit(1).single(),
      ]);

      return {
        totalMovies: moviesCount.count || 0,
        totalShows: showsCount.count || 0,
        totalProviders: providersCount.count || 0,
        lastUpdate: lastUpdate.data?.updated_at || null,
      };
    } catch (error) {
      console.error('[Cache] getCacheStats failed:', error);
      return {
        totalMovies: 0,
        totalShows: 0,
        totalProviders: 0,
        lastUpdate: null,
      };
    }
  }

  /**
   * Trigger cache update manually (calls Edge Functions)
   */
  async triggerCacheUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      // Trigger movies update
      const moviesResult = await supabase.functions.invoke('update-movie-cache');
      
      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Trigger providers update
      const providersResult = await supabase.functions.invoke('update-providers-cache');

      if (moviesResult.error || providersResult.error) {
        throw new Error('Cache update failed');
      }

      return { success: true, message: 'Cache updated successfully' };
    } catch (error: any) {
      console.error('[Cache] Trigger update failed:', error);
      return { success: false, message: error.message };
    }
  }
}

export const cacheService = new CacheService();