// Provider Batch Template - Change BATCH_NUMBER and OFFSET for each batch
// Deno Deploy compatible code

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY') || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// =====================================================
// CONFIGURATION - CHANGE THESE VALUES FOR EACH BATCH
// =====================================================
const BATCH_NUMBER = 15;           // ← CHANGE THIS (9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20)
const OFFSET = 3140;              // ← CHANGE THIS (2000, 2190, 2380, 2570, 2760, 2950, 3140, 3330, 3520, 3710, 3900, 4090)
const LIMIT = 190;
const REGION = 'IN';

// =====================================================
// SUPABASE REST API HELPER
// =====================================================
async function supabaseFetch(method: string, endpoint: string, body?: unknown): Promise<any> {
  const url = `${supabaseUrl}/rest/v1${endpoint}`;
  const headers: Record<string, string> = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=minimal',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    console.error('Supabase fetch error:', { status: response.status, error });
    throw new Error(`Supabase error: ${response.status} - ${error}`);
  }
  
  // Return empty object if no content (204 response)
  if (response.status === 204) {
    return {};
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

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
  // Wrap everything in try-catch for safety
  let batch = BATCH_NUMBER;
  
  try {
    console.log(`[Batch ${batch}] Starting... Offset: ${OFFSET}, Limit: ${LIMIT}`);

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    if (!TMDB_API_KEY) {
      throw new Error('Missing TMDB API key');
    }

    const movies = await supabaseFetch(
      'GET',
      `/cached_movies?order=popularity.desc&limit=${LIMIT}&offset=${OFFSET}`
    );

    if (!movies || movies.length === 0) {
      console.log(`[Batch ${batch}] No movies found at offset ${OFFSET}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No movies to process', batch }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Batch ${batch}] Processing ${movies.length} movies...`);

    const providerEntries: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const movie of movies) {
      try {
        const endpoint = movie.media_type === 'movie' 
          ? `/movie/${movie.tmdb_id}/watch/providers`
          : `/tv/${movie.tmdb_id}/watch/providers`;

        const providersData = await fetchTMDB(endpoint);

        const regionData = providersData.results?.[REGION];
        if (!regionData) {
          continue;
        }

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
            region: REGION,
            provider_id: provider.provider_id,
            provider_name: provider.provider_name,
            logo_path: provider.logo_path,
            display_priority: index,
            cached_at: new Date().toISOString(),
          });
        });

        successCount++;
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        errorCount++;
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`[Batch ${batch}] Error for movie ${movie.tmdb_id}:`, errMsg);
      }
    }

    console.log(`[Batch ${batch}] Processed: ${successCount} success, ${errorCount} errors`);
    console.log(`[Batch ${batch}] Total provider entries: ${providerEntries.length}`);

    if (providerEntries.length > 0) {
      const upsertBatchSize = 100;
      for (let i = 0; i < providerEntries.length; i += upsertBatchSize) {
        const batch = providerEntries.slice(i, i + upsertBatchSize);
        
        try {
          // Use UPSERT with proper conflict resolution
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

          if (!response.ok && response.status !== 409) {
            // Ignore 409 (duplicate) errors, log others
            const errorText = await response.text();
            console.error(`[Batch ${batch}] DB insert warning:`, response.status, errorText);
          } else {
            console.log(`[Batch ${batch}] Inserted/updated ${batch.length} provider entries`);
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Batch ${batch}] DB insert error:`, errMsg);
        }
      }
    }

    console.log(`[Batch ${batch}] ✅ Complete!`);

    return new Response(
      JSON.stringify({
        success: true,
        batch: batch,
        processed: movies.length,
        providers_cached: providerEntries.length,
        success_count: successCount,
        error_count: errorCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Batch ${batch}] Fatal error:`, errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        batch: batch,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});