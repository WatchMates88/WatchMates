// src/components/reviews/ReviewCard.tsx
// Updated: Cleaner colors, smaller TMDB badge, dynamic card background

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Star, Heart } from 'lucide-react-native';
import { UnifiedReview } from '../../types/review.types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReviewCardProps {
  review: UnifiedReview;
  onLike?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onLike }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Convert rating to /10 if from WatchMates (/5)
  const displayRating = review.rating 
    ? review.source === 'watchmates' 
      ? (review.rating * 2).toFixed(1)
      : review.rating.toFixed(1)
    : null;

  // Dynamic background based on source
  const cardBackground = review.source === 'tmdb' ? '#0F0D14' : '#13121A';

  return (
    <View style={[styles.container, { backgroundColor: cardBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar */}
        {review.authorAvatar ? (
          <Image source={{ uri: review.authorAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {review.author.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Author Info */}
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{review.author}</Text>
            {review.source === 'tmdb' && (
              <View style={styles.tmdbBadge}>
                <Text style={styles.badgeText}>TMDB</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
            {displayRating && (
              <>
                <Text style={styles.separator}>•</Text>
                <Star size={11} color="#A78BFA" fill="#A78BFA" />
                <Text style={styles.rating}>{displayRating}/10</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Review Content */}
      <Text 
        style={styles.content}
        numberOfLines={expanded ? undefined : 3}
        ellipsizeMode="tail"
      >
        {review.content}
      </Text>
      
      {/* Read More/Less Button */}
      {review.content.length > 120 && (
        <TouchableOpacity 
          onPress={handleToggleExpand}
          activeOpacity={0.7}
          accessibilityLabel={expanded ? "Collapse review" : "Expand review"}
          accessibilityRole="button"
        >
          <Text style={styles.readMore}>
            {expanded ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Footer (WatchMates only) */}
      {review.source === 'watchmates' && onLike && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={onLike}
            activeOpacity={0.7}
            accessibilityLabel={review.isLiked ? "Unlike review" : "Like review"}
            accessibilityRole="button"
          >
            <Heart
              size={18}
              color={review.isLiked ? '#EF4444' : '#6E6A80'}
              fill={review.isLiked ? '#EF4444' : 'transparent'}
            />
            {review.likeCount! > 0 && (
              <Text style={[styles.likeCount, review.isLiked && styles.likeCountActive]}>
                {review.likeCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor is dynamic (set in component)
    borderRadius: 12, // Reduced from 18
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16, // Reduced from 20
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#1B1727',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700', // Increased from 600
    letterSpacing: -0.3,
    marginRight: 6,
  },
  tmdbBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 2,   // Reduced from 3
    borderRadius: 4,      // Reduced from 6
  },
  badgeText: {
    color: 'rgba(255, 255, 255, 0.50)',
    fontSize: 9,  // Reduced from 10
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
  separator: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginHorizontal: 6,
  },
  rating: {
    color: '#B9B4C8',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 3,
  },
  content: {
    color: 'rgba(255, 255, 255, 0.85)', // Slightly dimmed
    fontSize: 15,
    lineHeight: 22,
  },
  readMore: {
    color: 'rgba(255, 255, 255, 0.60)', // White-gray, not purple!
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#6E6A80',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  likeCountActive: {
    color: '#EF4444',
  },
});