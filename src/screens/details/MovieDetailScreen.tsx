// src/screens/details/MovieDetailScreen.tsx
// Updated: Trailer button on poster + Reviews section

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Play } from 'lucide-react-native';
import { RootStackParamList } from '../../types';
import { Button } from '../../components/common/Button';
import { HorizontalScroll } from '../../components/media/HorizontalScroll';
import { WatchProviders } from '../../components/media/WatchProviders';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { spacing } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { reviewService } from '../../services/review.service';
import { postsService } from '../../services/supabase/posts.service';
import { useAuthStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { streamingService, ProviderAvailability } from '../../services/justwatch/justwatch.service';
import { UnifiedReview } from '../../types/review.types';
import { useGuestCheck } from '../../hooks/useGuestCheck';
import { SignupPromptModal } from '../../components/auth/SignupPromptModal';
import { AddToListModal } from '../../components/media/AddToListModal';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export const MovieDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movieId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuthStore();
  
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [providers, setProviders] = useState<ProviderAvailability[]>([]);
  const [watchlistItem, setWatchlistItem] = useState<any>(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [markingWatched, setMarkingWatched] = useState(false);

  const [officialTrailer, setOfficialTrailer] = useState<any>(null);
  const [watchmatesReviews, setWatchmatesReviews] = useState<UnifiedReview[]>([]);
  const [tmdbReviews, setTmdbReviews] = useState<UnifiedReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Guest check hook
  const { checkGuest, promptVisible, promptAction, closePrompt } = useGuestCheck();
  
  // Add to List modal state
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  useEffect(() => {
    loadMovieDetails();
    loadReviews();
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      const [details, credits, similarMovies, jwProviders, movieVideos] = await Promise.all([
        tmdbService.getMovieDetails(movieId),
        tmdbService.getMovieCredits(movieId),
        tmdbService.getSimilarMovies(movieId),
        streamingService.getProviders(movieId, 'movie', ['IN', 'US']),
        tmdbService.getMovieVideos(movieId),
      ]);
      
      setMovie(details);
      setCast(credits.cast?.slice(0, 10) || []);
      setSimilar(similarMovies.slice(0, 10));
      setProviders(jwProviders);

      // Get first official trailer
      if (movieVideos && movieVideos.list && movieVideos.list.length > 0) {
        const trailer = movieVideos.list.find((v: any) => 
          (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
        );
        setOfficialTrailer(trailer || null);
      }

      if (user) {
        const item = await watchlistService.isInWatchlist(user.id, movieId, 'movie');
        setWatchlistItem(item);
      }
    } catch (error) {
      console.error('Error loading movie details:', error);
      setMovie(null);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const allReviews = await reviewService.getUnifiedReviews('movie', movieId, user?.id);
      
      const watchmates = allReviews.filter(r => r.source === 'watchmates').slice(0, 3);
      const allTmdb = allReviews.filter(r => r.source === 'tmdb');
      
      // Smart TMDB limiting based on WatchMates count
      let tmdbCount = 0;
      if (watchmates.length === 0) {
        tmdbCount = 3; // Fill empty space
      } else if (watchmates.length === 1) {
        tmdbCount = 2; // Balance
      } else if (watchmates.length === 2) {
        tmdbCount = 1; // Supplement
      }
      // else: 3+ WatchMates = 0 TMDB
      
      const tmdb = allTmdb.slice(0, tmdbCount);
      
      setWatchmatesReviews(watchmates);
      setTmdbReviews(tmdb);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleLikeReview = async (review: UnifiedReview) => {
    if (!user || review.source !== 'watchmates' || !review.post) return;

    try {
      if (review.isLiked) {
        await postsService.unlikePost(user.id, review.post.id);
      } else {
        await postsService.likePost(user.id, review.post.id);
      }

      setWatchmatesReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? {
                ...r,
                isLiked: !r.isLiked,
                likeCount: r.isLiked ? r.likeCount! - 1 : r.likeCount! + 1,
              }
            : r
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddToWatchlist = async () => {
    // Check if guest
    if (!checkGuest('save')) return;

    if (!user) {
      Alert.alert('Login Required', 'Please login to add to watchlist');
      return;
    }

    // Open Add to List modal
    setShowAddToListModal(true);
  };

  const handleMarkWatched = async () => {
    // Check if guest
    if (!checkGuest('save')) return;

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
        const item = await watchlistService.addToWatchlist(user.id, movieId, 'movie', 'watched');
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
      const message = `Check out "${movie.title}" on WatchMates!\n\n⭐ ${movie.vote_average?.toFixed(1)}/10\n\n${movie.overview?.substring(0, 100)}...\n\nWatch it together? 🎬`;
      
      await Share.share({
        message,
        title: movie.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSimilarPress = (item: any) => {
    navigation.push('MovieDetail', { movieId: item.id });
  };

  const handlePlayTrailer = () => {
    if (officialTrailer) {
      navigation.navigate('TrailerPlayer', {
        videoKey: officialTrailer.key,
        title: officialTrailer.name || movie?.title || 'Trailer',
      });
    }
  };

  const handleSeeAllReviews = () => {
    navigation.navigate('Reviews', {
      mediaType: 'movie',
      mediaId: movieId,
      mediaTitle: movie?.title || '',
    });
  };

  if (movie === null && !movie) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="film-outline" size={64} color={colors.textTertiary} />
        <Text style={[styles.errorText, { color: colors.text }]}>Movie not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonError}>
          <Text style={{ color: colors.primary }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtime = movie?.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const isInWatchlist = !!watchlistItem;
  const isWatched = watchlistItem?.status === 'watched';
  const totalReviews = watchmatesReviews.length + tmdbReviews.length;
  const hasMoreReviews = totalReviews > 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Backdrop with Trailer Button */}
      {movie?.backdrop_path && (
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }}
            style={styles.backdrop}
          />
          <View style={styles.bottomGradient} />
          
          {/* Trailer Button Capsule */}
          {officialTrailer && (
            <TouchableOpacity 
              style={styles.trailerButton}
              onPress={handlePlayTrailer}
              activeOpacity={0.8}
            >
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.trailerButtonText}>Trailer</Text>
            </TouchableOpacity>
          )}
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
        <Ionicons name="share-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{movie?.title || 'Loading...'}</Text>
        
        {/* Genres */}
        {movie?.genres && movie.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {movie.genres.map((genre: any) => (
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
            <Text style={styles.metaValue}>{movie?.vote_average?.toFixed(1) || '—'}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#C9B7FF" style={styles.metaIcon} />
            <Text style={styles.metaLabel}>Year</Text>
            <Text style={styles.metaValue}>{year}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#C9B7FF" style={styles.metaIcon} />
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{runtime}</Text>
          </View>
        </View>

        {/* Streaming Providers */}
        <WatchProviders providers={providers} mediaType="movie" tmdbId={movie.id} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Overview */}
        <Text style={styles.overviewTitle}>Overview</Text>
        <Text style={styles.overviewText}>{movie?.overview || 'Loading overview...'}</Text>

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
                onPress={() => {
                  if (!checkGuest('review')) return;
                  
                  navigation.navigate('CreatePost', {
                    movieId,
                    mediaType: 'movie',
                    title: movie?.title || '',
                    poster: movie?.poster_path,
                  });
                }}
                variant="outline"
              />
            </View>
          </View>
        </View>

        {/* REVIEWS SECTION */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {hasMoreReviews && (
              <TouchableOpacity onPress={handleSeeAllReviews}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingReviews ? (
            <View style={styles.reviewsLoading}>
              <ActivityIndicator size="small" color="#A78BFA" />
            </View>
          ) : totalReviews === 0 ? (
            <View style={styles.noReviews}>
              <Ionicons name="chatbubble-outline" size={32} color="#6E6A80" />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>Be the first to share your thoughts!</Text>
            </View>
          ) : (
            <>
              {watchmatesReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={() => handleLikeReview(review)}
                />
              ))}

              {tmdbReviews.length > 0 && (
                <>
                  {watchmatesReviews.length > 0 && <View style={styles.reviewsDivider} />}
                  {tmdbReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </>
              )}
            </>
          )}
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

        {/* Similar Movies */}
        {similar.length > 0 && (
          <HorizontalScroll
            title="Similar Movies"
            data={similar}
            type="media"
            onItemPress={handleSimilarPress}
          />
        )}
      </View>

      {/* Guest Signup Prompt Modal */}
      <SignupPromptModal
        visible={promptVisible}
        onClose={closePrompt}
        action={promptAction}
      />

      {/* Add to List Modal */}
      <AddToListModal
        visible={showAddToListModal}
        onClose={() => {
          setShowAddToListModal(false);
          loadMovieDetails(); // Refresh to update button state
        }}
        mediaId={movieId}
        mediaType="movie"
        mediaTitle={movie?.title || ''}
        mediaPoster={movie?.poster_path || null}
      />
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
  
  // TRAILER BUTTON CAPSULE
  trailerButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  trailerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.3,
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
  
  content: { paddingBottom: spacing.xl },
  
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F5F5FF',
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

  reviewsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  seeAllText: {
    color: 'rgba(255, 255, 255, 0.65)', // Less bright
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  noReviews: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noReviewsText: {
    color: '#F5F5FF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noReviewsSubtext: {
    color: '#6E6A80',
    fontSize: 14,
    marginTop: 4,
  },
  reviewsDivider: {
    height: 18,
  },

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