import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommentItem } from './CommentItem';
import { Comment } from '../../types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useCommentsStore } from '../../store';
import { commentsService } from '../../services/supabase/comments.service';

interface CommentsSheetProps {
  visible: boolean;
  postId: string;
  currentUserId: string;
  onClose: () => void;
  onUserPress: (userId: string) => void;
}

export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  visible,
  postId,
  currentUserId,
  onClose,
  onUserPress,
}) => {
  const { colors } = useTheme();
  const { getCommentsForPost, fetchComments, addComment, removeComment, updateComment, toggleCommentLike } = useCommentsStore();
  
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const comments = getCommentsForPost(postId);

  useEffect(() => {
    if (visible && postId && currentUserId) {
      loadComments();
    }
  }, [visible, postId, currentUserId]);

  const loadComments = async () => {
    if (!postId || !currentUserId) return;
    await fetchComments(postId, currentUserId);
  };

  const handleSubmit = async () => {
    if (!commentText.trim() || !postId || !currentUserId) return;

    try {
      setPosting(true);

      if (editingComment) {
        await commentsService.updateComment(editingComment.id, commentText.trim());
        updateComment(editingComment.id, commentText.trim());
        setEditingComment(null);
      } else {
        const newComment = await commentsService.createComment(
          currentUserId,
          postId,
          commentText.trim(),
          replyingTo?.id
        );
        
        addComment({ ...newComment, like_count: 0, is_liked: false });
      }

      setCommentText('');
      setReplyingTo(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    await toggleCommentLike(postId, commentId, currentUserId);
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
    inputRef.current?.focus();
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setCommentText(comment.comment_text);
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentsService.deleteComment(commentId);
      removeComment(postId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const cancelReplyOrEdit = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setCommentText('');
  };

  // Organize comments with replies
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);

  const renderComment = ({ item }: { item: Comment }) => {
    const replies = comments.filter((c) => c.parent_comment_id === item.id);

    return (
      <>
        <CommentItem
          comment={item}
          currentUserId={currentUserId}
          onLike={handleLike}
          onReply={handleReply}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onUserPress={onUserPress}
        />
        {/* Render replies */}
        {replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            currentUserId={currentUserId}
            onLike={handleLike}
            onReply={handleReply}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onUserPress={onUserPress}
            isReply
          />
        ))}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerHandle, { backgroundColor: colors.textTertiary }]} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.headerClose}>
            <Ionicons name="close" size={28} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <FlatList
          data={topLevelComments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No comments yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Be the first to comment!
              </Text>
            </View>
          }
        />

        {/* Reply/Edit Banner */}
        {(replyingTo || editingComment) && (
          <View style={[styles.replyBanner, { 
            backgroundColor: colors.backgroundSecondary,
            borderTopColor: colors.border,
          }]}>
            <Text style={[styles.replyText, { color: colors.textSecondary }]}>
              {editingComment 
                ? 'Editing comment' 
                : `Replying to @${replyingTo?.profile?.username}`}
            </Text>
            <TouchableOpacity onPress={cancelReplyOrEdit}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input - Threads style */}
        <View style={[styles.inputContainer, { 
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              color: colors.text,
            }]}
            placeholder={
              editingComment 
                ? 'Edit your comment...' 
                : replyingTo 
                  ? `Reply to ${replyingTo.profile?.username}...`
                  : 'Add a comment...'
            }
            placeholderTextColor={colors.textTertiary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { 
              backgroundColor: commentText.trim() ? colors.primary : colors.backgroundTertiary 
            }]}
            onPress={handleSubmit}
            disabled={!commentText.trim() || posting}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={commentText.trim() ? '#FFFFFF' : colors.textTertiary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerLeft: {
    position: 'absolute',
    top: spacing.xs,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  headerClose: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.lg,
  },
  
  // Comments list
  commentsList: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  
  // Empty state
  emptyComments: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
  },
  
  // Reply banner
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  replyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});