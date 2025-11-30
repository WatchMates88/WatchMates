import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserAvatar } from '../user/UserAvatar';
import { Comment } from '../../types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

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

export const CommentItem: React.FC<CommentItemProps> = ({
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

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  };

  const handleLongPress = () => {
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
  };

  const isOwner = comment.user_id === currentUserId;

  return (
    <View style={[styles.container, isReply && styles.replyIndent]}>
      {/* Left side - Avatar with reply line */}
      <View style={styles.leftSide}>
        <TouchableOpacity onPress={() => onUserPress(comment.user_id)} activeOpacity={0.7}>
          <UserAvatar
            avatarUrl={comment.profile?.avatar_url}
            username={comment.profile?.username || 'User'}
            size={isReply ? 28 : 32}
          />
        </TouchableOpacity>
      </View>

      {/* Right side - Content */}
      <View style={styles.rightSide}>
        {/* Header: Username + Time */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onUserPress(comment.user_id)} activeOpacity={0.7}>
            <Text style={[styles.username, { color: colors.text }]}>
              {comment.profile?.username || 'User'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatTimeAgo(comment.created_at)}
          </Text>
          {comment.updated_at !== comment.created_at && (
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

        {/* Actions: Like + Reply */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onLike(comment.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={comment.is_liked ? 'heart' : 'heart-outline'}
              size={16}
              color={comment.is_liked ? '#FF6B6B' : colors.iconInactive}
            />
            {(comment.like_count || 0) > 0 && (
              <Text style={[styles.actionCount, { 
                color: comment.is_liked ? '#FF6B6B' : colors.textTertiary 
              }]}>
                {comment.like_count}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onReply(comment)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-undo-outline" size={16} color={colors.iconInactive} />
            <Text style={[styles.actionText, { color: colors.textTertiary }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  replyIndent: {
    paddingLeft: spacing.xxl,
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
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});