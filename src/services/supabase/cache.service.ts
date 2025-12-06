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

interface EditorsPick {
  id: number;
  week_of: string;
  tmdb_ids: number[];
  media_types: string[];
  title: string;
  description: string | null;
  curator_name: string;
  is_active: boolean;
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
   * Get movies by MULTIPLE genres (for "Because You Like")
   * Combines user's preferred genres
   * NO quality filters - shows popular movies matching ANY genre
   */
  async getMoviesByMultipleGenres(genreIds: number[], limit: number = 12): Promise<CachedMovie[]> {
    try {
      if (!genreIds || genreIds.length === 0) {
        console.log('[Cache] No genres provided for multi-genre search');
        return [];
      }

      const { data, error } = await supabase
        .from('cached_movies')
        .select('*')
        .overlaps('genre_ids', genreIds) // Movies that match ANY of these genres
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Cache] Error fetching by multiple genres:', error);
        throw error;
      }

      console.log(`[Cache] Found ${data?.length || 0} movies for genres ${genreIds.join(', ')}`);
      return data || [];
    } catch (error) {
      console.error('[Cache] getMoviesByMultipleGenres failed:', error);
      return [];
    }
  }

  /**
   * Get movies by language (from cache)
   * With quality filters for "Best of" sections
   * Without quality filters for language filter in filter system
   */
  async getMoviesByLanguage(
    languageCode: string, 
    limit: number = 20,
    applyQualityFilter: boolean = true
  ): Promise<CachedMovie[]> {
    try {
      let query = supabase
        .from('cached_movies')
        .select('*')
        .eq('original_language', languageCode);

      // Apply quality filters only for "Best of" sections
      if (applyQualityFilter) {
        query = query
          .gte('vote_average', 5.5)
          .gte('vote_count', 20)
          .order('vote_average', { ascending: false });
      } else {
        // For filter system - no quality filter, just sort by recent
        query = query.order('release_date', { ascending: false });
      }

      const { data, error } = await query.limit(limit);

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
   * Get movies by provider (FIXED VERSION)
   * Correct approach using two-step lookup:
   * 1️⃣ Get tmdb_ids from cached_providers
   * 2️⃣ Fetch movies matching those tmdb_ids
   */
  async getMoviesByProvider(
    providerId: number,
    region: string = 'IN',
    limit: number = 20
  ): Promise<CachedMovie[]> {
    try {
      // Step 1: Get tmdb_ids for this provider
      const { data: providerData, error: provError } = await supabase
        .from('cached_providers')
        .select('tmdb_id, media_type')
        .eq('provider_id', providerId)
        .eq('region', region);

      if (provError || !providerData || providerData.length === 0) {
        console.log(`[Cache] No movies for provider ${providerId} in ${region}`);
        return [];
      }

      // Step 2: Get unique tmdb_ids
      const uniqueIds = [...new Set(providerData.map(p => p.tmdb_id))];

      if (uniqueIds.length === 0) {
        console.log(`[Cache] No valid TMDB IDs for provider ${providerId}`);
        return [];
      }

      // Step 3: Fetch movies for those IDs
      const { data: movies, error } = await supabase
        .from('cached_movies')
        .select('*')
        .in('tmdb_id', uniqueIds)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) throw error;

      console.log(`[Cache] Found ${movies?.length || 0} movies for provider ${providerId}`);
      return movies || [];
    } catch (error) {
      console.error('[Cache] getMoviesByProvider failed:', error);
      return [];
    }
  }

  /**
   * 🆕 NEW: Get recently added movies across ALL streaming platforms
   * For "Newly Released on Streaming" section
   */
  async getNewlyReleasedOnStreaming(limit: number = 20): Promise<CachedMovie[]> {
    try {
      // Get movies released in last 3 months that are on streaming
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const cutoffDate = threeMonthsAgo.toISOString().split('T')[0];

      // Get all movies on any streaming platform (IN region)
      const { data: providerData, error: provError } = await supabase
        .from('cached_providers')
        .select('tmdb_id, media_type')
        .eq('region', 'IN')
        .in('provider_id', [8, 119, 2336, 2049, 1796]); // Our 5 platforms

      if (provError || !providerData || providerData.length === 0) {
        console.log('[Cache] No streaming data found');
        return [];
      }

      const uniqueIds = [...new Set(providerData.map(p => p.tmdb_id))];

      // Fetch movies released recently
      const { data: movies, error } = await supabase
        .from('cached_movies')
        .select('*')
        .in('tmdb_id', uniqueIds)
        .gte('release_date', cutoffDate)
        .order('release_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      console.log(`[Cache] Found ${movies?.length || 0} newly released streaming movies`);
      return movies || [];
    } catch (error) {
      console.error('[Cache] getNewlyReleasedOnStreaming failed:', error);
      return [];
    }
  }

  /**
   * 🆕 NEW: Get top rated movies (high quality only)
   * For "Top Rated Movies You Shouldn't Miss" section
   */
  async getTopRatedMovies(limit: number = 15): Promise<CachedMovie[]> {
    try {
      const { data, error } = await supabase
        .from('cached_movies')
        .select('*')
        .gte('vote_average', 7.5)
        .gte('vote_count', 300)
        .gte('release_date', '2015-01-01') // Movies from 2015 onwards
        .order('vote_average', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Cache] Error fetching top rated:', error);
        throw error;
      }

      console.log(`[Cache] Found ${data?.length || 0} top rated movies`);
      return data || [];
    } catch (error) {
      console.error('[Cache] getTopRatedMovies failed:', error);
      return [];
    }
  }

  /**
   * 🆕 NEW: Get popular movies on streaming this week (cross-platform)
   * For "Popular on Streaming This Week" section
   */
  async getPopularOnStreaming(limit: number = 15): Promise<CachedMovie[]> {
    try {
      // Get all movies on any streaming platform
      const { data: providerData, error: provError } = await supabase
        .from('cached_providers')
        .select('tmdb_id, media_type')
        .eq('region', 'IN')
        .in('provider_id', [8, 119, 2336, 2049, 1796]);

      if (provError || !providerData) {
        console.log('[Cache] No streaming data found');
        return [];
      }

      const uniqueIds = [...new Set(providerData.map(p => p.tmdb_id))];

      // Get popular movies from that list
      const { data: movies, error } = await supabase
        .from('cached_movies')
        .select('*')
        .in('tmdb_id', uniqueIds)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) throw error;

      console.log(`[Cache] Found ${movies?.length || 0} popular streaming movies`);
      return movies || [];
    } catch (error) {
      console.error('[Cache] getPopularOnStreaming failed:', error);
      return [];
    }
  }

  /**
   * 🆕 NEW: Get watchlist activity from user's friends
   * For "Popular in Your Network" section
   */
  async getFriendsWatchlist(userId: string, limit: number = 10): Promise<CachedMovie[]> {
    try {
      // Step 1: Get user IDs of people the current user follows
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (followsError || !followsData || followsData.length === 0) {
        console.log('[Cache] User has no follows');
        return [];
      }

      const followingIds = followsData.map(f => f.following_id);

      // Step 2: Get movies added by those people (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: watchlistData, error: wlError } = await supabase
        .from('watchlist')
        .select('tmdb_id, media_type, user_id, created_at')
        .in('user_id', followingIds)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false });

      if (wlError || !watchlistData || watchlistData.length === 0) {
        console.log('[Cache] No friend activity found');
        return [];
      }

      // Step 3: Count frequency (most added by friends)
      const tmdbCounts: Record<string, number> = {};
      watchlistData.forEach(item => {
        const key = String(item.tmdb_id);
        tmdbCounts[key] = (tmdbCounts[key] || 0) + 1;
      });

      // Step 4: Get top items
      const sortedEntries = Object.entries(tmdbCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
      
      const topIds: number[] = sortedEntries.map(entry => parseInt(entry[0], 10));

      if (topIds.length === 0) return [];

      // Step 5: Fetch movie details
      const { data: movies, error } = await supabase
        .from('cached_movies')
        .select('*')
        .in('tmdb_id', topIds);

      if (error) throw error;

      console.log(`[Cache] Found ${movies?.length || 0} movies from friends`);
      return movies || [];
    } catch (error) {
      console.error('[Cache] getFriendsWatchlist failed:', error);
      return [];
    }
  }

  /**
   * 🆕 NEW: Get Editor's Picks for current week
   */
  async getEditorsPicks(): Promise<{ picks: EditorsPick; movies: CachedMovie[] } | null> {
    try {
      // Get current week's picks
      const { data: picksData, error: picksError } = await supabase
        .from('editors_picks')
        .select('*')
        .eq('is_active', true)
        .order('week_of', { ascending: false })
        .limit(1)
        .single();

      if (picksError || !picksData) {
        console.log('[Cache] No active editor picks found');
        return null;
      }

      // Fetch the actual movies
      const { data: movies, error: moviesError } = await supabase
        .from('cached_movies')
        .select('*')
        .in('tmdb_id', picksData.tmdb_ids);

      if (moviesError || !movies) {
        console.log('[Cache] Could not fetch editor picks movies');
        return null;
      }

      // Sort movies to match the order in tmdb_ids array
      const sortedMovies = picksData.tmdb_ids
        .map((id: number) => movies.find(m => m.tmdb_id === id))
        .filter(Boolean) as CachedMovie[];

      console.log(`[Cache] Found ${sortedMovies.length} editor picks`);
      return {
        picks: picksData,
        movies: sortedMovies
      };
    } catch (error) {
      console.error('[Cache] getEditorsPicks failed:', error);
      return null;
    }
  }

  /**
   * 🆕 NEW: Get user's preferred genres
   */
  async getUserGenres(userId: string): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferred_genres')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.log('[Cache] No user preferences found');
        return [];
      }

      return data.preferred_genres || [];
    } catch (error) {
      console.error('[Cache] getUserGenres failed:', error);
      return [];
    }
  }

  /**
   * 🆕 NEW: Save user's genre preferences
   */
  async saveUserGenres(userId: string, genreIds: number[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferred_genres: genreIds,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('[Cache] Error saving genres:', error);
        return false;
      }

      console.log('[Cache] User genres saved successfully');
      return true;
    } catch (error) {
      console.error('[Cache] saveUserGenres failed:', error);
      return false;
    }
  }

  /**
   * Get ALL cached movies (for filtering engine)
   * Fetches in batches to bypass 1000 row limit
   */
  async getAllMovies(): Promise<CachedMovie[]> {
    try {
      console.log('[Cache] Fetching all movies in batches...');
      
      // Get total count first
      const { count } = await supabase
        .from('cached_movies')
        .select('*', { count: 'exact', head: true });

      console.log(`[Cache] Total movies in database: ${count}`);

      if (!count || count === 0) return [];

      // Fetch in batches of 1000
      const batchSize = 1000;
      const totalBatches = Math.ceil(count / batchSize);
      const allMovies: CachedMovie[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = start + batchSize - 1;
        
        console.log(`[Cache] Fetching batch ${i + 1}/${totalBatches} (rows ${start}-${end})...`);
        
        const { data, error } = await supabase
          .from('cached_movies')
          .select('*')
          .range(start, end)
          .order('popularity', { ascending: false });

        if (error) {
          console.error(`[Cache] Error fetching batch ${i + 1}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          allMovies.push(...data);
          console.log(`[Cache] Batch ${i + 1} loaded: ${data.length} movies (total: ${allMovies.length}/${count})`);
        }
      }

      console.log(`[Cache] ✅ Loaded ALL ${allMovies.length} movies for filtering!`);
      
      // Verify we got everything
      if (allMovies.length < count!) {
        console.warn(`[Cache] WARNING: Expected ${count} but got ${allMovies.length}`);
      }

      return allMovies;
    } catch (error) {
      console.error('[Cache] getAllMovies failed:', error);
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
      const isStale = cacheAge > 24 * 60 * 60 * 1000;

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