// src/screens/feed/FeedScreen.tsx
// Fully optimized with memoized callbacks and FlatList optimizations

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedPost } from '../../components/social/FeedPost';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { usePostsStore, useAuthStore } from '../../store';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { Post, Movie, TVShow } from '../../types';

type Props = {
  navigation: any;
};

export const FeedScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { posts, isLoading, fetchFeed, toggleLike, deletePostById } = usePostsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);

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

  // ✅ MEMOIZED: Prevents function recreation on every render
  const handleLike = useCallback(async (postId: string) => {
    if (!user) return;
    await toggleLike(postId, user.id);
  }, [user, toggleLike]);

  // ✅ MEMOIZED: Navigation callbacks
  const handleComment = useCallback((postId: string) => {
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  const handleUserPress = useCallback((userId: string) => {
    if (userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else {
      navigation.navigate('FriendProfile', { userId });
    }
  }, [navigation, user?.id]);

  const handleMediaPress = useCallback((post: Post) => {
    if (post.media_id && post.media_id > 0) {
      if (post.media_type === 'movie') {
        navigation.navigate('MovieDetail', { movieId: post.media_id });
      } else {
        navigation.navigate('ShowDetail', { showId: post.media_id });
      }
    }
  }, [navigation]);

  const handleImagePress = useCallback((post: Post, index: number) => {
    if (post.images && post.images.length > 0) {
      navigation.navigate('FullScreenImageViewer', {
        images: post.images,
        index,
      });
    }
  }, [navigation]);

  const handlePostOptions = useCallback((post: Post) => {
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
          Alert.alert('Delete Post', 'Are you sure?', [
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
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [navigation, deletePostById]);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      const [movies, shows] = await Promise.all([
        tmdbService.searchMovies(text),
        tmdbService.searchTVShows(text),
      ]);
      setSearchResults([...movies, ...shows]);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectMedia = useCallback((item: Movie | TVShow) => {
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
  }, [navigation]);

  const handleCreatePost = useCallback(() => {
    navigation.navigate('CreatePost', {
      movieId: 0,
      mediaType: 'movie',
      title: '',
      poster: null,
    });
  }, [navigation]);

  const handleFindFriends = useCallback(() => {
    navigation.navigate('SearchUsers');
  }, [navigation]);

  // ✅ MEMOIZED: Render functions
  const renderPost = useCallback(({ item }: { item: Post }) => (
    <FeedPost
      post={item}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item.id)}
      onUserPress={() => handleUserPress(item.user_id)}
      onMediaPress={() => handleMediaPress(item)}
      onImagePress={(index) => handleImagePress(item, index)}
      onOptions={() => handlePostOptions(item)}
      commentCount={item.comment_count || 0}
      isOwnPost={item.user_id === user?.id}
    />
  ), [handleLike, handleComment, handleUserPress, handleMediaPress, handleImagePress, handlePostOptions, user?.id]);

  const renderSearchResult = useCallback(({ item }: { item: Movie | TVShow }) => {
    const title = 'title' in item ? item.title : item.name;
    return (
      <TouchableOpacity style={styles.searchCard} onPress={() => handleSelectMedia(item)}>
        {item.poster_path ? (
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }} 
            style={styles.searchPoster} 
          />
        ) : (
          <View style={styles.searchPosterPlaceholder} />
        )}
        <View style={styles.searchInfo}>
          <Text style={styles.searchTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.searchType}>
            {'title' in item ? 'Movie' : 'TV Show'}
          </Text>
        </View>
        <Ionicons name="add-circle" size={22} color="#A78BFA" />
      </TouchableOpacity>
    );
  }, [handleSelectMedia]);

  const renderEmptyState = useCallback(() => (
    <EmptyState
      type="feed"
      onAction={handleFindFriends}
    />
  ), [handleFindFriends]);

  // ✅ KEY EXTRACTOR: Prevents re-renders
  const keyExtractor = useCallback((item: Post) => item.id, []);
  const searchKeyExtractor = useCallback((item: Movie | TVShow) => item.id.toString(), []);

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <EmptyState
          type="feed"
          title="Please login to view feed"
          message="Sign in to see posts from movie lovers you follow"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies, shows..."
          placeholderTextColor="rgba(255,255,255,0.55)"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={searchKeyExtractor}
          contentContainerStyle={styles.searchList}
          // ✅ PERFORMANCE OPTIMIZATIONS
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={21}
        />
      ) : (
        <>
          {isLoading && posts.length === 0 ? (
            <SkeletonLoader type="post" count={5} />
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.feedList}
              showsVerticalScrollIndicator={false}
              
              // ✅ CRITICAL PERFORMANCE OPTIMIZATIONS
              removeClippedSubviews={true}        // Unmount off-screen items
              maxToRenderPerBatch={10}            // Render 10 items per batch
              updateCellsBatchingPeriod={50}      // Update every 50ms
              windowSize={21}                     // Keep 21 screens in memory
              initialNumToRender={5}              // Render 5 items initially
              
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={handleRefresh} 
                  tintColor="#A78BFA" 
                  colors={['#A78BFA']} 
                />
              }
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreatePost} activeOpacity={0.85}>
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#1E1E20',
    borderRadius: 22,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },

  feedList: {
    paddingBottom: 120,
  },

  searchList: {
    padding: 16,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  searchPoster: {
    width: 36,
    height: 54,
    borderRadius: 4,
  },
  searchPosterPlaceholder: {
    width: 36,
    height: 54,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  searchInfo: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  searchType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  fab: {
    position: 'absolute',
    bottom: 98,
    right: 22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
});