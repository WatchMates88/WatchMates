// src/services/supabase/posts.service.ts
// Complete file with event emissions

import { supabase } from './supabase.client';
import { Post } from '../../types';
import { refreshEventService, RefreshEvents } from '../refreshEvent.service';

export const postsService = {
  createPost: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    rating: number | null,
    reviewText: string,
    images: string[] = []
  ): Promise<Post> => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
        rating,
        review_text: reviewText,
        images,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // 🔥 Emit event - Feed will refresh
    refreshEventService.emit(RefreshEvents.POST_CREATED);
    
    return data;
  },

  updatePost: async (
    postId: string,
    reviewText: string,
    rating: number | null
  ): Promise<Post> => {
    const { data, error } = await supabase
      .from('posts')
      .update({
        review_text: reviewText,
        rating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    // 🔥 Emit event
    refreshEventService.emit(RefreshEvents.POST_CREATED);
    
    return data;
  },

  getFeed: async (userId: string, limit: number = 20, offset: number = 0): Promise<Post[]> => {
    // Skip query for guest users
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return [];
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles!posts_user_id_fkey(username, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    if (data) {
      const postsWithLikesAndComments = await Promise.all(
        data.map(async (post) => {
          const [likeCount, isLiked, commentCount] = await Promise.all([
            postsService.getLikeCount(post.id),
            postsService.isPostLiked(userId, post.id),
            postsService.getCommentCount(post.id),
          ]);
          
          return {
            ...post,
            like_count: likeCount,
            is_liked: isLiked,
            comment_count: commentCount,
          };
        })
      );
      
      return postsWithLikesAndComments;
    }
    
    return [];
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    // Skip query for guest users
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return [];
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles!posts_user_id_fkey(username, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getPostsByMedia: async (
    mediaType: 'movie' | 'tv',
    mediaId: number,
    userId?: string
  ): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles!posts_user_id_fkey(username, full_name, avatar_url)
      `)
      .eq('media_type', mediaType)
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && userId) {
      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          const [likeCount, isLiked, commentCount] = await Promise.all([
            postsService.getLikeCount(post.id),
            postsService.isPostLiked(userId, post.id),
            postsService.getCommentCount(post.id),
          ]);
          
          return {
            ...post,
            like_count: likeCount,
            is_liked: isLiked,
            comment_count: commentCount,
          };
        })
      );
      
      return postsWithLikes;
    }
    
    return data || [];
  },

  deletePost: async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    
    // 🔥 Emit event
    refreshEventService.emit(RefreshEvents.POST_DELETED);
  },

  likePost: async (userId: string, postId: string) => {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        user_id: userId,
        post_id: postId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  unlikePost: async (userId: string, postId: string) => {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    
    if (error) throw error;
  },

  isPostLiked: async (userId: string, postId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },

  getLikeCount: async (postId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (error) throw error;
    return count || 0;
  },

  getCommentCount: async (postId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (error) throw error;
    return count || 0;
  },
};