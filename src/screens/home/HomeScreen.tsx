import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Movie, TVShow } from '../../types';
import { Container } from '../../components/layout/Container';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { spacing } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';

type Props = {
  navigation: any;
};

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
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
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
            <View style={styles.toggleWrapper}>
              <SegmentedControl
                segments={['Movies', 'TV Shows']}
                selectedIndex={selectedTab === 'movies' ? 0 : 1}
                onChange={(index) => setSelectedTab(index === 0 ? 'movies' : 'tv')}
              />
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
  toggleWrapper: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
});