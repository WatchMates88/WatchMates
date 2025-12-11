import React, { useState, memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';
import { UserAvatar } from '../user/UserAvatar';
import { Comment } from '../../types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.6; // Smaller for comments (60% instead of 75%)

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onLike: (commentId: string) => void;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onEdit: (comment: Comment) => void;
  onUserPress: (userId: string) => void;
  isReply?: boolean;
}

const CommentItemComponent: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onLike,
  onReply,
  onDelete,
  onEdit,
  onUserPress,
  isReply = false,
}) => {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  }, []);

  const handleLongPress = useCallback(() => {
    if (comment.user_id === currentUserId) {
      Alert.alert(
        'Comment Options',
        '',
        [
          {
            text: 'Edit',
            onPress: () => onEdit(comment),
          },
          {
            text: 'Delete',
            onPress: () => {
              Alert.alert(
                'Delete Comment',
                'Are you sure you want to delete this comment?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => onDelete(comment.id),
                  },
                ]
              );
            },
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  }, [comment, currentUserId, onEdit, onDelete]);

  const handleLike = useCallback(() => {
    onLike(comment.id);
  }, [comment.id, onLike]);

  const handleReply = useCallback(() => {
    onReply(comment);
  }, [comment, onReply]);

  const handleUserPress = useCallback(() => {
    onUserPress(comment.user_id);
  }, [comment.user_id, onUserPress]);

  const isOwner = comment.user_id === currentUserId;
  const isEdited = comment.updated_at !== comment.created_at;

  return (
    <View style={[styles.container, isReply && styles.replyIndent]}>
      {/* Left side - Avatar */}
      <View style={styles.leftSide}>
        <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
          <UserAvatar
            avatarUrl={comment.profile?.avatar_url}
            username={comment.profile?.username || 'User'}
            size={isReply ? 28 : 34}
          />
        </TouchableOpacity>
      </View>

      {/* Right side - Content */}
      <View style={styles.rightSide}>
        {/* Header: Username + Time */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
            <Text style={[styles.username, { color: colors.text }]}>
              {comment.profile?.username || 'User'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatTimeAgo(comment.created_at)}
          </Text>
          {isEdited && (
            <Text style={[styles.edited, { color: colors.textTertiary }]}>• edited</Text>
          )}
        </View>

        {/* Comment Text */}
        <TouchableOpacity 
          onLongPress={handleLongPress}
          activeOpacity={1}
        >
          <Text style={[styles.text, { color: colors.text }]}>
            {comment.comment_text}
          </Text>
        </TouchableOpacity>

        {/* Comment Images - THREADS ASPECT RATIO */}
        {comment.images && comment.images.length > 0 && (
          <Image
            source={{ uri: comment.images[0] }}
            style={styles.commentImage}
            resizeMode="cover"
          />
        )}

        {/* Actions: Like + Reply - RED LIKE BUTTON */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Heart
              size={16}
              color={comment.is_liked ? colors.likeRed : colors.iconInactive}
              fill={comment.is_liked ? colors.likeRed : 'none'}
              strokeWidth={1.8}
            />
            {(comment.like_count || 0) > 0 && (
              <Text style={[styles.actionCount, { 
                color: comment.is_liked ? colors.likeRed : colors.textTertiary 
              }]}>
                {comment.like_count}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleReply}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: colors.textTertiary }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ✅ MEMOIZE with custom comparison
export const CommentItem = memo(CommentItemComponent, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.is_liked === nextProps.comment.is_liked &&
    prevProps.comment.like_count === nextProps.comment.like_count &&
    prevProps.comment.comment_text === nextProps.comment.comment_text &&
    prevProps.comment.updated_at === nextProps.comment.updated_at &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.isReply === nextProps.isReply
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  replyIndent: {
    paddingLeft: spacing.xl + spacing.md,
  },
  leftSide: {
    marginRight: spacing.md,
  },
  rightSide: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 13,
    fontWeight: '400',
  },
  edited: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  commentImage: {
    width: IMAGE_WIDTH,
    aspectRatio: 4/5, // Threads-style portrait aspect ratio
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});