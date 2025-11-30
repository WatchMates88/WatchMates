import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Platform } from 'react-native';
import { Container } from '../../components/layout/Container';
import { SearchBar } from '../../components/search/SearchBar';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { cacheService } from '../../services/supabase/cache.service';
import { Movie, TVShow } from '../../types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  navigation: any;
};

type SearchMode = 'genre' | 'ott' | 'language';

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
  
];

const LANGUAGES = [
  { code: 'en', name: 'English', emoji: '🇺🇸' },
  { code: 'hi', name: 'Hindi', emoji: '🇮🇳' },
  { code: 'te', name: 'Telugu', emoji: '🇮🇳' },
  { code: 'ta', name: 'Tamil', emoji: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', emoji: '🇮🇳' },
  { code: 'kn', name: 'Kannada', emoji: '🇮🇳' },
  { code: 'es', name: 'Spanish', emoji: '🇪🇸' },
  { code: 'fr', name: 'French', emoji: '🇫🇷' },
  { code: 'de', name: 'German', emoji: '🇩🇪' },
  { code: 'ja', name: 'Japanese', emoji: '🇯🇵' },
  { code: 'ko', name: 'Korean', emoji: '🇰🇷' },
  { code: 'zh', name: 'Chinese', emoji: '🇨🇳' },
];

const LANGUAGE_COLOR_GROUPS: Record<string, string[]> = {
  blue: ['en', 'fr', 'ko', 'ja'],
  orange: ['hi', 'te', 'ta', 'ml', 'kn'],
  red: ['es', 'zh'],
  yellow: ['de'],
};

const LANGUAGE_GLOW_COLORS: Record<string, string> = {
  blue: 'rgba(58,125,255,0.22)',
  orange: 'rgba(228,127,46,0.22)',
  red: 'rgba(255,61,61,0.22)',
  yellow: 'rgba(245,196,0,0.22)',
  purple: 'rgba(159,115,255,0.22)',
};

const getGlowColor = (code: string) => {
  for (const group in LANGUAGE_COLOR_GROUPS) {
    if (LANGUAGE_COLOR_GROUPS[group].includes(code)) {
      return LANGUAGE_GLOW_COLORS[group];
    }
  }
  return LANGUAGE_GLOW_COLORS.purple;
};

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
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('genre');
  const [searchResults, setSearchResults] = useState<any[]>([]);
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

  const handleItemPress = (item: any) => {
    if ('title' in item || item.media_type === 'movie') {
      navigation.navigate('MovieDetail', { movieId: item.tmdb_id || item.id });
    } else {
      navigation.navigate('ShowDetail', { showId: item.tmdb_id || item.id });
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setShowResults(false);
    setSearchQuery('');
  };

  // 🔥 NEW: Uses cache service
  const handleGenrePress = async (genreId: number) => {
    try {
      setLoading(true);
      clearResults();
      
      console.log(`[Search] Fetching cached movies for genre ${genreId}...`);
      const cached = await cacheService.getMoviesByGenre(genreId, 20);
      
      setSearchResults(cached);
      setShowResults(true);
    } catch (error) {
      console.error('Error loading genre:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Uses cache service
  const handleLanguagePress = async (languageCode: string) => {
    try {
      setLoading(true);
      clearResults();
      
      console.log(`[Search] Fetching cached movies for language ${languageCode}...`);
      const cached = await cacheService.getMoviesByLanguage(languageCode, 20);
      
      setSearchResults(cached);
      setShowResults(true);
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Uses cache service with provider filtering
  const handleOTTPress = async (platform: typeof INDIAN_OTT_PLATFORMS[0]) => {
    try {
      setLoading(true);
      clearResults();
      
      console.log(`[Search] Fetching cached movies for provider ${platform.name}...`);
      const cached = await cacheService.getMoviesByProvider(platform.id, 'IN', 20);
      
      // If no cached results, fallback to popular
      if (cached.length === 0) {
        console.log(`[Search] No cached results, using popular fallback...`);
        const popular = await cacheService.getPopularMovies(20);
        setSearchResults(popular);
      } else {
        setSearchResults(cached);
      }
      
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
      {genres.map((genre) => {
        const emoji = GENRE_EMOJIS[genre.name] || '🎬';
        
        const genreGlowColors: { [key: string]: string } = {
          'Action': 'rgba(255, 107, 107, 0.22)',
          'Adventure': 'rgba(92, 201, 255, 0.22)',
          'Animation': 'rgba(255, 197, 92, 0.22)',
          'Comedy': 'rgba(255, 184, 108, 0.22)',
          'Crime': 'rgba(255, 92, 139, 0.22)',
          'Documentary': 'rgba(94, 143, 255, 0.22)',
          'Drama': 'rgba(159, 115, 255, 0.22)',
          'Family': 'rgba(92, 255, 179, 0.22)',
          'Fantasy': 'rgba(124, 92, 255, 0.22)',
          'History': 'rgba(255, 184, 108, 0.22)',
          'Horror': 'rgba(255, 92, 139, 0.22)',
          'Music': 'rgba(159, 115, 255, 0.22)',
          'Mystery': 'rgba(94, 143, 255, 0.22)',
          'Romance': 'rgba(255, 92, 139, 0.22)',
          'Science Fiction': 'rgba(92, 201, 255, 0.22)',
          'Thriller': 'rgba(255, 92, 139, 0.22)',
          'War': 'rgba(255, 184, 108, 0.22)',
          'Western': 'rgba(255, 184, 108, 0.22)',
          'TV Movie': 'rgba(94, 143, 255, 0.22)',
        };

        const glowColor = genreGlowColors[genre.name] || 'rgba(159, 115, 255, 0.22)';

        return (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreCard,
              { 
                backgroundColor: colors.genreCardBg,
                borderColor: colors.primaryBorder,
              }
            ]}
            onPress={() => handleGenrePress(genre.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.genreEmojiContainer,
              { backgroundColor: glowColor }
            ]}>
              <Text style={styles.genreEmoji}>{emoji}</Text>
            </View>
            <Text style={[styles.genreName, { color: colors.text }]}>
              {genre.name}
            </Text>
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
          style={[
            styles.ottCard, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            }
          ]}
          onPress={() => handleOTTPress(platform)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.logoGlow,
            { backgroundColor: platform.gradient[0], opacity: 0.14 }
          ]} />
          
          <View style={styles.ottLogoContainer}>
            <Image
              source={{ uri: platform.logo }}
              style={styles.ottLogo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[styles.ottName, { color: colors.textSecondary }]} numberOfLines={1}>
            {platform.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLanguageCards = () => (
    <View style={styles.gridContainer}>
      {LANGUAGES.map((language) => {
        const glow = getGlowColor(language.code);

        return (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageCard,
              {
                backgroundColor: '#181524',
                borderColor: colors.cardBorder,
              }
            ]}
            onPress={() => handleLanguagePress(language.code)}
            activeOpacity={0.7}
          >
            <View style={[styles.languageGlow, { backgroundColor: glow }]} />

            <View style={styles.languageLogoContainer}>
              <Text style={{ fontSize: 34 }}>{language.emoji}</Text>
            </View>

            <Text style={styles.languageText}>
              {language.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
                style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]} 
                onPress={clearResults}
                activeOpacity={0.7}
              >
                <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back to Browse</Text>
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
    </View>
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
  genreCard: {
    width: '48%',
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  genreEmojiContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  genreEmoji: {
    fontSize: 34,
  },
  genreName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  ottCard: {
    width: '48%',
    borderRadius: 22,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
    overflow: 'visible',
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 12,
    alignSelf: 'center',
  },
  ottLogoContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: 'rgba(255, 255, 255, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: spacing.md,
  },
  ottLogo: {
    width: '100%',
    height: '100%',
  },
  ottName: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  languageCard: {
    width: '48%',
    borderRadius: 22,
    padding: 18,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'visible',
  },
  languageGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 10,
    alignSelf: 'center',
    opacity: 0.22,
  },
  languageLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: spacing.sm,
  },
  languageText: {
    color: '#B9B4C8',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  resultsWrapper: {
    flex: 1,
  },
  backButtonContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default SearchScreen;