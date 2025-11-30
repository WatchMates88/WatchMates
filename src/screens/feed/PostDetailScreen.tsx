import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Post, Comment } from '../../types';
import { UserAvatar } from '../../components/user/UserAvatar';
import { spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { usePostsStore, useAuthStore, useCommentsStore } from '../../store';
import { commentsService } from '../../services/supabase/comments.service';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export const PostDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { posts, toggleLike, deletePostById } = usePostsStore();
  const { 
    getCommentsForPost, 
    fetchComments, 
    addComment, 
    updateComment: updateCommentInStore,
    removeComment, 
    toggleCommentLike 
  } = useCommentsStore();

  const post = posts.find((p) => p.id === postId);
  const comments = getCommentsForPost(postId);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [posting, setPosting] = useState(false);
  const [showPostActions, setShowPostActions] = useState(false);
  const [showCommentActions, setShowCommentActions] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const inputRef = useRef<TextInput>(null);
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user && postId) {
      fetchComments(postId, user.id);
    }
  }, [postId, user]);

  // Helper functions
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

  const cancelContext = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setCommentText('');
  };

  // Handlers
  const handleUserPress = (userId: string) => {
    if (userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' } as any);
    } else {
      navigation.navigate('FriendProfile', { userId });
    }
  };

  const handleLikePost = async () => {
    if (!user || !post) return;

    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    await toggleLike(postId, user.id);
  };

  const handlePostOptions = () => {
    setShowPostActions(true);
  };

  const handleEditPost = () => {
    if (!post) return;
    setShowPostActions(false);
    
    navigation.navigate('CreatePost', {
      movieId: post.media_id,
      mediaType: post.media_type,
      title: post.media_title,
      poster: post.media_poster,
      editPostId: post.id,
      existingText: post.review_text,
      existingRating: post.rating,
    });
  };

  const handleDeletePost = () => {
    setShowPostActions(false);
    
    Alert.alert(
      'Delete Post',
      'This post will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostById(postId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      setPosting(true);

      if (editingComment) {
        await commentsService.updateComment(editingComment.id, commentText.trim());
        updateCommentInStore(editingComment.id, commentText.trim());
        setEditingComment(null);
      } else {
        const newComment = await commentsService.createComment(
          user.id,
          postId,
          commentText.trim(),
          replyingTo?.id
        );
        
        addComment({ ...newComment, like_count: 0, is_liked: false });
      }

      setCommentText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
    inputRef.current?.focus();
  };

  const handleCommentOptions = (comment: Comment) => {
    setSelectedComment(comment);
    setShowCommentActions(true);
  };

  const handleEditComment = () => {
    if (!selectedComment) return;
    setShowCommentActions(false);
    setEditingComment(selectedComment);
    setCommentText(selectedComment.comment_text);
    setReplyingTo(null);
    setSelectedComment(null);
    inputRef.current?.focus();
  };

  const handleDeleteComment = () => {
    if (!selectedComment) return;
    setShowCommentActions(false);
    
    Alert.alert(
      'Delete Comment',
      'This comment will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentsService.deleteComment(selectedComment.id);
              removeComment(postId, selectedComment.id);
              setSelectedComment(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    await toggleCommentLike(postId, commentId, user.id);
  };

  // Render functions
  // Render functions (defined as regular functions, not arrow functions)
  function renderComment(comment: Comment, isReply = false) {
    const replies = comments.filter((c) => c.parent_comment_id === comment.id);
    const isOwner = comment.user_id === user?.id;

    return (
      <View key={comment.id}>
        <View style={[styles.commentRow, isReply && styles.commentReply]}>
          {isReply && (
            <View style={[styles.threadLine, { backgroundColor: colors.border }]} />
          )}

          <TouchableOpacity onPress={() => handleUserPress(comment.user_id)}>
            <UserAvatar
              avatarUrl={comment.profile?.avatar_url}
              username={comment.profile?.username || 'User'}
              size={isReply ? 28 : 32}
            />
          </TouchableOpacity>

          <View style={styles.commentContent}>
            <View style={styles.commentHeader}>
              <TouchableOpacity onPress={() => handleUserPress(comment.user_id)}>
                <Text style={[styles.commentUsername, { color: colors.text }]}>
                  {comment.profile?.username || 'User'}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.commentTime, { color: colors.textTertiary }]}>
                {formatTimeAgo(comment.created_at)}
              </Text>
              {comment.updated_at !== comment.created_at && (
                <Text style={[styles.commentEdited, { color: colors.textTertiary }]}>
                  • edited
                </Text>
              )}
            </View>

            <TouchableOpacity 
              onLongPress={() => isOwner && handleCommentOptions(comment)}
              activeOpacity={1}
            >
              <Text style={[styles.commentText, { color: colors.text }]}>
                {comment.comment_text}
              </Text>
            </TouchableOpacity>

            <View style={styles.commentActions}>
              <TouchableOpacity 
                style={styles.commentActionButton}
                onPress={() => handleLikeComment(comment.id)}
              >
                <Ionicons
                  name={comment.is_liked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={comment.is_liked ? '#FF6B6B' : colors.iconInactive}
                />
                {(comment.like_count || 0) > 0 && (
                  <Text style={[styles.commentActionText, { 
                    color: comment.is_liked ? '#FF6B6B' : colors.textTertiary 
                  }]}>
                    {comment.like_count}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.commentActionButton}
                onPress={() => handleReply(comment)}
              >
                <Text style={[styles.commentReplyText, { color: colors.textTertiary }]}>
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {replies.map((reply) => renderComment(reply, true))}
      </View>
    );
  }

  function renderPostActionSheet() {
    return (
      <TouchableOpacity 
      style={styles.sheetOverlay}
      activeOpacity={1}
      onPress={() => setShowPostActions(false)}
    >
      <View style={[styles.actionSheet, { backgroundColor: colors.card }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.textTertiary }]} />
        
        <TouchableOpacity style={styles.sheetOption} onPress={handleEditPost}>
          <Ionicons name="create-outline" size={22} color={colors.text} />
          <Text style={[styles.sheetOptionText, { color: colors.text }]}>Edit Post</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetOption} onPress={handleDeletePost}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
          <Text style={[styles.sheetOptionText, { color: colors.error }]}>Delete Post</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sheetOption, styles.sheetCancel]}
          onPress={() => setShowPostActions(false)}
        >
          <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  }

  function renderCommentActionSheet() {
    return (
      <TouchableOpacity 
      style={styles.sheetOverlay}
      activeOpacity={1}
      onPress={() => setShowCommentActions(false)}
    >
      <View style={[styles.actionSheet, { backgroundColor: colors.card }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.textTertiary }]} />
        
        <TouchableOpacity style={styles.sheetOption} onPress={handleEditComment}>
          <Ionicons name="create-outline" size={22} color={colors.text} />
          <Text style={[styles.sheetOptionText, { color: colors.text }]}>Edit Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetOption} onPress={handleDeleteComment}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
          <Text style={[styles.sheetOptionText, { color: colors.error }]}>Delete Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sheetOption, styles.sheetCancel]}
          onPress={() => setShowCommentActions(false)}
        >
          <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Post not found</Text>
        </View>
      </View>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thread</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.postSection}>
          <View style={styles.postHeader}>
            <TouchableOpacity onPress={() => handleUserPress(post.user_id)}>
              <UserAvatar
                avatarUrl={post.profile?.avatar_url}
                username={post.profile?.username || 'User'}
                size={44}
              />
            </TouchableOpacity>
            <View style={styles.postHeaderText}>
              <Text style={[styles.postUsername, { color: colors.text }]}>
                {post.profile?.full_name || post.profile?.username}
              </Text>
              <Text style={[styles.postTime, { color: colors.textTertiary }]}>
                {formatTimeAgo(post.created_at)}
              </Text>
            </View>
            {post.user_id === user?.id && (
              <TouchableOpacity onPress={handlePostOptions} style={styles.postOptions}>
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.iconInactive} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.postText, { color: colors.text }]}>
            {post.review_text}
          </Text>

          {post.rating && (
            <View style={styles.postRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= post.rating! ? 'star' : 'star-outline'}
                  size={18}
                  color="#FFD700"
                />
              ))}
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {post.rating.toFixed(1)}
              </Text>
            </View>
          )}

          {post.media_poster && (
            <View style={[styles.mediaPreview, { 
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            }]}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342${post.media_poster}` }}
                style={styles.mediaPoster}
              />
              <View style={styles.mediaInfo}>
                <Text style={[styles.mediaTitle, { color: colors.text }]} numberOfLines={2}>
                  {post.media_title}
                </Text>
                <Text style={[styles.mediaType, { color: colors.textTertiary }]}>
                  {post.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLikePost}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={post.is_liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={post.is_liked ? '#FF6B6B' : colors.iconInactive}
                />
              </Animated.View>
              {(post.like_count || 0) > 0 && (
                <Text style={[styles.actionCount, { 
                  color: post.is_liked ? '#FF6B6B' : colors.textTertiary 
                }]}>
                  {post.like_count}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.iconInactive} />
              {comments.length > 0 && (
                <Text style={[styles.actionCount, { color: colors.textTertiary }]}>
                  {comments.length}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.commentsSection}>
          {topLevelComments.length > 0 ? (
            topLevelComments.map((comment) => renderComment(comment))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No comments yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Be the first to share your thoughts
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {(replyingTo || editingComment) && (
        <View style={[styles.contextBanner, { 
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
        }]}>
          <Text style={[styles.contextText, { color: colors.textSecondary }]}>
            {editingComment 
              ? 'Editing comment' 
              : `Replying to @${replyingTo?.profile?.username}`}
          </Text>
          <TouchableOpacity onPress={cancelContext}>
            <Ionicons name="close" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputBar, { 
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }]}>
        <UserAvatar
          avatarUrl={user?.avatar_url}
          username={user?.username || 'U'}
          size={32}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
          }]}
          placeholder={
            editingComment ? 'Edit comment...' :
            replyingTo ? `Reply to ${replyingTo.profile?.username}...` :
            'Add a comment...'
          }
          placeholderTextColor={colors.textTertiary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: commentText.trim() ? colors.primary : 'transparent' 
          }]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || posting}
        >
          <Ionicons
            name="send"
            size={18}
            color={commentText.trim() ? '#FFFFFF' : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {showPostActions && renderPostActionSheet()}
      {showCommentActions && renderCommentActionSheet()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scrollContent: { paddingBottom: 100 },
  postSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderText: { flex: 1, marginLeft: 12 },
  postUsername: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  postTime: { fontSize: 14 },
  postOptions: { padding: 8 },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  postRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  mediaPreview: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  mediaPoster: { width: 60, height: 90, borderRadius: 8 },
  mediaInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  mediaTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  mediaType: { fontSize: 13 },
  postActions: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginTop: 12, opacity: 0.4 },
  commentsSection: { paddingBottom: 16 },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  commentReply: { paddingLeft: 56 },
  threadLine: {
    position: 'absolute',
    left: 32,
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.3,
  },
  commentContent: { flex: 1, marginLeft: 12 },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  commentUsername: { fontSize: 15, fontWeight: '600' },
  commentTime: { fontSize: 13 },
  commentEdited: { fontSize: 12, fontStyle: 'italic' },
  commentText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  commentActions: { flexDirection: 'row', gap: 16 },
  commentActionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionText: { fontSize: 13, fontWeight: '500' },
  commentReplyText: { fontSize: 13, fontWeight: '600' },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  contextText: { fontSize: 13, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  sheetOptionText: { fontSize: 17, fontWeight: '600' },
  sheetCancel: { marginTop: 8 },
  sheetCancelText: { fontSize: 17, fontWeight: '600', textAlign: 'center', width: '100%' },
});