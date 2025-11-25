import { create } from 'zustand';
import { Movie, TVShow } from '../types';

interface MediaState {
  trendingMovies: Movie[];
  trendingTVShows: TVShow[];
  popularMovies: Movie[];
  popularTVShows: TVShow[];
  isLoading: boolean;
  error: string | null;
  
  setTrendingMovies: (movies: Movie[]) => void;
  setTrendingTVShows: (shows: TVShow[]) => void;
  setPopularMovies: (movies: Movie[]) => void;
  setPopularTVShows: (shows: TVShow[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  trendingMovies: [],
  trendingTVShows: [],
  popularMovies: [],
  popularTVShows: [],
  isLoading: false,
  error: null,
  
  setTrendingMovies: (trendingMovies) => set({ trendingMovies }),
  setTrendingTVShows: (trendingTVShows) => set({ trendingTVShows }),
  setPopularMovies: (popularMovies) => set({ popularMovies }),
  setPopularTVShows: (popularTVShows) => set({ popularTVShows }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
