import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HorizontalScroll } from '../../components/media/HorizontalScroll';
import { WatchProviders } from '../../components/media/WatchProviders';
import { colors, spacing, typography } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowDetail'>;

export const ShowDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { showId } = route.params;
  const { user } = useAuthStore();
  
  const [show, setShow] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [watchlistItem, setWatchlistItem] = useState<any>(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [markingWatched, setMarkingWatched] = useState(false);

  useEffect(() => {
    loadShowDetails();
  }, [showId]);

  const loadShowDetails = async () => {
    try {
      const [details, credits, similarShows, watchProviders] = await Promise.all([
        tmdbService.getTVShowDetails(showId),
        tmdbService.getTVCredits(showId),
        tmdbService.getSimilarTVShows(showId),
        tmdbService.getTVWatchProviders(showId),
      ]);
      
      setShow(details);
      setCast(credits.cast?.slice(0, 10) || []);
      setSimilar(similarShows.slice(0, 10));
      setProviders(watchProviders);

      if (user) {
        const item = await watchlistService.isInWatchlist(user.id, showId, 'tv');
        setWatchlistItem(item);
      }
    } catch (error) {
      console.error('Error loading show details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add to watchlist');
      return;
    }

    try {
      setAddingToWatchlist(true);
      
      if (watchlistItem) {
        await watchlistService.removeFromWatchlist(watchlistItem.id);
        setWatchlistItem(null);
        Alert.alert('Success', 'Removed from watchlist');
      } else {
        const item = await watchlistService.addToWatchlist(user.id, showId, 'tv', 'to_watch');
        setWatchlistItem(item);
        Alert.alert('Success', 'Added to watchlist!');
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      Alert.alert('Error', 'Failed to update watchlist');
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const handleMarkWatched = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to mark as watched');
      return;
    }

    try {
      setMarkingWatched(true);
      
      if (watchlistItem?.status === 'watched') {
        await watchlistService.updateStatus(watchlistItem.id, 'to_watch');
        const updated = { ...watchlistItem, status: 'to_watch', watched_at: null };
        setWatchlistItem(updated);
        Alert.alert('Success', 'Moved to "To Watch"');
      } else if (watchlistItem) {
        await watchlistService.updateStatus(watchlistItem.id, 'watched');
        const updated = { ...watchlistItem, status: 'watched', watched_at: new Date().toISOString() };
        setWatchlistItem(updated);
        Alert.alert('Success', 'Marked as watched!');
      } else {
        const item = await watchlistService.addToWatchlist(user.id, showId, 'tv', 'watched');
        setWatchlistItem(item);
        Alert.alert('Success', 'Marked as watched!');
      }
    } catch (error) {
      console.error('Error marking watched:', error);
      Alert.alert('Error', 'Failed to update');
    } finally {
      setMarkingWatched(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Check out "${show.name}" on WatchMates!\n\n⭐ ${show.vote_average?.toFixed(1)}/10\n\n${show.overview?.substring(0, 100)}...\n\nWatch it together? 🎬`;
      
      await Share.share({
        message,
        title: show.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSimilarPress = (item: any) => {
    navigation.push('ShowDetail', { showId: item.id });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text>Show not found</Text>
      </View>
    );
  }

  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A';
  const seasons = show.number_of_seasons ? `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? 's' : ''}` : 'N/A';
  const isInWatchlist = !!watchlistItem;
  const isWatched = watchlistItem?.status === 'watched';

  return (
    <ScrollView style={styles.container}>
      {show.backdrop_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w780${show.backdrop_path}` }}
          style={styles.backdrop}
        />
      )}

      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Text style={styles.shareIcon}>↗️</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{show.name}</Text>
        
        {show.genres && show.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {show.genres.map((genre: any) => (
              <View key={genre.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>⭐ Rating</Text>
            <Text style={styles.metaValue}>{show.vote_average?.toFixed(1)}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>📅 Year</Text>
            <Text style={styles.metaValue}>{year}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>📺 Seasons</Text>
            <Text style={styles.metaValue}>{seasons}</Text>
          </View>
        </View>

        <WatchProviders providers={providers} mediaType="tv" tmdbId={showId} />

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.overview}>{show.overview}</Text>

        {/* Action Buttons - Three buttons */}
        <View style={styles.actions}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonThird}>
              <Button 
                title={isInWatchlist ? '✓ List' : '+ List'}
                onPress={handleAddToWatchlist}
                loading={addingToWatchlist}
                variant={isInWatchlist ? 'secondary' : 'primary'}
              />
            </View>
            <View style={styles.buttonThird}>
              <Button 
                title={isWatched ? '✓ Seen' : 'Watched'}
                onPress={handleMarkWatched}
                loading={markingWatched}
                variant={isWatched ? 'secondary' : 'outline'}
              />
            </View>
            <View style={styles.buttonThird}>
              <Button 
                title="Review"
                onPress={() => navigation.navigate('CreatePost', {
                  movieId: showId,
                  mediaType: 'tv',
                  title: show.name,
                  poster: show.poster_path,
                })}
                variant="outline"
              />
            </View>
          </View>
        </View>

        <HorizontalScroll
          title="Cast"
          data={cast}
          type="cast"
          onItemPress={(item) => console.log('Cast member:', item)}
        />

        <HorizontalScroll
          title="Similar Shows"
          data={similar}
          type="media"
          onItemPress={handleSimilarPress}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    width: '100%',
    height: 250,
    backgroundColor: colors.backgroundTertiary,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareIcon: {
    fontSize: 20,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  genreTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  genreText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  metaContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  metaDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  overview: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonThird: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});