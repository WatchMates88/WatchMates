// src/store/postsStore.ts
// Complete with Guest UUID checks

import { create } from 'zustand';
import { Post } from '../types';
import { postsService } from '../services/supabase/posts.service';

const GUEST_UUID = '00000000-0000-0000-0000-000000000000';

interface PostsState {
  posts: Post[];
  userPosts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  
  fetchFeed: (userId: string, refresh?: boolean) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  
  toggleLike: (postId: string, userId: string) => Promise<void>;
  
  editPost: (postId: string, reviewText: string, rating: number | null) => Promise<void>;
  deletePostById: (postId: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  userPosts: [],
  isLoading: false,
  hasMore: true,
  
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts],
  })),
  
  removePost: (postId) => set((state) => ({
    posts: state.posts.filter((p) => p.id !== postId),
    userPosts: state.userPosts.filter((p) => p.id !== postId),
  })),
  
  updatePost: (postId, updates) => set((state) => ({
    posts: state.posts.map((p) => p.id === postId ? { ...p, ...updates } : p),
    userPosts: state.userPosts.map((p) => p.id === postId ? { ...p, ...updates } : p),
  })),
  
  fetchFeed: async (userId: string, refresh = false) => {
    // Skip for guest users
    if (userId === GUEST_UUID) {
      set({ posts: [], isLoading: false, hasMore: false });
      return;
    }

    try {
      set({ isLoading: true });
      
      const offset = refresh ? 0 : get().posts.length;
      const newPosts = await postsService.getFeed(userId, 20, offset);
      
      if (refresh) {
        set({ posts: newPosts, hasMore: newPosts.length === 20 });
      } else {
        set({ 
          posts: [...get().posts, ...newPosts],
          hasMore: newPosts.length === 20,
        });
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      set({ posts: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchUserPosts: async (userId: string) => {
    // Skip for guest users
    if (userId === GUEST_UUID) {
      set({ userPosts: [], isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const posts = await postsService.getUserPosts(userId);
      set({ userPosts: posts });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      set({ userPosts: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  toggleLike: async (postId: string, userId: string) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.is_liked;
      
      if (isLiked) {
        await postsService.unlikePost(userId, postId);
      } else {
        await postsService.likePost(userId, postId);
      }
      
      get().updatePost(postId, {
        is_liked: !isLiked,
        like_count: (post.like_count || 0) + (isLiked ? -1 : 1),
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  },
  
  editPost: async (postId: string, reviewText: string, rating: number | null) => {
    try {
      const updatedPost = await postsService.updatePost(postId, reviewText, rating);
      
      get().updatePost(postId, {
        review_text: reviewText,
        rating,
        updated_at: updatedPost.updated_at,
      });
    } catch (error) {
      console.error('Error editing post:', error);
      throw error;
    }
  },
  
  deletePostById: async (postId: string) => {
    try {
      await postsService.deletePost(postId);
      get().removePost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));