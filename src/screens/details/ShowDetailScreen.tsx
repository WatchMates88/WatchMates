import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { Button } from '../../components/common/Button';
import { HorizontalScroll } from '../../components/media/HorizontalScroll';
import { WatchProviders } from '../../components/media/WatchProviders';
import { spacing } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { useAuthStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { streamingService, ProviderAvailability } from '../../services/justwatch/justwatch.service';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowDetail'>;

export const ShowDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { showId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [show, setShow] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [providers, setProviders] = useState<ProviderAvailability[]>([]);
  const [watchlistItem, setWatchlistItem] = useState<any>(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [markingWatched, setMarkingWatched] = useState(false);

  useEffect(() => {
    loadShowDetails();
  }, [showId]);

  const loadShowDetails = async () => {
    try {
      // Fetch all data in parallel (no loading spinner)
      const [details, credits, similarShows, jwProviders] = await Promise.all([
        tmdbService.getTVShowDetails(showId),
        tmdbService.getTVCredits(showId),
        tmdbService.getSimilarTVShows(showId),
        streamingService.getProviders(showId, 'tv', ['IN', 'US']),
      ]);
      
      setShow(details);
      setCast(credits.cast?.slice(0, 10) || []);
      setSimilar(similarShows.slice(0, 10));
      setProviders(jwProviders);

      // Watchlist check (non-blocking)
      if (user) {
        const item = await watchlistService.isInWatchlist(user.id, showId, 'tv');
        setWatchlistItem(item);
      }
    } catch (error) {
      console.error('Error loading show details:', error);
      setShow(null);
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
      const message = `Check out "${show?.name}" on WatchMates!\n\n⭐ ${show?.vote_average?.toFixed(1)}/10\n\n${show?.overview?.substring(0, 100)}...\n\nWatch it together? 🎬`;
      
      await Share.share({
        message,
        title: show?.name || 'TV Show',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSimilarPress = (item: any) => {
    navigation.push('ShowDetail', { showId: item.id });
  };

  // Error state (no loading spinner!)
  if (show === null && !show) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="tv-outline" size={64} color={colors.textTertiary} />
        <Text style={[styles.errorText, { color: colors.text }]}>Show not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonError}>
          <Text style={{ color: colors.primary }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show content immediately
  const year = show?.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A';
  const seasons = show?.number_of_seasons ? `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? 's' : ''}` : 'N/A';
  const isInWatchlist = !!watchlistItem;
  const isWatched = watchlistItem?.status === 'watched';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Backdrop */}
      {show?.backdrop_path && (
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w780${show.backdrop_path}` }}
            style={styles.backdrop}
          />
          <View style={styles.bottomGradient} />
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{show?.name || 'Loading...'}</Text>
        
        {/* Genres */}
        {show?.genres && show.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {show.genres.map((genre: any) => (
              <View key={genre.id} style={styles.genrePill}>
                <Text style={styles.genrePillText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Meta */}
        <View style={styles.metaGlass}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={16} color="#FFD700" style={styles.metaIcon} />
            <Text style={styles.metaLabel}>Rating</Text>
            <Text style={styles.metaValue}>{show?.vote_average?.toFixed(1) || '—'}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#C9B7FF" style={styles.metaIcon} />
            <Text style={styles.metaLabel}>Year</Text>
            <Text style={styles.metaValue}>{year}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="tv-outline" size={16} color="#C9B7FF" style={styles.metaIcon} />
            <Text style={styles.metaLabel}>Seasons</Text>
            <Text style={styles.metaValue}>{seasons}</Text>
          </View>
        </View>

        {/* Streaming Providers */}
        <WatchProviders providers={providers} mediaType="tv" tmdbId={showId} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Overview */}
        <Text style={styles.overviewTitle}>Overview</Text>
        <Text style={styles.overviewText}>{show?.overview || 'Loading overview...'}</Text>

        {/* Action Buttons */}
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
                  title: show?.name || '',
                  poster: show?.poster_path,
                })}
                variant="outline"
              />
            </View>
          </View>
        </View>

        {/* Cast */}
        {cast.length > 0 && (
          <HorizontalScroll
            title="Cast"
            data={cast}
            type="cast"
            onItemPress={(item) => console.log('Cast member:', item)}
          />
        )}

        {/* Similar Shows */}
        {similar.length > 0 && (
          <HorizontalScroll
            title="Similar Shows"
            data={similar}
            type="media"
            onItemPress={handleSimilarPress}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdropContainer: { 
    width: '100%', 
    height: 290, 
    position: 'relative',
  },
  backdrop: { 
    width: '100%', 
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'transparent',
  },
  backButton: {
    position: 'absolute',
    top: 62,
    left: 16,
    zIndex: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 62,
    right: 16,
    zIndex: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingBottom: spacing.xxl },
  title: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  genrePill: {
    backgroundColor: 'rgba(139, 92, 255, 0.12)',
    borderColor: 'rgba(139, 92, 255, 0.32)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  genrePillText: {
    color: '#DCD2FF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metaGlass: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaIcon: { marginBottom: 6 },
  metaLabel: {
    color: '#B9B4C8',
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#F5F5FF',
    fontSize: 19,
    fontWeight: '700',
  },
  metaDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  divider: {
    height: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.md,
  },
  overviewTitle: {
    color: '#F5F5FF',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  overviewText: {
    color: '#B9B4C8',
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  buttonThird: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '600',
  },
  backButtonError: {
    marginTop: 8,
  },
});