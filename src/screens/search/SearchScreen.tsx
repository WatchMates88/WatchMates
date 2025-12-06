import React, { useState, useEffect } from 'react';
import { 
  View, StyleSheet, ScrollView, TouchableOpacity, Text, 
  TextInput, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { PosterGrid } from '../../components/media/PosterGrid';
import { ContentRow } from '../../components/media/ContentRow';
import { FilterButton } from '../../components/search/FilterButton';
import { SortBottomSheet } from '../../components/search/SortBottomSheet';
import { FilterBottomSheet } from '../../components/search/FilterBottomSheet';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { cacheService } from '../../services/supabase/cache.service';
import { filterEngineService } from '../../services/filter/filterEngine.service';
import { useAuthStore } from '../../store/authStore';
import { useSearchFilterStore } from '../../store/searchFilterStore';
import { spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

type Props = { navigation: any };

const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 35: 'Comedy', 18: 'Drama', 53: 'Thriller',
  80: 'Crime', 10749: 'Romance', 878: 'Sci-Fi', 27: 'Horror',
};

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const filters = useSearchFilterStore();
  const { sortBy, setFilterSheetOpen, hasActiveFilters } = filters;
  
  // UI state
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  
  // Cached movies for filtering
  const [allCachedMovies, setAllCachedMovies] = useState<any[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Content state
  const [loading, setLoading] = useState(true);
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [becauseYouLike, setBecauseYouLike] = useState<any[]>([]);
  const [userGenres, setUserGenres] = useState<number[]>([]);
  const [friendsActivity, setFriendsActivity] = useState<any[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);
  const [editorsTitle, setEditorsTitle] = useState('');
  const [editorsSubtitle, setEditorsSubtitle] = useState('');
  const [popularStreaming, setPopularStreaming] = useState<any[]>([]);
  const [newlyReleased, setNewlyReleased] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [malayalamCinema, setMalayalamCinema] = useState<any[]>([]);

  useEffect(() => {
    loadAllContent();
  }, [user]);

  // Apply filters when they change
  useEffect(() => {
    if (allCachedMovies.length > 0 && hasActiveFilters()) {
      applyFiltersAndSort();
    }
  }, [
    allCachedMovies.length,
    filters.contentType,
    filters.genres,
    filters.yearRange,
    filters.minRating,
    filters.languages,
    filters.platforms,
    filters.platformMode,
    sortBy,
  ]);

  const applyFiltersAndSort = async () => {
    try {
      if (allCachedMovies.length === 0) return;

      const filtered = await filterEngineService.applyFilters(allCachedMovies, filters);
      
      setSearchResults(filtered);
      setShowResults(true);
      
      console.log(`[Search] Applied filters: ${filtered.length} results from ${allCachedMovies.length} movies`);
    } catch (error) {
      console.error('[Search] Error applying filters:', error);
    }
  };

  const loadAllContent = async () => {
    try {
      setLoading(true);

      // Load ALL movies for filtering
      console.log('[SearchScreen] Loading all cached movies...');
      const allMovies = await cacheService.getAllMovies();
      console.log('[SearchScreen] Loaded', allMovies.length, 'movies for filtering');
      
      const kannadaCount = allMovies.filter(m => m.original_language === 'kn').length;
      console.log('[SearchScreen] Kannada movies in cache:', kannadaCount);
      
      setAllCachedMovies(allMovies);

      const results = await Promise.all([
        cacheService.getPopularMovies(15),
        user ? cacheService.getUserGenres(user.id) : Promise.resolve([]),
        user ? cacheService.getUserGenres(user.id).then(genres => 
          genres.length > 0 ? cacheService.getMoviesByMultipleGenres(genres, 12) : []
        ) : Promise.resolve([]),
        user ? cacheService.getFriendsWatchlist(user.id, 10) : Promise.resolve([]),
        cacheService.getEditorsPicks(),
        cacheService.getPopularOnStreaming(15),
        cacheService.getNewlyReleasedOnStreaming(20),
        cacheService.getTopRatedMovies(15),
        cacheService.getMoviesByLanguage('ml', 12, true),
      ]);

      const [
        trending,
        userGenresData,
        becauseYouLikeData,
        friendsData,
        editorsData,
        popularData,
        newReleasesData,
        topRatedData,
        malayalamData,
      ] = results;

      setTrendingMovies(trending);
      setUserGenres(userGenresData);
      setBecauseYouLike(becauseYouLikeData);
      setFriendsActivity(friendsData);
      
      if (editorsData) {
        setEditorsPicks(editorsData.movies);
        setEditorsTitle(editorsData.picks.title);
        const weekOf = new Date(editorsData.picks.week_of);
        const daysAgo = Math.floor((Date.now() - weekOf.getTime()) / (1000 * 60 * 60 * 24));
        setEditorsSubtitle(
          daysAgo === 0 ? 'Updated today' :
          daysAgo === 1 ? 'Updated yesterday' :
          `Updated ${daysAgo} days ago`
        );
      }
      
      setPopularStreaming(popularData);
      setNewlyReleased(newReleasesData);
      setTopRated(topRatedData);
      setMalayalamCinema(malayalamData);

    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout) clearTimeout(searchTimeout);

    if (text.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          setSearchLoading(true);
          const [movies, tv] = await Promise.all([
            tmdbService.searchMovies(text),
            tmdbService.searchTVShows(text),
          ]);
          setSearchResults([...movies, ...tv]);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setSearchLoading(false);
        }
      }, 1500);
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleItemPress = (item: any) => {
    const id = item.tmdb_id || item.id;
    const mediaType = item.media_type || 'movie';
    const isMovie = mediaType === 'movie';
    
    if (isMovie) {
      navigation.navigate('MovieDetail', { movieId: id });
    } else {
      navigation.navigate('ShowDetail', { showId: id });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    filters.resetFilters();
  };

  const getGenreTitle = () => {
    if (userGenres.length === 0) return 'Your Favorites';
    const genreNames = userGenres
      .slice(0, 2)
      .map(id => GENRE_NAMES[id] || 'Movies')
      .join(' & ');
    return `Because You Like ${genreNames}`;
  };

  // Search results view
  if (showResults && searchResults.length > 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Container style={localStyles.container}>
          {/* Search Bar + Buttons */}
          <View style={localStyles.header}>
            <View style={localStyles.searchWrapper}>
              <View style={[localStyles.searchBox, { backgroundColor: colors.card, borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="search" size={22} color="#8E8A9A" style={{ marginRight: 12, opacity: 0.7 }} />
                <TextInput
                  style={[localStyles.input, { color: colors.text }]}
                  placeholder="Search movies & TV shows..."
                  placeholderTextColor={colors.textTertiary}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity onPress={clearSearch} style={{ padding: 4, marginLeft: 4 }}>
                  <Ionicons name="close-circle" size={22} color="#6E6A80" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={localStyles.buttons}>
              <FilterButton variant="sort" onPress={() => setIsSortSheetOpen(true)} />
              <FilterButton variant="filter" onPress={() => setFilterSheetOpen(true)} />
            </View>
          </View>

          <TouchableOpacity style={localStyles.back} onPress={clearSearch}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={[localStyles.backTxt, { color: colors.primary }]}>Back to Browse</Text>
          </TouchableOpacity>

          <PosterGrid data={searchResults} onItemPress={handleItemPress} />
        </Container>

        <SortBottomSheet visible={isSortSheetOpen} onClose={() => setIsSortSheetOpen(false)} />
        <FilterBottomSheet />
      </View>
    );
  }

  // Main browse view
  return (
    <View style={{ flex: 1, backgroundColor: '#0E0E12' }}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <View style={{ backgroundColor: '#0E0E12' }}>
          
          <View style={localStyles.header}>
            <View style={localStyles.searchWrapper}>
              <View style={localStyles.searchBox}>
                <Ionicons name="search" size={22} color="#8E8A9A" style={{ marginRight: 12, opacity: 0.7 }} />
                <TextInput
                  style={localStyles.input}
                  placeholder="Search movies & TV shows..."
                  placeholderTextColor="#6E6A80"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                />
                {searchLoading && <ActivityIndicator size="small" color="#8B5CFF" style={{ marginLeft: 8 }} />}
              </View>
            </View>
            
            <View style={localStyles.buttons}>
              <FilterButton variant="sort" onPress={() => setIsSortSheetOpen(true)} />
              <FilterButton variant="filter" onPress={() => setFilterSheetOpen(true)} />
            </View>
          </View>
          
          <View style={{ height: 24, backgroundColor: 'transparent' }} />
        </View>

        {loading ? (
          <View style={localStyles.loading}>
            <ActivityIndicator size="large" color="#8B5CFF" />
            <Text style={localStyles.loadingTxt}>Loading content...</Text>
          </View>
        ) : (
          <>
            <ContentRow title="Trending Now in India" data={trendingMovies} onItemPress={handleItemPress} />
            <View style={localStyles.divider} />

            {becauseYouLike.length > 0 && (
              <>
                <ContentRow title={getGenreTitle()} subtitle="Based on your preferences" data={becauseYouLike} onItemPress={handleItemPress} />
                <View style={localStyles.divider} />
              </>
            )}

            {user && (
              <>
                <ContentRow 
                  title="Popular in Your Network" 
                  subtitle={friendsActivity.length > 0 ? "What your friends are watching" : undefined} 
                  data={friendsActivity} 
                  onItemPress={handleItemPress} 
                  emptyMessage="Follow friends to see their watchlist activity" 
                />
                <View style={localStyles.divider} />
              </>
            )}

            {editorsPicks.length > 0 && (
              <>
                <ContentRow 
                  title={editorsTitle} 
                  subtitle={`By WatchMates Team • ${editorsSubtitle}`} 
                  data={editorsPicks} 
                  onItemPress={handleItemPress} 
                />
                <View style={localStyles.divider} />
              </>
            )}

            <ContentRow 
              title="Popular on Streaming This Week" 
              subtitle="Across all platforms in India" 
              data={popularStreaming} 
              onItemPress={handleItemPress} 
            />
            <View style={localStyles.divider} />

            <ContentRow 
              title="Newly Released on Streaming" 
              subtitle="Recent additions across all platforms" 
              data={newlyReleased} 
              onItemPress={handleItemPress} 
            />
            <View style={localStyles.divider} />

            <ContentRow 
              title="Top Rated Movies You Shouldn't Miss" 
              subtitle="IMDb 7.5+ • 300+ votes • 2015 onwards" 
              data={topRated} 
              onItemPress={handleItemPress} 
            />
            <View style={localStyles.divider} />

            {malayalamCinema.length > 0 && (
              <>
                <ContentRow 
                  title="Best of Malayalam Cinema" 
                  subtitle="Hidden gems from Kerala" 
                  data={malayalamCinema} 
                  onItemPress={handleItemPress} 
                />
                <View style={localStyles.divider} />
              </>
            )}

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <SortBottomSheet visible={isSortSheetOpen} onClose={() => setIsSortSheetOpen(false)} />
      <FilterBottomSheet />
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: { 
    padding: 0 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#1A1A20',
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  input: { 
    flex: 1, 
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 0,
    color: '#F5F5FF',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  back: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: spacing.md, 
    paddingTop: 12,
    paddingBottom: spacing.sm, 
    gap: 8 
  },
  backTxt: { 
    fontSize: 15, 
    fontWeight: '600' 
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingTxt: {
    fontSize: 14,
    color: '#6E6A80',
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: spacing.md,
    marginVertical: 10,
  },
});

export default SearchScreen;