// src/screens/home/HomeScreen.tsx
// Optimized: Memoized callbacks, performance props

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Movie, TVShow } from '../../types';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { FeaturedCarousel } from '../../components/media/FeaturedCarousel';
import { spacing } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  navigation: any;
};

const PARENT_HORIZONTAL_PADDING = 16; // spacing.md

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
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
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized item press handler
  const handleItemPress = useCallback((item: Movie | TVShow) => {
    if ('title' in item) {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation.navigate('ShowDetail', { showId: item.id });
    }
  }, [navigation]);

  // Memoized tab change handler
  const handleTabChange = useCallback((index: number) => {
    setSelectedTab(index === 0 ? 'movies' : 'tv');
  }, []);

  const data = selectedTab === 'movies' ? movies : tvShows;

  if (loading) return <LoadingSpinner />;

  // Memoized header component
  const ListHeader = (
    <>
      {/* Full-bleed Featured Carousel */}
      <FeaturedCarousel
        items={data.slice(0, 6)}
        onPress={handleItemPress}
        parentHorizontalPadding={PARENT_HORIZONTAL_PADDING}
      />

      {/* Segmented Control */}
      <View style={styles.toggleWrapper}>
        <SegmentedControl
          segments={['Movies', 'TV Shows']}
          selectedIndex={selectedTab === 'movies' ? 0 : 1}
          onChange={handleTabChange}
        />
      </View>

      {/* Section Header */}
      <SectionHeader title="Trending" />
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PosterGrid
        data={data}
        onItemPress={handleItemPress}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleWrapper: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});