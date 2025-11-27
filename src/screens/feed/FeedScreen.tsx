import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/user/UserAvatar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { usePostsStore } from '../../store';
import { useAuthStore } from '../../store';
import { Post } from '../../types';

type Props = {
  navigation: any;
};

export const FeedScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { posts, isLoading, fetchFeed, toggleLike } = usePostsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user]);

  const loadFeed = async () => {
    if (!user) return;
    await fetchFeed(user.id, true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    await toggleLike(postId, user.id);
  };

  const handleComment = (postId: string) => {
    Alert.alert('Coming Soon', 'Comments feature coming soon!');
  };

  const handleUserPress = (userId: string) => {
    if (userId === user?.id) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('FriendProfile', { userId });
    }
  };

  const handleMediaPress = (post: Post) => {
    if (post.media_type === 'movie') {
      navigation.navigate('MovieDetail', { movieId: post.media_id });
    } else {
      navigation.navigate('ShowDetail', { showId: post.media_id });
    }
  };

  const handleCreatePost = () => {
    Alert.alert(
      'Create Post',
      'Please go to a movie or show detail page and click the "Review" button to create a post!'
    );
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* User Header */}
      <TouchableOpacity
        style={styles.postHeader}
        onPress={() => handleUserPress(item.user_id)}
        activeOpacity={0.7}
      >
        <UserAvatar
          avatarUrl={item.profile?.avatar_url}
          username={item.profile?.username || 'User'}
          size={44}
        />
        <View style={styles.postHeaderText}>
          <Text style={styles.postUsername}>
            {item.profile?.full_name || item.profile?.username}
          </Text>
          <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Review Text */}
      <Text style={styles.reviewText}>{item.review_text}</Text>

      {/* Rating Stars */}
      {item.rating && (
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating! ? 'star' : 'star-outline'}
              size={18}
              color="#FFD700"
            />
          ))}
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      )}

      {/* Movie/Show Card with Poster */}
      <TouchableOpacity
        style={styles.mediaCard}
        onPress={() => handleMediaPress(item)}
        activeOpacity={0.7}
      >
        {item.media_poster ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w342${item.media_poster}` }}
            style={styles.mediaPoster}
          />
        ) : (
          <View style={styles.mediaPosterPlaceholder}>
            <Ionicons name="film-outline" size={32} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.mediaInfo}>
          <View style={styles.mediaTypeTag}>
            <Ionicons 
              name={item.media_type === 'movie' ? 'film-outline' : 'tv-outline'} 
              size={12} 
              color={colors.primary} 
            />
            <Text style={styles.mediaTypeText}>
              {item.media_type === 'movie' ? 'MOVIE' : 'TV SHOW'}
            </Text>
          </View>
          <Text style={styles.mediaTitle} numberOfLines={2}>
            {item.media_title}
          </Text>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.is_liked ? 'heart' : 'heart-outline'}
            size={22}
            color={item.is_liked ? '#FF6B6B' : colors.textSecondary}
          />
          <Text style={[styles.actionText, item.is_liked && styles.actionTextLiked]}>
            {item.like_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view feed</Text>
        </View>
      </View>
    );
  }

  if (isLoading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedEmoji}>🎬</Text>
            <Text style={styles.emptyFeedText}>No posts yet</Text>
            <Text style={styles.emptyFeedSubtext}>
              Follow friends to see their reviews, or create your first post!
            </Text>
            <TouchableOpacity 
              style={styles.emptyFeedButton}
              onPress={handleCreatePost}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyFeedButtonText}>Create Your First Review</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Create Post Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  feedList: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  postHeaderText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  postUsername: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  postTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: spacing.xs,
  },
  reviewText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: spacing.xs,
  },
  mediaCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  mediaPoster: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
  },
  mediaPosterPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  mediaTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  mediaTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  mediaTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  viewDetailsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  postActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  actionTextLiked: {
    color: '#FF6B6B',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  emptyFeed: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyFeedEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyFeedText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyFeedSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  emptyFeedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyFeedButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});