// Provider Batch Template for Batches 1-8 (IN + US Regions)
// Change BATCH_NUMBER and OFFSET for each batch

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY') || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// =====================================================
// CONFIGURATION - CHANGE THESE FOR EACH BATCH
// =====================================================
const BATCH_NUMBER = 7;    // ← CHANGE: 1, 2, 3, 4, 5, 6, 7, 8
const OFFSET = 1500;          // ← CHANGE: 0, 250, 500, 750, 1000, 1250, 1500, 1750
const LIMIT = 250;
const REGIONS = ['IN', 'US']; // Both regions for batches 1-8

// =====================================================
// TMDB API HELPER
// =====================================================
async function fetchTMDB(endpoint: string): Promise<any> {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return await response.json();
}

// =====================================================
// MAIN HANDLER
// =====================================================
Deno.serve(async (req: Request) => {
  const batchNum = BATCH_NUMBER;
  
  try {
    console.log(`[Batch ${batchNum}] Starting... Offset: ${OFFSET}, Limit: ${LIMIT}`);

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey || !TMDB_API_KEY) {
      throw new Error('Missing environment variables');
    }

    // Fetch movies from cache
    const moviesUrl = `${supabaseUrl}/rest/v1/cached_movies?order=popularity.desc&limit=${LIMIT}&offset=${OFFSET}`;
    const moviesResponse = await fetch(moviesUrl, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });

    if (!moviesResponse.ok) {
      throw new Error(`Failed to fetch movies: ${moviesResponse.status}`);
    }

    const movies = await moviesResponse.json();

    if (!movies || movies.length === 0) {
      console.log(`[Batch ${batchNum}] No movies found at offset ${OFFSET}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No movies to process', batch: batchNum }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Batch ${batchNum}] Processing ${movies.length} movies for ${REGIONS.length} regions...`);

    const providerEntries: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each movie
    for (const movie of movies) {
      try {
        const endpoint = movie.media_type === 'movie' 
          ? `/movie/${movie.tmdb_id}/watch/providers`
          : `/tv/${movie.tmdb_id}/watch/providers`;

        const providersData = await fetchTMDB(endpoint);

        // Process both IN and US regions
        for (const region of REGIONS) {
          const regionData = providersData.results?.[region];
          if (!regionData) continue;

          const allProviders = [
            ...(regionData.flatrate || []),
            ...(regionData.rent || []),
            ...(regionData.buy || []),
          ];

          const uniqueProviders = Array.from(
            new Map(allProviders.map((p: any) => [p.provider_id, p])).values()
          );

          const filteredProviders = uniqueProviders.filter((p: any) => p.provider_id !== 2100);

          filteredProviders.forEach((provider: any, index: number) => {
            providerEntries.push({
              tmdb_id: movie.tmdb_id,
              media_type: movie.media_type,
              region: region,
              provider_id: provider.provider_id,
              provider_name: provider.provider_name,
              logo_path: provider.logo_path,
              display_priority: index,
              cached_at: new Date().toISOString(),
            });
          });
        }

        successCount++;
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        errorCount++;
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`[Batch ${batchNum}] Error for movie ${movie.tmdb_id}:`, errMsg);
      }
    }

    console.log(`[Batch ${batchNum}] Processed: ${successCount} success, ${errorCount} errors`);
    console.log(`[Batch ${batchNum}] Total provider entries: ${providerEntries.length}`);

    // Insert to database with proper upsert
    if (providerEntries.length > 0) {
      const upsertBatchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < providerEntries.length; i += upsertBatchSize) {
        const batch = providerEntries.slice(i, i + upsertBatchSize);
        
        try {
          const url = `${supabaseUrl}/rest/v1/cached_providers`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify(batch),
          });

          if (response.ok || response.status === 409) {
            insertedCount += batch.length;
            console.log(`[Batch ${batchNum}] Upserted ${batch.length} entries (total: ${insertedCount}/${providerEntries.length})`);
          } else {
            const errorText = await response.text();
            console.error(`[Batch ${batchNum}] DB error:`, response.status, errorText);
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Batch ${batchNum}] DB insert error:`, errMsg);
        }
      }
    }

    console.log(`[Batch ${batchNum}] ✅ Complete!`);

    return new Response(
      JSON.stringify({
        success: true,
        batch: batchNum,
        processed: movies.length,
        providers_cached: providerEntries.length,
        success_count: successCount,
        error_count: errorCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Batch ${batchNum}] Fatal error:`, errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        batch: batchNum,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});