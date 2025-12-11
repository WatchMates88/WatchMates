// src/screens/reviews/ReviewsScreen.tsx
// Option B: Separated sections with all reviews, same card design

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageSquare } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation.types';
import { reviewService } from '../../services/review.service';
import { postsService } from '../../services/supabase/posts.service';
import { UnifiedReview } from '../../types/review.types';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Reviews'>;

export const ReviewsScreen: React.FC<Props> = ({ route }) => {
  const { mediaType, mediaId, mediaTitle } = route.params;
  const { user } = useAuthStore();
  
  const [watchmatesReviews, setWatchmatesReviews] = useState<UnifiedReview[]>([]);
  const [tmdbReviews, setTmdbReviews] = useState<UnifiedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = async () => {
    try {
      const allReviews = await reviewService.getUnifiedReviews(mediaType, mediaId, user?.id);
      
      // Separate WatchMates and TMDB reviews
      const watchmates = allReviews.filter(r => r.source === 'watchmates');
      const tmdb = allReviews.filter(r => r.source === 'tmdb');
      
      setWatchmatesReviews(watchmates);
      setTmdbReviews(tmdb);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (review: UnifiedReview) => {
    if (!user || review.source !== 'watchmates' || !review.post) return;

    try {
      if (review.isLiked) {
        await postsService.unlikePost(user.id, review.post.id);
      } else {
        await postsService.likePost(user.id, review.post.id);
      }

      // Update local state
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

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const totalReviews = watchmatesReviews.length + tmdbReviews.length;

  if (totalReviews === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MessageSquare size={48} color="#6E6A80" />
        <Text style={styles.emptyTitle}>No Reviews Yet</Text>
        <Text style={styles.emptyText}>
          Be the first to share your thoughts about {mediaTitle}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#A78BFA"
        />
      }
    >
      {/* WatchMates Reviews Section */}
      {watchmatesReviews.length > 0 && (
        <View style={styles.section}>
          {watchmatesReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onLike={() => handleLike(review)}
            />
          ))}
        </View>
      )}

      {/* TMDB Reviews Section */}
      {tmdbReviews.length > 0 && (
        <View style={styles.section}>
          {watchmatesReviews.length > 0 && <View style={styles.sectionDivider} />}
          
          {tmdbReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B14',
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B14',
  },
  section: {
    marginBottom: 8,
  },
  sectionDivider: {
    height: 24,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B14',
    padding: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#B9B4C8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});