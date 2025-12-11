// src/screens/watchlist/WatchlistScreen.tsx
// Fixed: No nested VirtualizedLists + Smooth skeleton loading

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { PosterCard } from '../../components/media/PosterCard';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { spacing, typography } from '../../theme';
import { useAuthStore } from '../../store';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { Movie, TVShow } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useSmartRefresh } from '../../hooks/useSmartRefresh';
import { RefreshEvents } from '../../services/refreshEvent.service';
import { GRID_COLUMNS } from '../../utils/constants';

type Props = {
  navigation?: any;
};

// Skeleton Loading Component
const SkeletonPoster = () => (
  <View style={styles.skeletonPoster}>
    <View style={styles.skeletonShimmer} />
  </View>
);

export const WatchlistScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'to_watch' | 'watched'>('to_watch');
  const [toWatchItems, setToWatchItems] = useState<(Movie | TVShow)[]>([]);
  const [watchedItems, setWatchedItems] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = async () => {
    if (!user) return;
    
    // If guest, show empty state
    if (user.isGuest) {
      setToWatchItems([]);
      setWatchedItems([]);
      setLoading(false);
      return;
    }

    try {
      if (!refreshing) setLoading(true); // Only show skeleton on initial load
      
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

  // Hybrid refresh system: Auto + Manual
  const { refreshing, onRefresh } = useSmartRefresh({
    onRefresh: loadWatchlist,
    refreshOnEvents: [RefreshEvents.WATCHLIST_UPDATED],
    deps: [user],
  });

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

  // Header Component
  const ListHeader = (
    <View style={styles.topSection}>
      <View style={styles.toggleWrapper}>
        <SegmentedControl
          segments={['To Watch', 'Watched']}
          selectedIndex={selectedTab === 'to_watch' ? 0 : 1}
          onChange={(index) => setSelectedTab(index === 0 ? 'to_watch' : 'watched')}
        />
      </View>

      <TouchableOpacity
        style={[styles.collectionsButton, { 
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        }]}
        onPress={handleCollections}
        activeOpacity={0.7}
      >
        <View style={[styles.collectionsIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="folder-outline" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.collectionsText, { color: colors.text }]}>My Collections</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );

  // Empty State Component
  const EmptyState = user?.isGuest ? (
    <View style={styles.guestEmptyContainer}>
      <Text style={styles.emptyEmoji}>📌</Text>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Sign up to build your watchlist
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Track movies you want to watch and mark them as watched!
      </Text>
      <TouchableOpacity
        style={styles.guestSignupButton}
        onPress={() => navigation?.navigate('Signup')}
      >
        <Text style={styles.guestSignupText}>Create Free Account</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {selectedTab === 'to_watch' ? '📝' : '✅'}
      </Text>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {selectedTab === 'to_watch'
          ? 'No items in your watchlist yet'
          : "You haven't watched anything yet"}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {selectedTab === 'to_watch'
          ? 'Add movies and shows from the detail pages!'
          : 'Mark items as watched to see them here!'}
      </Text>
    </View>
  );

  // Skeleton Loading (12 placeholders)
  const SkeletonGrid = (
    <View style={styles.skeletonGrid}>
      {[...Array(12)].map((_, i) => (
        <SkeletonPoster key={i} />
      ))}
    </View>
  );

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Please login to view watchlist
          </Text>
        </View>
      </View>
    );
  }

  // Show skeleton on initial load
  if (loading && data.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Container style={styles.container}>
          {ListHeader}
          {SkeletonGrid}
        </Container>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={data}
        numColumns={GRID_COLUMNS}
        renderItem={({ item }) => (
          <PosterCard item={item} onPress={() => handleItemPress(item)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  topSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  toggleWrapper: {
    marginBottom: spacing.md,
  },
  collectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  collectionsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  
  // Guest Empty State
  guestEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  guestSignupButton: {
    backgroundColor: '#8B5CFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  guestSignupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // SKELETON LOADING STYLES
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  skeletonPoster: {
    width: '30%',
    aspectRatio: 2/3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  skeletonShimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});