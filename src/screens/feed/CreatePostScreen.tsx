// src/screens/feed/CreatePostScreen.tsx - PHOTO-ONLY POSTS ENABLED

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, Movie, TVShow } from '../../types';
import { Film, ImageIcon, X } from 'lucide-react-native';
import { postsService } from '../../services/supabase/posts.service';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { imageUploadService } from '../../services/supabase/ImageUpload.service';
import { useAuthStore, usePostsStore } from '../../store';

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

  const { user } = useAuthStore();
  const { addPost, editPost } = usePostsStore();

  const [reviewText, setReviewText] = useState(existingText || '');
  const [rating, setRating] = useState<number>(existingRating || 0);
  const [loading, setLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  const [attachedMovie, setAttachedMovie] = useState(
    initialMovieId && initialMovieId > 0
      ? { id: initialMovieId, type: initialMediaType, title: initialTitle, poster: initialPoster }
      : null
  );

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
    setRating(0);
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      if (attachedImages.length >= 4) {
        Alert.alert('Limit reached', 'You can attach up to 4 images');
        return;
      }
      setAttachedImages([...attachedImages, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages(attachedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // CHANGED: Allow photo-only posts
    if (!user || (!reviewText.trim() && attachedImages.length === 0)) {
      Alert.alert('Empty post', 'Please add some text or photos');
      return;
    }

    try {
      setLoading(true);

      // Upload images if any
      let imageUrls: string[] = [];
      if (attachedImages.length > 0) {
        imageUrls = await imageUploadService.uploadMultipleImages(attachedImages, 'posts');
      }

      if (isEditMode && editPostId) {
        await editPost(editPostId, reviewText.trim(), rating > 0 ? rating : null);
      } else {
        if (attachedMovie) {
          const post = await postsService.createPost(
            user.id,
            attachedMovie.id,
            attachedMovie.type,
            attachedMovie.title,
            attachedMovie.poster,
            rating > 0 ? rating : null,
            reviewText.trim() || ' ', // Space if no text
            imageUrls
          );
          addPost(post);
        } else {
          // Photo-only or text-only post
          const post = await postsService.createPost(
            user.id,
            0,
            'movie',
            'General Post',
            null,
            null,
            reviewText.trim() || ' ', // Space if photo-only
            imageUrls
          );
          addPost(post);
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // CHANGED: Can post with just text OR just photos
  const canPost = reviewText.trim().length > 0 || attachedImages.length > 0;
  const charCount = reviewText.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canPost || loading}
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.postBtnText}>
                {isEditMode ? 'Save' : 'Post'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.composer}>
            <Image
              source={{
                uri:
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=A78BFA&color=000`,
              }}
              style={styles.avatar}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="What's on your mind about movies?"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                autoFocus
                maxLength={500}
              />
              {charCount > 0 && <Text style={styles.charCount}>{charCount}/500</Text>}
            </View>
          </View>

          {attachedImages.length > 0 && (
            <View style={styles.imagesGrid}>
              {attachedImages.map((uri, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri }} style={styles.attachedImage} />
                  <TouchableOpacity onPress={() => handleRemoveImage(index)} style={styles.removeImageBtn}>
                    <X size={14} color="#FFFFFF" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {attachedMovie && (
            <View style={styles.attachedSection}>
              <View style={styles.attachedCard}>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w200${attachedMovie.poster}` }}
                  style={styles.attachedPoster}
                  resizeMode="cover"
                />

                <View style={styles.attachedInfo}>
                  <Text style={styles.attachedTitle} numberOfLines={2}>
                    {attachedMovie.title}
                  </Text>
                  <Text style={styles.attachedType}>
                    {attachedMovie.type === 'movie' ? 'Movie' : 'TV Show'}
                  </Text>

                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      >
                        <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity onPress={handleRemoveMovie} style={styles.removeBtn}>
                  <X size={16} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSearch(true)} activeOpacity={0.7}>
              <View style={styles.actionIcon}>
                <Film size={22} color="#A78BFA" strokeWidth={2} />
              </View>
              <Text style={styles.actionLabel}>Add Movie or Show</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleAddPhoto} activeOpacity={0.7}>
              <View style={styles.actionIcon}>
                <ImageIcon size={22} color="#A78BFA" strokeWidth={2} />
              </View>
              <Text style={styles.actionLabel}>Add Photo ({attachedImages.length}/4)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showSearch && (
          <View style={styles.searchModal}>
            <View style={styles.searchHeader}>
              <View style={styles.searchBar}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search movies & shows..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>
              <TouchableOpacity onPress={() => setShowSearch(false)} style={styles.closeBtn}>
                <X size={24} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              renderItem={({ item }) => {
                const title = 'title' in item ? item.title : item.name;
                return (
                  <TouchableOpacity style={styles.searchResult} onPress={() => handleAttachMovie(item)} activeOpacity={0.7}>
                    {item.poster_path ? (
                      <Image source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }} style={styles.resultPoster} />
                    ) : (
                      <View style={styles.resultPosterPlaceholder}>
                        <Film size={20} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
                      </View>
                    )}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle} numberOfLines={2}>{title}</Text>
                      <Text style={styles.resultType}>{'title' in item ? 'Movie' : 'TV Show'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.searchResults}
              ListEmptyComponent={
                searchQuery.length > 2 ? (
                  <View style={styles.searchEmpty}>
                    <Text style={styles.searchEmptyText}>No results found</Text>
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  keyboardView: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cancelBtn: { padding: 8 },
  cancelText: { fontSize: 17, fontWeight: '400', color: '#FFFFFF' },
  postBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24, backgroundColor: '#A78BFA', minWidth: 80 },
  postBtnDisabled: { opacity: 0.3 },
  postBtnText: { fontSize: 16, fontWeight: '600', color: '#000000', letterSpacing: 0.2 },

  content: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  inputContainer: { flex: 1 },
  input: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 12,
    textAlign: 'right',
  },

  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  imageItem: {
    position: 'relative',
  },
  attachedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  attachedSection: { paddingHorizontal: 16, marginTop: 20 },
  attachedCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  attachedPoster: { width: 70, height: 105, borderRadius: 10 },
  attachedInfo: { flex: 1, justifyContent: 'center', gap: 6 },
  attachedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  attachedType: { fontSize: 13, fontWeight: '400', color: 'rgba(255,255,255,0.5)' },
  ratingRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  star: { fontSize: 22, color: '#FFD700' },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  actions: { paddingHorizontal: 16, marginTop: 24, gap: 0 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167,139,250,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', letterSpacing: -0.2 },

  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : (StatusBar.currentHeight || 0) + 8,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#1E1E20',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  searchInput: { fontSize: 16, color: '#FFFFFF', padding: 0 },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchResults: { padding: 16 },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  resultPoster: { width: 45, height: 68, borderRadius: 8 },
  resultPosterPlaceholder: {
    width: 45,
    height: 68,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: { flex: 1 },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  resultType: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  searchEmpty: { paddingVertical: 60, alignItems: 'center' },
  searchEmptyText: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
});