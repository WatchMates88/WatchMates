import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Movie, TVShow } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../../theme';
import { postsService } from '../../services/supabase/posts.service';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { useAuthStore, usePostsStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

export const CreatePostScreen: React.FC<Props> = ({ route, navigation }) => {
  const { 
    movieId: initialMovieId, 
    mediaType: initialMediaType, 
    title: initialTitle, 
    poster: initialPoster,
    editPostId,
    existingText,
    existingRating,
  } = route.params;
  
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { addPost, editPost } = usePostsStore();
  
  const [reviewText, setReviewText] = useState(existingText || '');
  const [rating, setRating] = useState<number>(existingRating || 0);
  const [loading, setLoading] = useState(false);
  
  // Movie attachment state
  const [attachedMovie, setAttachedMovie] = useState(
    initialMovieId && initialMovieId > 0 
      ? { id: initialMovieId, type: initialMediaType, title: initialTitle, poster: initialPoster }
      : null
  );
  
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);

  const isEditMode = !!editPostId;

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (text.length > 2) {
      try {
        const [movies, shows] = await Promise.all([
          tmdbService.searchMovies(text),
          tmdbService.searchTVShows(text),
        ]);
        setSearchResults([...movies, ...shows]);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAttachMovie = (item: Movie | TVShow) => {
    const title = 'title' in item ? item.title : item.name;
    const mediaType = 'title' in item ? 'movie' : 'tv';
    
    setAttachedMovie({
      id: item.id,
      type: mediaType,
      title,
      poster: item.poster_path,
    });
    
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMovie = () => {
    setAttachedMovie(null);
  };

  const handleSubmit = async () => {
    if (!user || !reviewText.trim() || !attachedMovie) {
      return;
    }

    try {
      setLoading(true);
      
      if (isEditMode && editPostId) {
        // Edit existing post
        await editPost(editPostId, reviewText.trim(), rating > 0 ? rating : null);
      } else {
        // Create new post
        const post = await postsService.createPost(
          user.id,
          attachedMovie.id,
          attachedMovie.type,
          attachedMovie.title,
          attachedMovie.poster,
          rating > 0 ? rating : null,
          reviewText.trim()
        );
        
        addPost(post);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving post:', error);
      alert(isEditMode ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const canPost = reviewText.trim().length > 0 && attachedMovie !== null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header - Threads style */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerCancel, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={!canPost || loading}
          style={[
            styles.headerPost,
            { backgroundColor: canPost ? colors.primary : colors.backgroundTertiary }
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.headerPostText, { color: canPost ? '#FFFFFF' : colors.textTertiary }]}>
            {loading ? (isEditMode ? 'Saving...' : 'Posting...') : (isEditMode ? 'Save' : 'Post')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.full_name || user?.username}
          </Text>
        </View>

        {/* Review Text - Threads style (no label, just placeholder) */}
        <TextInput
          style={[styles.threadInput, { color: colors.text }]}
          placeholder="What's on your mind about movies?"
          placeholderTextColor={colors.textTertiary}
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          maxLength={500}
          autoFocus
        />

        {/* Attached Movie Preview */}
        {attachedMovie && (
          <View style={[styles.attachedMovie, {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.cardBorder,
          }]}>
            <View style={styles.attachedMovieContent}>
              {attachedMovie.poster ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w92${attachedMovie.poster}` }}
                  style={styles.attachedPoster}
                />
              ) : (
                <View style={[styles.attachedPosterPlaceholder, { backgroundColor: colors.backgroundTertiary }]} />
              )}
              <View style={styles.attachedInfo}>
                <Text style={[styles.attachedTitle, { color: colors.text }]} numberOfLines={2}>
                  {attachedMovie.title}
                </Text>
                <Text style={[styles.attachedType, { color: colors.textTertiary }]}>
                  {attachedMovie.type === 'movie' ? 'Movie' : 'TV Show'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveMovie} style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Rating - Inline */}
        {attachedMovie && (
          <View style={styles.inlineRating}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Rate it:</Text>
            <View style={styles.inlineStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= rating ? '#FFD700' : colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Attach Movie Button */}
        {!attachedMovie && (
          <TouchableOpacity 
            style={[styles.attachButton, {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.cardBorder,
            }]}
            onPress={() => setShowSearch(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="film-outline" size={20} color={colors.primary} />
            <Text style={[styles.attachButtonText, { color: colors.primary }]}>
              Attach Movie or Show
            </Text>
          </TouchableOpacity>
        )}

        {/* Movie Search Modal (Threads style) */}
        {showSearch && (
          <View style={[styles.searchModal, { backgroundColor: colors.background }]}>
            <View style={[styles.searchHeader, { borderBottomColor: colors.border }]}>
              <TextInput
                style={[styles.searchInput, { 
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                }]}
                placeholder="Search movies & shows..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowSearch(false)} style={styles.searchClose}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              renderItem={({ item }) => {
                const title = 'title' in item ? item.title : item.name;
                return (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleAttachMovie(item)}
                    activeOpacity={0.7}
                  >
                    {item.poster_path ? (
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }}
                        style={styles.searchResultPoster}
                      />
                    ) : (
                      <View style={[styles.searchResultPosterPlaceholder, { backgroundColor: colors.backgroundTertiary }]} />
                    )}
                    <View style={styles.searchResultInfo}>
                      <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={[styles.searchResultType, { color: colors.textSecondary }]}>
                        {'title' in item ? 'Movie' : 'TV Show'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.searchResultsList}
              ListEmptyComponent={
                searchQuery.length > 2 ? (
                  <View style={styles.searchEmpty}>
                    <Text style={[styles.searchEmptyText, { color: colors.textSecondary }]}>
                      No results found
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header - Threads style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerCancel: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerPost: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  headerPostText: {
    fontSize: 15,
    fontWeight: '700',
  },
  
  scrollContent: {
    padding: spacing.lg,
  },
  
  // User section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Threads-style input (minimal, no border)
  threadInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    marginBottom: spacing.lg,
    paddingTop: 0,
  },
  
  // Attached movie preview
  attachedMovie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  attachedMovieContent: {
    flexDirection: 'row',
    flex: 1,
  },
  attachedPoster: {
    width: 50,
    height: 75,
    borderRadius: 8,
  },
  attachedPosterPlaceholder: {
    width: 50,
    height: 75,
    borderRadius: 8,
  },
  attachedInfo: {
    marginLeft: spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  attachedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  attachedType: {
    fontSize: 12,
  },
  removeButton: {
    padding: spacing.xs,
  },
  
  // Inline rating
  inlineRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  inlineStars: {
    flexDirection: 'row',
    gap: 6,
  },
  
  // Attach button
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 16,
    gap: spacing.sm,
    borderWidth: 1,
  },
  attachButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Search modal
  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  searchClose: {
    padding: spacing.xs,
  },
  searchResultsList: {
    padding: spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  searchResultPoster: {
    width: 40,
    height: 60,
    borderRadius: 6,
  },
  searchResultPosterPlaceholder: {
    width: 40,
    height: 60,
    borderRadius: 6,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultType: {
    fontSize: 13,
  },
  searchEmpty: {
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  searchEmptyText: {
    fontSize: 14,
  },
});