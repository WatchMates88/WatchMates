// src/services/supabase/posts.service.ts - With Comment Counts

import { supabase } from './supabase.client';
import { Post } from '../../types';

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
    return data;
  },

  getFeed: async (userId: string, limit: number = 20, offset: number = 0): Promise<Post[]> => {
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
            postsService.getCommentCount(post.id), // NEW: Get comment count
          ]);
          
          return {
            ...post,
            like_count: likeCount,
            is_liked: isLiked,
            comment_count: commentCount, // NEW: Add to post object
          };
        })
      );
      
      return postsWithLikesAndComments;
    }
    
    return [];
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
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

  deletePost: async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
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

  // NEW: Get comment count for a post
  getCommentCount: async (postId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (error) throw error;
    return count || 0;
  },
};