// ⚡ FUNCTION B: Providers Cache (Excludes Aha)
// Runs in ~60 seconds

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')!;
const SUPABASE_URL = 'https://vxupccpcmsiwlzgijyut.supabase.co';
const SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;

const AHA_PROVIDER_ID = 2100; // Exclude Aha

const supabaseBatchInsert = async (table: string, rows: any[]) => {
  if (rows.length === 0) return;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=tmdb_id,media_type,region,provider_id`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(await response.text());
};

const chunk = (arr: any[], size: number) =>
  arr.reduce((acc: any[][], _: any, i: number) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);

Deno.serve(async () => {
  try {
    console.log('🚀 Function B: Fetching providers for top 200...');

    // Get top 200 items from cached_movies
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/cached_movies?select=tmdb_id,media_type&order=popularity.desc&limit=200`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      }
    );

    const topItems = await response.json();
    console.log(`✅ Got ${topItems.length} top items`);

    const providerRows: any[] = [];

    for (const item of topItems) {
      try {
        const endpoint = item.media_type === 'movie' ? 'movie' : 'tv';
        const provRes = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${item.tmdb_id}/watch/providers?api_key=${TMDB_API_KEY}`
        );
        const provData = await provRes.json();

        for (const region of ['IN', 'US']) {
          const regionData = provData.results?.[region];
          if (regionData?.flatrate) {
            for (const provider of regionData.flatrate) {
              // Exclude Aha
              if (provider.provider_id === AHA_PROVIDER_ID) {
                console.log(`🚫 Skipping Aha for ${item.tmdb_id}`);
                continue;
              }

              providerRows.push({
                tmdb_id: item.tmdb_id,
                media_type: item.media_type,
                region,
                provider_id: provider.provider_id,
                provider_name: provider.provider_name,
                logo_path: provider.logo_path,
                display_priority: provider.display_priority || 0,
              });
            }
          }
        }
      } catch {}
    }

    console.log(`📺 Found ${providerRows.length} provider entries (Aha excluded)`);

    const batches = chunk(providerRows, 500);
    for (let i = 0; i < batches.length; i++) {
      await supabaseBatchInsert('cached_providers', batches[i]);
      console.log(`✓ Batch ${i + 1}/${batches.length}`);
    }

    console.log('🎉 Function B Complete!');

    return new Response(
      JSON.stringify({ success: true, providers: providerRows.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});