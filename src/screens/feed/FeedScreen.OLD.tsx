import { PostCardNew } from '../../components/media/PostCardNew';
import { designTokens } from '../../theme/tokens';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../../components/user/UserAvatar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { spacing, typography } from '../../theme';
import { usePostsStore, useAuthStore, useCommentsStore } from '../../store';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { Post, Movie, TVShow } from '../../types';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  navigation: any;
};

export const FeedScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { posts, isLoading, fetchFeed, toggleLike, deletePostById } = usePostsStore();
  const { getCommentsForPost } = useCommentsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) loadFeed();
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
    navigation.navigate('PostDetail', { postId });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handlePostOptions = (post: Post) => {
    const isOwner = post.user_id === user?.id;
    if (!isOwner) return;

    Alert.alert('Post Options', '', [
      {
        text: 'Edit',
        onPress: () => {
          navigation.navigate('CreatePost', {
            movieId: post.media_id,
            mediaType: post.media_type,
            title: post.media_title,
            poster: post.media_poster,
            editPostId: post.id,
            existingText: post.review_text,
            existingRating: post.rating,
          });
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deletePostById(post.id);
                    Alert.alert('Success', 'Post deleted');
                  } catch (error) {
                    Alert.alert('Error', 'Failed to delete post');
                  }
                },
              },
            ]
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // 🔥 FIXED HERE — navigating to your own Profile
  const handleUserPress = (userId: string) => {
    if (userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
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

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length > 2) {
      try {
        setSearching(true);
        const [movies, shows] = await Promise.all([
          tmdbService.searchMovies(text),
          tmdbService.searchTVShows(text),
        ]);
        setSearchResults([...movies, ...shows]);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectMedia = (item: Movie | TVShow) => {
    const title = 'title' in item ? item.title : item.name;
    const mediaType = 'title' in item ? 'movie' : 'tv';

    navigation.navigate('CreatePost', {
      movieId: item.id,
      mediaType,
      title,
      poster: item.poster_path,
    });

    setSearchQuery('');
    setSearchResults([]);
  };

  // 🔥 Clicking + → go to CreatePost
  const handleCreatePost = () => {
    navigation.navigate('CreatePost', {
      movieId: 0,
      mediaType: 'movie',
      title: '',
      poster: null,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isOwner = item.user_id === user?.id;
    const commentCount = getCommentsForPost(item.id).length;

    return (
      <View style={styles.threadPost}>
        {/* Header */}
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={() => handleUserPress(item.user_id)}>
            <UserAvatar
              avatarUrl={item.profile?.avatar_url}
              username={item.profile?.username || 'User'}
              size={40}
            />
          </TouchableOpacity>

          <View style={styles.threadHeaderText}>
            <TouchableOpacity onPress={() => handleUserPress(item.user_id)}>
              <Text style={[styles.threadUsername, { color: colors.text }]}>
                {item.profile?.full_name || item.profile?.username}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.threadTime, { color: colors.textTertiary }]}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>

          {isOwner && (
            <TouchableOpacity
              onPress={() => handlePostOptions(item)}
              style={styles.optionsButton}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.iconInactive} />
            </TouchableOpacity>
          )}
        </View>

        {/* Review */}
        <Text style={[styles.threadReview, { color: colors.text }]}>
          {item.review_text}
        </Text>

        {/* Rating */}
        {item.rating && (
          <View style={styles.threadRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating! ? 'star' : 'star-outline'}
                size={16}
                color="#FFD700"
              />
            ))}
            <Text style={styles.threadRatingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Media */}
        <TouchableOpacity
          style={styles.threadMedia}
          onPress={() => handleMediaPress(item)}
        >
          {item.media_poster ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w342${item.media_poster}` }}
              style={styles.threadPoster}
            />
          ) : (
            <View style={[styles.threadPosterPlaceholder, { backgroundColor: colors.card }]}>
              <Ionicons name="film-outline" size={24} color={colors.textTertiary} />
            </View>
          )}

          <View style={styles.threadMediaInfo}>
            <Text style={[styles.threadMediaTitle, { color: colors.text }]}>
              {item.media_title}
            </Text>

            <Text style={[styles.threadMediaType, { color: colors.textTertiary }]}>
              {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.threadActions}>
          <TouchableOpacity
            style={styles.threadActionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name={item.is_liked ? 'heart' : 'heart-outline'}
              size={20}
              color={item.is_liked ? '#FF6B6B' : colors.iconInactive}
            />

            {(item.like_count ?? 0) > 0 && (
              <Text
                style={[
                  styles.threadActionCount,
                  { color: item.is_liked ? '#FF6B6B' : colors.textTertiary },
                ]}
              >
                {item.like_count ?? 0}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.threadActionButton}
            onPress={() => handleComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.iconInactive} />

            {commentCount > 0 && (
              <Text style={[styles.threadActionCount, { color: colors.textTertiary }]}>
                {commentCount}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.threadActionButton}>
            <Ionicons name="paper-plane-outline" size={20} color={colors.iconInactive} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[styles.threadDivider, { backgroundColor: colors.border }]} />
      </View>
    );
  };

  const renderSearchResult = ({ item }: { item: Movie | TVShow }) => {
    const title = 'title' in item ? item.title : item.name;

    return (
      <TouchableOpacity
        style={[
          styles.searchResultCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        onPress={() => handleSelectMedia(item)}
      >
        {item.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }}
            style={styles.searchPoster}
          />
        ) : (
          <View style={[styles.searchPosterPlaceholder, { backgroundColor: colors.card }]} />
        )}

        <View style={styles.searchInfo}>
          <Text style={[styles.searchTitle, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.searchType, { color: colors.textSecondary }]}>
            {'title' in item ? 'Movie' : 'TV Show'}
          </Text>
        </View>

        <Ionicons name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Please login to view feed
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />

        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search movies, shows..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.searchResults}
        />
      ) : (
        <>
          {isLoading && posts.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.threadFeed}
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

                  <Text style={[styles.emptyFeedText, { color: colors.text }]}>
                    No posts yet
                  </Text>

                  <Text style={[styles.emptyFeedSubtext, { color: colors.textSecondary }]}>
                    Search for a movie above to create your first review!
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.createButton,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
        ]}
        onPress={handleCreatePost}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.fontSize.md },
  searchResults: { padding: spacing.md },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  searchPoster: { width: 40, height: 60, borderRadius: 6 },
  searchPosterPlaceholder: { width: 40, height: 60, borderRadius: 6 },
  searchInfo: { flex: 1, marginLeft: spacing.md },
  searchTitle: { fontSize: typography.fontSize.sm, fontWeight: '600' },
  searchType: { fontSize: typography.fontSize.xs },

  // Thread feed
  threadFeed: { paddingBottom: 100 },

  threadPost: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  threadHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionsButton: { padding: spacing.xs },
  threadUsername: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  threadTime: { fontSize: 14 },

  threadReview: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  threadRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  threadRatingText: { fontSize: 13, fontWeight: '600', color: '#FFD700', marginLeft: 4 },

  threadMedia: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  threadPoster: { width: 60, height: 90, borderRadius: 8 },
  threadPosterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadMediaInfo: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  threadMediaTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  threadMediaType: { fontSize: 12, fontWeight: '500' },

  threadActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  threadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  threadActionCount: { fontSize: 13, fontWeight: '500' },

  threadDivider: {
    height: 1,
    marginTop: spacing.lg,
    opacity: 0.3,
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.fontSize.md },

  emptyFeed: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyFeedEmoji: { fontSize: 64, marginBottom: spacing.lg },
  emptyFeedText: { fontSize: typography.fontSize.xl, fontWeight: '700', marginBottom: spacing.sm },
  emptyFeedSubtext: { fontSize: typography.fontSize.sm, textAlign: 'center', lineHeight: 20 },

  createButton: {
    position: 'absolute',
    bottom: 90,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.36,
    shadowRadius: 16,
    elevation: 12,
  },
});
