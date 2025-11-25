import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { tmdbService } from '../../services/tmdb/tmdb.service';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export const MovieDetailScreen: React.FC<Props> = ({ route }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      const details = await tmdbService.getMovieDetails(movieId);
      setMovie(details);
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = () => {
    // TODO: Implement add to watchlist with watchlistService
    console.log('Add to watchlist');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text>Movie not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Backdrop */}
      {movie.backdrop_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }}
          style={styles.backdrop}
        />
      )}

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{movie.title}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {movie.vote_average?.toFixed(1)}</Text>
          <Text style={styles.voteCount}>({movie.vote_count} votes)</Text>
        </View>

        {/* Overview */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.overview}>{movie.overview}</Text>

        {/* Release Date */}
        <Text style={styles.sectionTitle}>Release Date</Text>
        <Text style={styles.info}>{movie.release_date}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Add to Watchlist" onPress={handleAddToWatchlist} />
        </View>
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
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rating: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  voteCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  overview: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  info: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
