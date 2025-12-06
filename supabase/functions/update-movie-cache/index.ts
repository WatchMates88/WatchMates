// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')!;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// =====================================================
// BIG 5 INDIAN FILM INDUSTRIES (UPDATED FILTERS)
// =====================================================
const REGIONAL_LANGUAGES = [
  { 
    code: 'hi', 
    name: 'Hindi (Bollywood)', 
    pages: 30,
    min_rating: 5.0      // vote filter removed — easier rating
  },
  { 
    code: 'te', 
    name: 'Telugu (Tollywood)', 
    pages: 20,
    min_rating: 4.5
  },
  { 
    code: 'ta', 
    name: 'Tamil (Kollywood)', 
    pages: 20,
    min_rating: 4.5
  },
  { 
    code: 'ml', 
    name: 'Malayalam (Mollywood)', 
    pages: 15,
    min_rating: 4.5
  },
  { 
    code: 'kn', 
    name: 'Kannada (Sandalwood)', 
    pages: 10,
    min_rating: 4.5
  },
];

// =====================================================
// HELPER: Supabase Fetch
// =====================================================
async function supabaseFetch(method: string, endpoint: string, body?: any) {
  const url = `${supabaseUrl}/rest/v1${endpoint}`;
  const headers: Record<string, string> = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  };

  const options: RequestInit = { method, headers };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

// =====================================================
// HELPER: Fetch from TMDB
// =====================================================
async function fetchTMDB(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return await response.json();
}

// =====================================================
// FETCH MULTIPLE PAGES
// =====================================================
async function fetchMultiplePages(
  endpoint: string,
  params: Record<string, any>,
  totalPages: number
): Promise<any[]> {
  const results: any[] = [];
  
  for (let page = 1; page <= totalPages; page++) {
    try {
      const data = await fetchTMDB(endpoint, { ...params, page });
      if (data.results && data.results.length > 0) {
        results.push(...data.results);
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
    }
  }
  
  return results;
}

// =====================================================
// MAIN CACHING FUNCTION
// =====================================================
serve(async () => {
  try {
    console.log('[Cache] Starting update...');
    const allMovies: any[] = [];

    // 1. POPULAR MOVIES (INDIA)
    const popularIndia = await fetchMultiplePages('/discover/movie', {
      region: 'IN',
      sort_by: 'popularity.desc',
      include_adult: false,
    }, 20);
    allMovies.push(...popularIndia.map(m => ({ ...m, media_type: 'movie' })));

    // 2. TOP RATED MOVIES (INDIA)
    const topRatedIndia = await fetchMultiplePages('/discover/movie', {
      region: 'IN',
      sort_by: 'vote_average.desc',
      include_adult: false,
      'vote_count.gte': 50
    }, 20);
    allMovies.push(...topRatedIndia.map(m => ({ ...m, media_type: 'movie' })));

    // 3. TRENDING MOVIES
    const trending = await fetchMultiplePages('/trending/movie/week', {}, 15);
    allMovies.push(...trending.map(m => ({ ...m, media_type: 'movie' })));

    // 4. RECENT MOVIES (2023+)
    const recent = await fetchMultiplePages('/discover/movie', {
      'primary_release_date.gte': '2023-01-01',
      sort_by: 'release_date.desc',
      include_adult: false,
    }, 25);
    allMovies.push(...recent.map(m => ({ ...m, media_type: 'movie' })));

    // 5. REGIONAL MOVIES (UPDATED FILTERS)
    for (const lang of REGIONAL_LANGUAGES) {
      const regionalMovies = await fetchMultiplePages('/discover/movie', {
        original_language: lang.code,
        sort_by: 'popularity.desc',
        include_adult: false,
        'vote_average.gte': lang.min_rating
      }, lang.pages);

      allMovies.push(...regionalMovies.map(m => ({ ...m, media_type: 'movie' })));
    }

    // 6. POPULAR TV
    const tvShows = await fetchMultiplePages('/discover/tv', {
      region: 'IN',
      sort_by: 'popularity.desc',
    }, 20);
    allMovies.push(...tvShows.map(s => ({ ...s, media_type: 'tv' })));

    // 7. TRENDING TV
    const trendingTV = await fetchMultiplePages('/trending/tv/week', {}, 15);
    allMovies.push(...trendingTV.map(s => ({ ...s, media_type: 'tv' })));

    // DEDUPLICATION
    const uniqueMovies = new Map();
    
    allMovies.forEach(item => {
      const key = `${item.id}-${item.media_type}`;
      if (!uniqueMovies.has(key)) {
        const releaseDate = item.release_date || item.first_air_date || null;
        
        uniqueMovies.set(key, {
          tmdb_id: item.id,
          title: item.title || item.name || 'Untitled',
          poster_path: item.poster_path || null,
          backdrop_path: item.backdrop_path || null,
          overview: item.overview || '',
          release_date: releaseDate,
          vote_average: item.vote_average || 0,
          vote_count: item.vote_count || 0,
          popularity: item.popularity || 0,
          genre_ids: item.genre_ids || [],
          original_language: item.original_language || 'en',
          media_type: item.media_type,
          updated_at: new Date().toISOString(),
        });
      }
    });

    const moviesToCache = Array.from(uniqueMovies.values());

    // UPSERT IN BATCHES
    const batchSize = 100;
    for (let i = 0; i < moviesToCache.length; i += batchSize) {
      const batch = moviesToCache.slice(i, i + batchSize);

      await fetch(`${supabaseUrl}/rest/v1/cached_movies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(batch),
      });
    }

    return new Response(JSON.stringify({
      success: true,
      total_unique: moviesToCache.length
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[Cache] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
});
