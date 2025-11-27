import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
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

  const handleUserPress = (userId: string) => {
    if (userId === user?.id) {
      // Navigate to own profile tab
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
    // TODO: Navigate to create post or show modal
    console.log('Create post');
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
          size={40}
        />
        <View style={styles.postHeaderText}>
          <Text style={styles.postUsername}>
            {item.profile?.full_name || item.profile?.username}
          </Text>
          <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {/* Review Text */}
      <Text style={styles.reviewText}>{item.review_text}</Text>

      {/* Rating */}
      {item.rating && (
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating! ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      )}

      {/* Movie/Show Card */}
      <TouchableOpacity
        style={styles.mediaCard}
        onPress={() => handleMediaPress(item)}
        activeOpacity={0.7}
      >
        {item.media_poster ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w185${item.media_poster}` }}
            style={styles.mediaPoster}
          />
        ) : (
          <View style={styles.mediaPosterPlaceholder} />
        )}
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={2}>
            {item.media_title}
          </Text>
          <Text style={styles.mediaType}>
            {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.is_liked ? 'heart' : 'heart-outline'}
            size={20}
            color={item.is_liked ? '#FF6B6B' : colors.textSecondary}
          />
          <Text style={styles.actionText}>{item.like_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <Container>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view feed</Text>
        </View>
      </Container>
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
              Follow friends to see their reviews!
            </Text>
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
  },
  postCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  postTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.md,
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  mediaPoster: {
    width: 48,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  mediaPosterPlaceholder: {
    width: 48,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  mediaTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  mediaType: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postActions: {
    flexDirection: 'row',
    gap: spacing.lg,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingTop: 80,
  },
  emptyFeedEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyFeedText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyFeedSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});