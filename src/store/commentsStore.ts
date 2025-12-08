import { create } from 'zustand';
import { Comment } from '../types';
import { commentsService } from '../services/supabase/comments.service';

interface CommentsState {
  commentsByPost: { [postId: string]: Comment[] };
  isLoading: boolean;
  
  fetchComments: (postId: string, userId: string) => Promise<void>;
  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, commentText: string) => void;
  removeComment: (postId: string, commentId: string) => void;
  toggleCommentLike: (postId: string, commentId: string, userId: string) => Promise<void>;
  getCommentsForPost: (postId: string) => Comment[];
  clearComments: (postId: string) => void;
}

// Helper: Build comment tree with nested replies
function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: Create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: Build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parent_comment_id) {
      // This is a reply - add to parent
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  commentsByPost: {},
  isLoading: false,
  
  fetchComments: async (postId: string, userId: string) => {
    try {
      set({ isLoading: true });
      const comments = await commentsService.getCommentsWithLikes(postId, userId);
      
      // Build tree structure with nested replies
      const commentTree = buildCommentTree(comments);
      
      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: commentTree, // Store tree, not flat list
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
      
      // If it's a reply, add to parent's replies array
      if (comment.parent_comment_id) {
        const updatedComments = postComments.map(c => {
          if (c.id === comment.parent_comment_id) {
            return {
              ...c,
              replies: [...(c.replies || []), { ...comment, like_count: 0, is_liked: false, replies: [] }]
            };
          }
          return c;
        });
        
        return {
          commentsByPost: {
            ...state.commentsByPost,
            [comment.post_id]: updatedComments,
          },
        };
      }
      
      // Root comment - add to list
      return {
        commentsByPost: {
          ...state.commentsByPost,
          [comment.post_id]: [...postComments, { ...comment, like_count: 0, is_liked: false, replies: [] }],
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
    
    // Find comment (could be nested)
    const findComment = (comments: Comment[]): Comment | null => {
      for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies) {
          const found = findComment(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };
    
    const comment = findComment(comments);
    if (!comment) return;
    
    const isLiked = comment.is_liked;
    const newLikeCount = isLiked ? (comment.like_count || 0) - 1 : (comment.like_count || 0) + 1;
    
    // Optimistic update (recursive)
    const updateCommentInTree = (comments: Comment[]): Comment[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, is_liked: !isLiked, like_count: newLikeCount };
        }
        if (c.replies) {
          return { ...c, replies: updateCommentInTree(c.replies) };
        }
        return c;
      });
    };
    
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: updateCommentInTree(comments),
      },
    }));
    
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
          [postId]: updateCommentInTree(comments),
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