import { create } from 'zustand';
import { Comment } from '../types';
import { commentsService } from '../services/supabase/comments.service';

interface CommentsState {
  // Comments by post ID
  commentsByPost: { [postId: string]: Comment[] };
  isLoading: boolean;
  
  // Fetch comments for a post
  fetchComments: (postId: string, userId: string) => Promise<void>;
  
  // Add a new comment
  addComment: (comment: Comment) => void;
  
  // Update a comment
  updateComment: (commentId: string, commentText: string) => void;
  
  // Delete a comment
  removeComment: (postId: string, commentId: string) => void;
  
  // Toggle like on comment
  toggleCommentLike: (postId: string, commentId: string, userId: string) => Promise<void>;
  
  // Get comments for a specific post
  getCommentsForPost: (postId: string) => Comment[];
  
  // Clear comments (for cleanup)
  clearComments: (postId: string) => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  commentsByPost: {},
  isLoading: false,
  
  fetchComments: async (postId: string, userId: string) => {
    try {
      set({ isLoading: true });
      const comments = await commentsService.getCommentsWithLikes(postId, userId);
      
      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: comments,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      set({ isLoading: false });
    }
  },
  
  addComment: (comment: Comment) => {
    set((state) => {
      const postComments = state.commentsByPost[comment.post_id] || [];
      return {
        commentsByPost: {
          ...state.commentsByPost,
          [comment.post_id]: [...postComments, { ...comment, like_count: 0, is_liked: false }],
        },
      };
    });
  },
  
  updateComment: (commentId: string, commentText: string) => {
    set((state) => {
      const newCommentsByPost = { ...state.commentsByPost };
      
      Object.keys(newCommentsByPost).forEach((postId) => {
        newCommentsByPost[postId] = newCommentsByPost[postId].map((comment) =>
          comment.id === commentId
            ? { ...comment, comment_text: commentText, updated_at: new Date().toISOString() }
            : comment
        );
      });
      
      return { commentsByPost: newCommentsByPost };
    });
  },
  
  removeComment: (postId: string, commentId: string) => {
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: (state.commentsByPost[postId] || []).filter((c) => c.id !== commentId),
      },
    }));
  },
  
  toggleCommentLike: async (postId: string, commentId: string, userId: string) => {
    const state = get();
    const comments = state.commentsByPost[postId] || [];
    const comment = comments.find((c) => c.id === commentId);
    
    if (!comment) return;
    
    // Optimistic update
    const isLiked = comment.is_liked;
    const newLikeCount = isLiked ? (comment.like_count || 0) - 1 : (comment.like_count || 0) + 1;
    
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: comments.map((c) =>
          c.id === commentId
            ? { ...c, is_liked: !isLiked, like_count: newLikeCount }
            : c
        ),
      },
    }));
    
    // Actual API call
    try {
      if (isLiked) {
        await commentsService.unlikeComment(userId, commentId);
      } else {
        await commentsService.likeComment(userId, commentId);
      }
    } catch (error) {
      // Revert on error
      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: comments.map((c) =>
            c.id === commentId
              ? { ...c, is_liked: isLiked, like_count: comment.like_count }
              : c
          ),
        },
      }));
      console.error('Error toggling comment like:', error);
    }
  },
  
  getCommentsForPost: (postId: string) => {
    return get().commentsByPost[postId] || [];
  },
  
  clearComments: (postId: string) => {
    set((state) => {
      const newCommentsByPost = { ...state.commentsByPost };
      delete newCommentsByPost[postId];
      return { commentsByPost: newCommentsByPost };
    });
  },
}));
