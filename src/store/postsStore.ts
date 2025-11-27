import { create } from 'zustand';
import { Post } from '../types';
import { postsService } from '../services/supabase/posts.service';

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
  })),
  
  fetchFeed: async (userId: string, refresh = false) => {
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
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchUserPosts: async (userId: string) => {
    try {
      set({ isLoading: true });
      const posts = await postsService.getUserPosts(userId);
      set({ userPosts: posts });
    } catch (error) {
      console.error('Error fetching user posts:', error);
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
      
      // Update local state
      get().updatePost(postId, {
        is_liked: !isLiked,
        like_count: (post.like_count || 0) + (isLiked ? -1 : 1),
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));