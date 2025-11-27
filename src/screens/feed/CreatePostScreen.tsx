import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';
import { postsService } from '../../services/supabase/posts.service';
import { useAuthStore, usePostsStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

export const CreatePostScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movieId, mediaType, title, poster } = route.params;
  const { user } = useAuthStore();
  const { addPost } = usePostsStore();
  
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reviewText.trim()) {
      return;
    }

    try {
      setLoading(true);
      
      const post = await postsService.createPost(
        user.id,
        movieId,
        mediaType,
        title,
        poster,
        rating > 0 ? rating : null,
        reviewText.trim()
      );
      
      addPost(post);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Movie/Show Card */}
        <View style={styles.mediaCard}>
          {poster ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w185${poster}` }}
              style={styles.mediaPoster}
            />
          ) : (
            <View style={styles.mediaPosterPlaceholder} />
          )}
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.mediaType}>
              {mediaType === 'movie' ? 'Movie' : 'TV Show'}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.label}>Your Rating (Optional)</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#FFD700' : colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={styles.label}>Your Review</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What did you think? Share your thoughts..."
            placeholderTextColor={colors.textTertiary}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{reviewText.length}/500</Text>
        </View>

        {/* Submit Button */}
        <Button
          title="Post Review"
          onPress={handleSubmit}
          loading={loading}
          disabled={!reviewText.trim()}
          variant="primary"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  mediaCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  mediaPoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  mediaPosterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  mediaTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  mediaType: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  ratingSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reviewSection: {
    marginBottom: spacing.xl,
  },
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});