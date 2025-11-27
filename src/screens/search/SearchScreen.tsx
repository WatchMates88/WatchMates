import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Container } from '../../components/layout/Container';
import { SearchBar } from '../../components/search/SearchBar';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { Movie, TVShow } from '../../types';
import { colors, spacing, typography } from '../../theme';

type Props = {
  navigation: any;
};

type SearchMode = 'genre' | 'ott' | 'language';

// Major Indian OTT Platforms with TMDB IDs and logos
const INDIAN_OTT_PLATFORMS = [
  { 
    id: 8, 
    name: 'Netflix', 
    logo: 'https://images.justwatch.com/icon/207360008/s100/netflix.png',
    gradient: ['#E50914', '#B20710'] 
  },
  { 
    id: 119, 
    name: 'Prime Video', 
    logo: 'https://images.justwatch.com/icon/52449861/s100/amazon-prime-video.png',
    gradient: ['#00A8E1', '#0086B3'] 
  },
  { 
    id: 337, 
    name: 'Disney+ Hotstar', 
    logo: 'https://images.justwatch.com/icon/147638351/s100/disney-plus-hotstar.png',
    gradient: ['#0F298A', '#1A3FB8'] 
  },
  { 
    id: 546, 
    name: 'Jio Cinema', 
    logo: 'https://images.justwatch.com/icon/301155241/s100/jiocinema.png',
    gradient: ['#8031E8', '#A855F7'] 
  },
  { 
    id: 1796, 
    name: 'SonyLIV', 
    logo: 'https://images.justwatch.com/icon/301144191/s100/sonyliv.png',
    gradient: ['#FF6B00', '#FF8C00'] 
  },
  { 
    id: 2049, 
    name: 'Zee5', 
    logo: 'https://images.justwatch.com/icon/301558069/s100/zee5.png',
    gradient: ['#9333EA', '#A855F7'] 
  },
  { 
    id: 1955, 
    name: 'Apple TV+', 
    logo: 'https://images.justwatch.com/icon/190848813/s100/apple-tv-plus.png',
    gradient: ['#000000', '#333333'] 
  },
  { 
    id: 350, 
    name: 'YouTube', 
    logo: 'https://images.justwatch.com/icon/59562423/s100/youtube-premium.png',
    gradient: ['#FF0000', '#CC0000'] 
  },
  { 
    id: 1899, 
    name: 'Max', 
    logo: 'https://images.justwatch.com/icon/301683708/s100/max.png',
    gradient: ['#002BE7', '#0020A8'] 
  },
  { 
    id: 2100, 
    name: 'Aha', 
    logo: 'https://images.justwatch.com/icon/301558099/s100/aha.png',
    gradient: ['#FF6B35', '#F7931E'] 
  },
];

const LANGUAGES = [
  { code: 'en', name: 'English', emoji: '🇺🇸', gradient: ['#4F46E5', '#6366F1'] },
  { code: 'hi', name: 'Hindi', emoji: '🇮🇳', gradient: ['#FF6B35', '#F7931E'] },
  { code: 'te', name: 'Telugu', emoji: '🇮🇳', gradient: ['#10B981', '#059669'] },
  { code: 'ta', name: 'Tamil', emoji: '🇮🇳', gradient: ['#14B8A6', '#0D9488'] },
  { code: 'ml', name: 'Malayalam', emoji: '🇮🇳', gradient: ['#8B5CF6', '#7C3AED'] },
  { code: 'kn', name: 'Kannada', emoji: '🇮🇳', gradient: ['#EC4899', '#F43F5E'] },
  { code: 'es', name: 'Spanish', emoji: '🇪🇸', gradient: ['#EF4444', '#DC2626'] },
  { code: 'fr', name: 'French', emoji: '🇫🇷', gradient: ['#3B82F6', '#2563EB'] },
  { code: 'de', name: 'German', emoji: '🇩🇪', gradient: ['#FBBF24', '#F59E0B'] },
  { code: 'ja', name: 'Japanese', emoji: '🇯🇵', gradient: ['#F59E0B', '#D97706'] },
  { code: 'ko', name: 'Korean', emoji: '🇰🇷', gradient: ['#A855F7', '#9333EA'] },
  { code: 'zh', name: 'Chinese', emoji: '🇨🇳', gradient: ['#DC2626', '#B91C1C'] },
];

const GENRE_EMOJIS: { [key: string]: string } = {
  'Action': '💥',
  'Adventure': '🗺️',
  'Animation': '🎨',
  'Comedy': '😂',
  'Crime': '🔪',
  'Documentary': '📹',
  'Drama': '🎭',
  'Family': '👨‍👩‍👧‍👦',
  'Fantasy': '🧙‍♂️',
  'History': '📜',
  'Horror': '👻',
  'Music': '🎵',
  'Mystery': '🔍',
  'Romance': '💕',
  'Science Fiction': '🚀',
  'TV Movie': '📺',
  'Thriller': '😱',
  'War': '⚔️',
  'Western': '🤠',
};

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('genre');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const movieGenres = await tmdbService.getMovieGenres();
      setGenres(movieGenres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (text.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          setLoading(true);
          const [movieResults, tvResults] = await Promise.all([
            tmdbService.searchMovies(text),
            tmdbService.searchTVShows(text),
          ]);
          setSearchResults([...movieResults, ...tvResults]);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setLoading(false);
        }
      }, 1000);
      
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleItemPress = (item: Movie | TVShow) => {
    if ('title' in item) {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation.navigate('ShowDetail', { showId: item.id });
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleGenrePress = async (genreId: number) => {
    try {
      setLoading(true);
      clearResults();
      // Get trending movies in this genre
      const trending = await tmdbService.getTrendingMovies();
      const filtered = trending.filter(m => m.genre_ids.includes(genreId));
      
      // If not enough trending, get from discover
      if (filtered.length < 10) {
        const discovered = await tmdbService.discoverMovies({ 
          with_genres: genreId.toString(),
          page: 1
        });
        setSearchResults([...filtered, ...discovered.filter(d => !filtered.find(f => f.id === d.id))]);
      } else {
        setSearchResults(filtered);
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Error loading genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguagePress = async (languageCode: string) => {
    try {
      setLoading(true);
      clearResults();
      
      // Get trending movies first
      const trending = await tmdbService.getTrendingMovies();
      const trendingTV = await tmdbService.getTrendingTVShows();
      
      // Filter by language
      const filtered = [...trending, ...trendingTV].filter(
        m => m.original_language === languageCode
      );
      
      // If not enough, get from discover
      if (filtered.length < 10) {
        const discovered = await tmdbService.discoverMovies({ 
          with_original_language: languageCode,
          page: 1
        });
        setSearchResults([...filtered, ...discovered.filter(d => !filtered.find(f => f.id === d.id))]);
      } else {
        setSearchResults(filtered.slice(0, 20));
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTTPress = async (platform: typeof INDIAN_OTT_PLATFORMS[0]) => {
    try {
      setLoading(true);
      clearResults();
      
      // Get popular and trending movies
      const [popular, trending] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getTrendingMovies('week'),
      ]);
      
      // Combine and deduplicate
      const combined = [...trending, ...popular];
      const unique = combined.filter((movie, index, self) =>
        index === self.findIndex((m) => m.id === movie.id)
      );
      
      setSearchResults(unique.slice(0, 20));
      setShowResults(true);
    } catch (error) {
      console.error('Error loading OTT:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderToggleButtons = () => {
    const segments = ['Genre', 'Platform', 'Language'];
    const modeMap: SearchMode[] = ['genre', 'ott', 'language'];
    const currentIndex = modeMap.indexOf(searchMode);

    return (
      <View style={styles.toggleWrapper}>
        <SegmentedControl
          segments={segments}
          selectedIndex={currentIndex}
          onChange={(index) => {
            setSearchMode(modeMap[index]);
            clearResults();
          }}
        />
      </View>
    );
  };

  const renderGenreCards = () => (
    <View style={styles.gridContainer}>
      {genres.map((genre, index) => {
        const emoji = GENRE_EMOJIS[genre.name] || '🎬';
        const colorIndex = index % 6;
        const gradients = [
          ['#6366F1', '#818CF8'],
          ['#EC4899', '#F472B6'],
          ['#10B981', '#34D399'],
          ['#F59E0B', '#FBBF24'],
          ['#EF4444', '#F87171'],
          ['#8B5CF6', '#A78BFA'],
        ];
        
        return (
          <TouchableOpacity
            key={genre.id}
            style={[styles.modernCard, { backgroundColor: gradients[colorIndex][0] + '15' }]}
            onPress={() => handleGenrePress(genre.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.cardEmoji, { backgroundColor: gradients[colorIndex][0] + '25' }]}>
              <Text style={styles.cardEmojiText}>{emoji}</Text>
            </View>
            <Text style={styles.cardName}>{genre.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOTTCards = () => (
    <View style={styles.gridContainer}>
      {INDIAN_OTT_PLATFORMS.map((platform) => (
        <TouchableOpacity
          key={platform.id}
          style={[styles.ottCard]}
          onPress={() => handleOTTPress(platform)}
          activeOpacity={0.7}
        >
          <View style={styles.ottLogoContainer}>
            <Image
              source={{ uri: platform.logo }}
              style={styles.ottLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.ottName} numberOfLines={1}>{platform.name}</Text>
          <View style={[styles.cardAccent, { backgroundColor: platform.gradient[0] }]} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLanguageCards = () => (
    <View style={styles.gridContainer}>
      {LANGUAGES.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[styles.modernCard, { backgroundColor: language.gradient[0] + '12' }]}
          onPress={() => handleLanguagePress(language.code)}
          activeOpacity={0.7}
        >
          <View style={[styles.cardEmoji, { backgroundColor: language.gradient[0] + '25' }]}>
            <Text style={styles.cardEmojiText}>{language.emoji}</Text>
          </View>
          <Text style={styles.cardName}>{language.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container style={styles.container}>
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search movies & TV shows..."
        />
      </View>

      {showResults && searchResults.length > 0 ? (
        <View style={styles.resultsWrapper}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={clearResults}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back to Browse</Text>
            </TouchableOpacity>
          </View>
          <PosterGrid 
            data={searchResults} 
            onItemPress={handleItemPress}
          />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderToggleButtons()}
          
          <View style={styles.contentContainer}>
            {searchMode === 'genre' && renderGenreCards()}
            {searchMode === 'ott' && renderOTTCards()}
            {searchMode === 'language' && renderLanguageCards()}
          </View>
        </ScrollView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  toggleWrapper: {
    paddingHorizontal: spacing.md,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modernCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardEmoji: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardEmojiText: {
    fontSize: 32,
  },
  cardName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  // OTT Platform Cards with Logo
  ottCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: spacing.lg,
  },
  ottLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ottLogo: {
    width: '100%',
    height: '100%',
  },
  ottName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  resultsWrapper: {
    flex: 1,
  },
  backButtonContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});