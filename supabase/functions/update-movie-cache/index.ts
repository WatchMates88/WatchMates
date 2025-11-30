// ⚡ FUNCTION A: Movies & Shows Cache (NO PROVIDERS)
// Runs in ~30 seconds

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')!;
const SUPABASE_URL = 'https://vxupccpcmsiwlzgijyut.supabase.co';
const SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;

const supabaseBatchInsert = async (table: string, rows: any[]) => {
  if (rows.length === 0) return;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=tmdb_id`, {
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

const fetchJSON = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

const cleanDate = (d: any) => (!d || d === '') ? null : d;

const fetchPagesParallel = async (urlBuilder: (page: number) => string, pages: number) => {
  const requests = [];
  for (let i = 1; i <= pages; i++) requests.push(fetchJSON(urlBuilder(i)));
  const results = await Promise.all(requests);
  return results.flatMap((page) => page.results || []);
};

Deno.serve(async () => {
  try {
    console.log('🚀 Function A: Caching movies & shows...');

    const [popularMovies, topRatedMovies, trendingMovies, recentMovies, hindiMovies, teluguMovies, tamilMovies, popularShows, trendingShows] = await Promise.all([
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${p}`, 15),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=${p}`, 15),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&page=${p}`, 10),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&primary_release_date.gte=2023-01-01&sort_by=popularity.desc&page=${p}`, 20),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${p}`, 10),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=te&sort_by=popularity.desc&page=${p}`, 10),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ta&sort_by=popularity.desc&page=${p}`, 10),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&page=${p}`, 15),
      fetchPagesParallel((p) => `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}&page=${p}`, 10),
    ]);

    const movieMap = new Map();
    const showMap = new Map();

    [...popularMovies, ...topRatedMovies, ...trendingMovies, ...recentMovies, ...hindiMovies, ...teluguMovies, ...tamilMovies].forEach((m) => {
      if (m?.id) movieMap.set(m.id, m);
    });

    [...popularShows, ...trendingShows].forEach((s) => {
      if (s?.id) showMap.set(s.id, s);
    });

    const movies = Array.from(movieMap.values());
    const shows = Array.from(showMap.values());

    console.log(`✅ ${movies.length} movies, ${shows.length} shows`);

    const movieRows = movies.map((m: any) => ({
      tmdb_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      overview: m.overview,
      release_date: cleanDate(m.release_date),
      vote_average: m.vote_average,
      vote_count: m.vote_count,
      popularity: m.popularity,
      genre_ids: m.genre_ids,
      original_language: m.original_language,
      media_type: 'movie',
      updated_at: new Date().toISOString(),
    }));

    const showRows = shows.map((s: any) => ({
      tmdb_id: s.id,
      title: s.name,
      poster_path: s.poster_path,
      backdrop_path: s.backdrop_path,
      overview: s.overview,
      release_date: cleanDate(s.first_air_date),
      vote_average: s.vote_average,
      vote_count: s.vote_count,
      popularity: s.popularity,
      genre_ids: s.genre_ids,
      original_language: s.original_language,
      media_type: 'tv',
      updated_at: new Date().toISOString(),
    }));

    const allRows = [...movieRows, ...showRows];
    const batches = chunk(allRows, 500);

    for (let i = 0; i < batches.length; i++) {
      await supabaseBatchInsert('cached_movies', batches[i]);
      console.log(`✓ Batch ${i + 1}/${batches.length}`);
    }

    console.log('🎉 Function A Complete!');

    return new Response(JSON.stringify({ success: true, total: allRows.length, movies: movieRows.length, shows: showRows.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});