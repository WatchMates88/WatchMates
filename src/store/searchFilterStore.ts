import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// TYPES
// =====================================================

export type SortOption = 'popularity' | 'rating' | 'release_date' | 'votes';
export type ContentType = 'all' | 'movie' | 'tv';
export type PlatformMode = 'any' | 'all';

export interface SearchFilters {
  // Content filters
  contentType: ContentType;
  genres: number[];
  yearRange: [number, number];
  minRating: number;
  languages: string[];
  minVoteCount: number;
  
  // Platform filters
  platforms: number[];
  platformMode: PlatformMode;
  
  // Sort
  sortBy: SortOption;
  sortAscending: boolean;
  
  // UI state
  isFilterSheetOpen: boolean;
}

interface SearchFilterStore extends SearchFilters {
  // Actions
  setContentType: (type: ContentType) => void;
  setGenres: (genres: number[]) => void;
  toggleGenre: (genreId: number) => void;
  setYearRange: (range: [number, number]) => void;
  setMinRating: (rating: number) => void;
  setLanguages: (languages: string[]) => void;
  toggleLanguage: (language: string) => void;
  setMinVoteCount: (count: number) => void;
  setPlatforms: (platforms: number[]) => void;
  togglePlatform: (platformId: number) => void;
  setPlatformMode: (mode: PlatformMode) => void;
  setSortBy: (sort: SortOption) => void;
  setSortAscending: (ascending: boolean) => void;
  setFilterSheetOpen: (open: boolean) => void;
  
  // Utility actions
  resetFilters: () => void;
  getActiveFilterCount: () => number;
  hasActiveFilters: () => boolean;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_FILTERS: SearchFilters = {
  contentType: 'all',
  genres: [],
  yearRange: [1990, 2025],
  minRating: 0,
  languages: [],
  minVoteCount: 0,
  platforms: [],
  platformMode: 'any',
  sortBy: 'popularity',
  sortAscending: false,
  isFilterSheetOpen: false,
};

// =====================================================
// STORE
// =====================================================

export const useSearchFilterStore = create<SearchFilterStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_FILTERS,

      // Content Type
      setContentType: (type) => set({ contentType: type }),

      // Genres
      setGenres: (genres) => set({ genres }),
      toggleGenre: (genreId) =>
        set((state) => ({
          genres: state.genres.includes(genreId)
            ? state.genres.filter((id) => id !== genreId)
            : [...state.genres, genreId],
        })),

      // Year Range
      setYearRange: (range) => set({ yearRange: range }),

      // Rating
      setMinRating: (rating) => set({ minRating: rating }),

      // Languages
      setLanguages: (languages) => set({ languages }),
      toggleLanguage: (language) =>
        set((state) => ({
          languages: state.languages.includes(language)
            ? state.languages.filter((lang) => lang !== language)
            : [...state.languages, language],
        })),

      // Vote Count
      setMinVoteCount: (count) => set({ minVoteCount: count }),

      // Platforms
      setPlatforms: (platforms) => set({ platforms }),
      togglePlatform: (platformId) =>
        set((state) => ({
          platforms: state.platforms.includes(platformId)
            ? state.platforms.filter((id) => id !== platformId)
            : [...state.platforms, platformId],
        })),
      setPlatformMode: (mode) => set({ platformMode: mode }),

      // Sort
      setSortBy: (sort) => set({ sortBy: sort }),
      setSortAscending: (ascending) => set({ sortAscending: ascending }),

      // UI
      setFilterSheetOpen: (open) => set({ isFilterSheetOpen: open }),

      // Reset
      resetFilters: () =>
        set({
          ...DEFAULT_FILTERS,
          isFilterSheetOpen: get().isFilterSheetOpen, // Keep sheet state
        }),

      // Active filter count (for badge)
      getActiveFilterCount: () => {
        const state = get();
        let count = 0;

        if (state.contentType !== 'all') count++;
        if (state.genres.length > 0) count++;
        if (state.yearRange[0] !== 1990 || state.yearRange[1] !== 2025) count++;
        if (state.minRating > 0) count++;
        if (state.languages.length > 0) count++;
        if (state.minVoteCount > 0) count++;
        if (state.platforms.length > 0) count++;

        return count;
      },

      // Check if any filters are active
      hasActiveFilters: () => get().getActiveFilterCount() > 0,
    }),
    {
      name: 'watchmates-search-filters',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist filter values, not UI state
      partialize: (state) => ({
        contentType: state.contentType,
        genres: state.genres,
        yearRange: state.yearRange,
        minRating: state.minRating,
        languages: state.languages,
        minVoteCount: state.minVoteCount,
        platforms: state.platforms,
        platformMode: state.platformMode,
        sortBy: state.sortBy,
        sortAscending: state.sortAscending,
      }),
    }
  )
);

// =====================================================
// CONSTANTS FOR UI
// =====================================================

export const GENRE_OPTIONS = [
  { id: 28, name: 'Action', emoji: '💥' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 53, name: 'Thriller', emoji: '😱' },
  { id: 80, name: 'Crime', emoji: '🔪' },
  { id: 10749, name: 'Romance', emoji: '💕' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 16, name: 'Animation', emoji: '🎨' },
  { id: 10751, name: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 14, name: 'Fantasy', emoji: '🧙‍♂️' },
  { id: 36, name: 'History', emoji: '📜' },
  { id: 10402, name: 'Music', emoji: '🎵' },
  { id: 9648, name: 'Mystery', emoji: '🔍' },
  { id: 12, name: 'Adventure', emoji: '🗺️' },
  { id: 10752, name: 'War', emoji: '⚔️' },
];

export const PLATFORM_OPTIONS = [
  { id: 8, name: 'Netflix', logo: 'https://images.justwatch.com/icon/207360008/s100/netflix.png', color: '#E50914' },
  { id: 119, name: 'Prime Video', logo: 'https://images.justwatch.com/icon/52449861/s100/amazon-prime-video.png', color: '#00A8E1' },
  { id: 2336, name: 'JioHotstar', logo: 'https://images.justwatch.com/icon/147638351/s100/disney-plus-hotstar.png', color: '#0F298A' },
  { id: 350, name: 'Apple TV+', logo: 'https://images.justwatch.com/icon/190848813/s100/apple-tv-plus.png', color: '#000000' },
];

export const LANGUAGE_OPTIONS = [
  // Global
  { code: 'en', name: 'English', flag: '🇬🇧' },
  
  // Big 5 Indian Languages (Major Film Industries)
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  
  // International
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
];

export const RATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 6.5, label: '6.5+' },
  { value: 7.0, label: '7.0+' },
  { value: 7.5, label: '7.5+' },
  { value: 8.0, label: '8.0+' },
  { value: 8.5, label: '8.5+' },
  { value: 9.0, label: '9.0+' },
];

export const VOTE_COUNT_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 100, label: '100+' },
  { value: 500, label: '500+' },
  { value: 1000, label: '1,000+' },
  { value: 5000, label: '5,000+' },
];

export const DECADE_OPTIONS = [
  { start: 2020, end: 2029, label: '2020s', emoji: '🔥' },
  { start: 2010, end: 2019, label: '2010s', emoji: '📱' },
  { start: 2000, end: 2009, label: '2000s', emoji: '💿' },
  { start: 1990, end: 1999, label: '90s', emoji: '📼' },
  { start: 1980, end: 1989, label: '80s', emoji: '🎸' },
];

export const SORT_OPTIONS = [
  { value: 'popularity' as SortOption, label: 'Popularity', icon: '🔥' },
  { value: 'rating' as SortOption, label: 'IMDb Rating', icon: '⭐' },
  { value: 'release_date' as SortOption, label: 'Release Date', icon: '📅' },
  { value: 'votes' as SortOption, label: 'Most Voted', icon: '👥' },
];