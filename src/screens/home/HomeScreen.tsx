import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Movie, TVShow } from '../../types';
import { Container } from '../../components/layout/Container';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'movies' | 'tv'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (selectedTab === 'movies') {
        const trendingMovies = await tmdbService.getTrendingMovies();
        setMovies(trendingMovies);
      } else {
        const trendingShows = await tmdbService.getTrendingTVShows();
        setTVShows(trendingShows);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: Movie | TVShow) => {
    if ('title' in item) {
      // @ts-ignore
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      // @ts-ignore
      navigation.navigate('ShowDetail', { showId: item.id });
    }
  };

  const data = selectedTab === 'movies' ? movies : tvShows;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container style={styles.container}>
      <PosterGrid
        data={data}
        onItemPress={handleItemPress}
        ListHeaderComponent={
          <View>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'movies' && styles.activeTab]}
                onPress={() => setSelectedTab('movies')}
              >
                <Text style={[styles.tabText, selectedTab === 'movies' && styles.activeTabText]}>
                  Movies
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'tv' && styles.activeTab]}
                onPress={() => setSelectedTab('tv')}
              >
                <Text style={[styles.tabText, selectedTab === 'tv' && styles.activeTabText]}>
                  TV Shows
                </Text>
              </TouchableOpacity>
            </View>
            <SectionHeader title="Trending" />
          </View>
        }
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.background,
  },
});
