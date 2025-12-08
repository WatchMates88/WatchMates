// src/screens/feed/PostDetailScreen.tsx - CAREFUL UPDATES

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Heart, MessageCircle, Share2, Bookmark, Send, ChevronLeft, ImageIcon, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { RootStackParamList, Post, Comment } from '../../types';
import { usePostsStore, useAuthStore, useCommentsStore } from '../../store';
import { commentsService } from '../../services/supabase/comments.service';
import { imageUploadService } from '../../services/supabase/ImageUpload.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.7; // Threads-style 70%

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export const PostDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user } = useAuthStore();
  const { posts, toggleLike } = usePostsStore();
  const {
    getCommentsForPost,
    fetchComments,
    addComment,
    removeComment,
    toggleCommentLike,
  } = useCommentsStore();

  const post = posts.find((p) => p.id === postId);
  const comments = getCommentsForPost(postId);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [posting, setPosting] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user && postId) {
      fetchComments(postId, user.id);
    }
  }, [postId, user]);

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

  const handleUserPress = (userId: string) => {
    if (userId === user?.id) {
      navigation.navigate('MainTabs', { screen: 'Profile' } as any);
    } else {
      navigation.navigate('FriendProfile', { userId });
    }
  };

  const handleLikePost = async () => {
    if (!user || !post) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    await toggleLike(postId, user.id);
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
      setAttachedImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      setPosting(true);

      let imageUrls: string[] = [];
      if (attachedImage) {
        const url = await imageUploadService.uploadImage(attachedImage, 'comments');
        imageUrls = [url];
      }

      const newComment = await commentsService.createComment(
        user.id,
        postId,
        commentText.trim(),
        replyingTo?.id,
        imageUrls
      );

      addComment({ ...newComment, like_count: 0, is_liked: false });
      setCommentText('');
      setReplyingTo(null);
      setAttachedImage(null);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    await toggleCommentLike(postId, commentId, user.id);
  };

  const handleDeleteComment = (comment: Comment) => {
    Alert.alert('Delete Comment', 'This comment will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentsService.deleteComment(comment.id);
            removeComment(postId, comment.id);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  const renderHeader = () => {
    if (!post) return null;

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => handleUserPress(post.user_id)}>
            <Image
              source={{
                uri:
                  post.profile?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${post.profile?.username || 'U'}&background=A78BFA&color=000`,
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {post.profile?.full_name || post.profile?.username}
            </Text>
            <Text style={styles.handle}>@{post.profile?.username || 'user'}</Text>
          </View>

          <Text style={styles.timestamp}>{formatTimeAgo(post.created_at)}</Text>
        </View>

        {post.review_text && post.review_text.trim() && (
          <Text style={styles.postText}>{post.review_text}</Text>
        )}

        {/* FIXED: Threads-style horizontal scroll images */}
        {post.images && post.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postImagesScroll}
            decelerationRate="fast"
            snapToInterval={IMAGE_WIDTH + 8}
          >
            {post.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.95}
                onPress={() => navigation.navigate('FullScreenImageViewer', {
                  images: post.images!,
                  index: idx,
                })}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {post.media_poster && post.media_id && post.media_id > 0 && (
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${post.media_poster}` }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.posterGradient}>
              <Text style={styles.posterTitle} numberOfLines={2}>
                {post.media_title}
              </Text>
              <Text style={styles.posterType}>
                • {post.media_type === 'movie' ? 'Movie' : 'TV Show'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleLikePost} style={styles.actionBtn} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Heart
                size={22}
                color={post.is_liked ? '#EF4444' : 'rgba(255,255,255,0.5)'}
                fill={post.is_liked ? '#EF4444' : 'none'}
                strokeWidth={1.8}
              />
            </Animated.View>
            {(post.like_count || 0) > 0 && (
              <Text style={[styles.actionCount, post.is_liked && styles.likedCount]}>
                {post.like_count}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MessageCircle size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
            {comments.length > 0 && <Text style={styles.actionCount}>{comments.length}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Share2 size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} activeOpacity={0.7}>
            <Bookmark size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />
      </View>
    );
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwner = item.user_id === user?.id;

    return (
      <View style={styles.commentContainer}>
        <TouchableOpacity onPress={() => handleUserPress(item.user_id)}>
          <Image
            source={{
              uri:
                item.profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${item.profile?.username || 'U'}&background=A78BFA&color=000`,
            }}
            style={styles.commentAvatar}
          />
        </TouchableOpacity>

        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>{item.profile?.username || 'User'}</Text>
            <Text style={styles.commentTime}>{formatTimeAgo(item.created_at)}</Text>
          </View>

          {item.comment_text && item.comment_text.trim() && (
            <Text style={styles.commentText}>{item.comment_text}</Text>
          )}

          {item.images && item.images.length > 0 && (
            <View style={styles.commentImageContainer}>
              {item.images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.95}
                  onPress={() => navigation.navigate('FullScreenImageViewer', {
                    images: item.images!,
                    index: idx,
                  })}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.commentImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => handleLikeComment(item.id)}
              activeOpacity={0.7}
            >
              <Heart
                size={15}
                color={item.is_liked ? '#EF4444' : 'rgba(255,255,255,0.4)'}
                fill={item.is_liked ? '#EF4444' : 'none'}
                strokeWidth={1.8}
              />
              {(item.like_count || 0) > 0 && (
                <Text style={[styles.actionText, item.is_liked && styles.likedText]}>
                  {item.like_count}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => handleReply(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            {isOwner && (
              <TouchableOpacity
                style={styles.commentAction}
                onPress={() => handleDeleteComment(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyComments}>
      <MessageCircle size={48} color="rgba(255,255,255,0.12)" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No comments yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share your thoughts</Text>
    </View>
  );

  if (!post) {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.errorText}>Post not found</Text>
      </SafeAreaView>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const canSend = commentText.trim().length > 0 || attachedImage;

  return (
    <View style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Comments List - Separate from input */}
      <FlatList
        ref={flatListRef}
        data={topLevelComments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Reply Context Banner */}
      {replyingTo && (
        <View style={styles.replyContext}>
          <Text style={styles.replyText}>Replying to @{replyingTo.profile?.username}</Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Text style={styles.cancelReply}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview */}
      {attachedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: attachedImage }} style={styles.previewImage} />
          <TouchableOpacity onPress={handleRemoveImage} style={styles.removePreviewBtn}>
            <X size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Container - Fixed at bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
      >
        <View style={styles.inputContainer}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=A78BFA&color=000`,
            }}
            style={styles.inputAvatar}
          />

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={300}
            />

            <View style={styles.inputButtons}>
              <TouchableOpacity onPress={handleAddPhoto} style={styles.photoBtn} activeOpacity={0.7}>
                <ImageIcon size={20} color="rgba(255,255,255,0.5)" strokeWidth={2} />
              </TouchableOpacity>

              {canSend && !posting && (
                <TouchableOpacity
                  onPress={handleSubmitComment}
                  style={styles.sendBtn}
                  activeOpacity={0.7}
                >
                  <Send size={18} color="#000000" strokeWidth={2.5} fill="#A78BFA" />
                </TouchableOpacity>
              )}

              {posting && (
                <View style={styles.sendBtn}>
                  <ActivityIndicator size="small" color="#A78BFA" />
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  keyboardView: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#000000',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
  headerSpacer: { width: 44 },

  listContent: { paddingBottom: 20 },

  postContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },

  postHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userInfo: { flex: 1 },
  username: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3, marginBottom: 3 },
  handle: { fontSize: 14, fontWeight: '400', color: 'rgba(255,255,255,0.5)', letterSpacing: 0 },
  timestamp: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.45)', letterSpacing: 0 },

  postText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: 16,
  },

  // FIXED: Threads-style horizontal scroll
  postImagesScroll: {
    paddingRight: 20,
    marginBottom: 16,
  },
  postImage: {
    width: IMAGE_WIDTH,
    height: Math.min(IMAGE_WIDTH * (5/4), 350),
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  posterContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#0A0A0A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  poster: { width: '100%', aspectRatio: 1 / 1.15 },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  posterTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  posterType: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  actionsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 20 },
  saveBtn: { marginLeft: 'auto', marginRight: 0 },
  actionCount: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  likedCount: { color: '#EF4444' },

  sectionDivider: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.015)',
    marginTop: 8,
    marginHorizontal: -20,
  },

  commentContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  commentUsername: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
  commentTime: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.45)' },
  commentText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
    letterSpacing: -0.1,
    marginBottom: 8,
  },

  commentImageContainer: { marginTop: 8, marginBottom: 8 },
  commentImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
  },

  // NESTED REPLIES STYLES
  repliesContainer: {
    marginTop: 12,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(139, 92, 255, 0.2)',
  },
  replyItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  replyContent: {
    flex: 1,
  },

  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 2 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  likedText: { color: '#EF4444' },
  deleteText: { fontSize: 13, fontWeight: '500', color: '#EF4444' },

  emptyComments: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  emptySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  replyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  replyText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  cancelReply: { fontSize: 13, fontWeight: '600', color: '#A78BFA' },

  imagePreview: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: { width: 120, height: 120, borderRadius: 12 },
  removePreviewBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FIXED: Proper bottom padding for iOS
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#000000',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  inputAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E20',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.1,
    lineHeight: 20,
    paddingVertical: 4,
    maxHeight: 80,
  },
  inputButtons: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  photoBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorText: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 100 },
});