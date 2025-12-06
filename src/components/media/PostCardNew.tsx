// src/components/media/PostCardNew.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react-native';
import { designTokens } from '../../theme/tokens';

interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      handle: string;
      avatar: string;
    };
    content: string;
    movie?: {
      title: string;
      year: string;
      poster: string;
      genre: string;
    };
    timestamp: string;
    stats: {
      likes: number;
      comments: number;
      shares: number;
    };
    isLiked: boolean;
    isBookmarked: boolean;
  };
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export const PostCardNew: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  onBookmark,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const likeScale = new Animated.Value(1);

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    onLike?.();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.author.name}</Text>
          <Text style={styles.handle}>@{post.author.handle}</Text>
        </View>
        
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Movie Card */}
      {post.movie && (
        <View style={styles.movieCard}>
          <Image
            source={{ uri: post.movie.poster }}
            style={styles.moviePoster}
            resizeMode="cover"
          />
          <View style={styles.movieOverlay}>
            <Text style={styles.movieTitle}>{post.movie.title}</Text>
            <Text style={styles.movieMeta}>
              {post.movie.year} • {post.movie.genre}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Heart
              size={designTokens.icons.sizes.md}
              color={isLiked ? designTokens.colors.interactive.like : designTokens.colors.text.tertiary}
              fill={isLiked ? designTokens.colors.interactive.like : 'none'}
              strokeWidth={designTokens.icons.strokeWidth}
            />
          </Animated.View>
          {post.stats.likes > 0 && (
            <Text style={[styles.actionCount, isLiked && styles.actionCountActive]}>
              {formatCount(post.stats.likes)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onComment}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <MessageCircle
            size={designTokens.icons.sizes.md}
            color={designTokens.colors.text.tertiary}
            strokeWidth={designTokens.icons.strokeWidth}
          />
          {post.stats.comments > 0 && (
            <Text style={styles.actionCount}>
              {formatCount(post.stats.comments)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShare}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Share2
            size={designTokens.icons.sizes.md}
            color={designTokens.colors.text.tertiary}
            strokeWidth={designTokens.icons.strokeWidth}
          />
          {post.stats.shares > 0 && (
            <Text style={styles.actionCount}>
              {formatCount(post.stats.shares)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBookmark}
          style={[styles.actionButton, styles.bookmarkButton]}
          activeOpacity={0.7}
        >
          <Bookmark
            size={designTokens.icons.sizes.md}
            color={isBookmarked ? designTokens.colors.interactive.bookmark : designTokens.colors.text.tertiary}
            fill={isBookmarked ? designTokens.colors.interactive.bookmark : 'none'}
            strokeWidth={designTokens.icons.strokeWidth}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background.primary,
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.lg,
    borderBottomWidth: designTokens.layout.postCard.dividerHeight,
    borderBottomColor: designTokens.colors.surface.border,
  },
  containerPressed: {
    opacity: 0.7,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  avatar: {
    width: designTokens.layout.postCard.avatarSize,
    height: designTokens.layout.postCard.avatarSize,
    borderRadius: designTokens.layout.postCard.avatarSize / 2,
    marginRight: designTokens.layout.postCard.avatarToText,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...designTokens.typography.scale.title3,
    color: designTokens.colors.text.primary,
    marginBottom: 2,
  },
  handle: {
    ...designTokens.typography.scale.caption,
    color: designTokens.colors.text.tertiary,
  },
  timestamp: {
    ...designTokens.typography.scale.caption,
    color: designTokens.colors.text.tertiary,
    marginLeft: 'auto',
  },
  
  content: {
    ...designTokens.typography.scale.body,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.lg,
  },
  
  movieCard: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.background.tertiary,
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  movieOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: designTokens.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  movieTitle: {
    ...designTokens.typography.scale.title3,
    color: designTokens.colors.text.primary,
    marginBottom: 4,
  },
  movieMeta: {
    ...designTokens.typography.scale.caption,
    color: designTokens.colors.text.secondary,
  },
  
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.layout.postCard.actionsGap,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: designTokens.spacing.sm,
    marginLeft: -designTokens.spacing.sm,
  },
  bookmarkButton: {
    marginLeft: 'auto',
  },
  actionCount: {
    ...designTokens.typography.scale.caption,
    color: designTokens.colors.text.tertiary,
  },
  actionCountActive: {
    color: designTokens.colors.interactive.like,
  },
});