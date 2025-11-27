import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { PosterGrid } from '../../components/media/PosterGrid';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { Movie, TVShow } from '../../types';

type Props = {
  navigation?: any;
};

export const WatchlistScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'to_watch' | 'watched'>('to_watch');
  const [toWatchItems, setToWatchItems] = useState<(Movie | TVShow)[]>([]);
  const [watchedItems, setWatchedItems] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const watchlist = await watchlistService.getWatchlist(user.id);
      const toWatch = watchlist.filter(item => item.status === 'to_watch');
      const watched = watchlist.filter(item => item.status === 'watched');
      
      const toWatchPromises = toWatch.map(async (item) => {
        try {
          if (item.media_type === 'movie') {
            return await tmdbService.getMovieDetails(item.media_id);
          } else {
            return await tmdbService.getTVShowDetails(item.media_id);
          }
        } catch (error) {
          return null;
        }
      });
      
      const watchedPromises = watched.map(async (item) => {
        try {
          if (item.media_type === 'movie') {
            return await tmdbService.getMovieDetails(item.media_id);
          } else {
            return await tmdbService.getTVShowDetails(item.media_id);
          }
        } catch (error) {
          return null;
        }
      });
      
      const toWatchDetails = await Promise.all(toWatchPromises);
      const watchedDetails = await Promise.all(watchedPromises);
      
      setToWatchItems(toWatchDetails.filter(item => item !== null));
      setWatchedItems(watchedDetails.filter(item => item !== null));
      
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: Movie | TVShow) => {
    if ('title' in item) {
      navigation?.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation?.navigate('ShowDetail', { showId: item.id });
    }
  };

  const handleCollections = () => {
    navigation?.navigate('Collections');
  };

  const data = selectedTab === 'to_watch' ? toWatchItems : watchedItems;

  if (!user) {
    return (
      <Container>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view watchlist</Text>
        </View>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.toggleWrapper}>
          <SegmentedControl
            segments={['To Watch', 'Watched']}
            selectedIndex={selectedTab === 'to_watch' ? 0 : 1}
            onChange={(index) => setSelectedTab(index === 0 ? 'to_watch' : 'watched')}
          />
        </View>

        {/* Collections Button */}
        <TouchableOpacity
          style={styles.collectionsButton}
          onPress={handleCollections}
          activeOpacity={0.7}
        >
          <View style={styles.collectionsIcon}>
            <Ionicons name="folder-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.collectionsText}>My Collections</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {data.length > 0 ? (
        <PosterGrid 
          data={data} 
          onItemPress={handleItemPress}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            {selectedTab === 'to_watch' ? '📝' : '✅'}
          </Text>
          <Text style={styles.emptyText}>
            {selectedTab === 'to_watch'
              ? 'No items in your watchlist yet'
              : "You haven't watched anything yet"}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedTab === 'to_watch'
              ? 'Add movies and shows from the detail pages!'
              : 'Mark items as watched to see them here!'}
          </Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  toggleWrapper: {
    marginBottom: spacing.md,
  },
  collectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  collectionsText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});