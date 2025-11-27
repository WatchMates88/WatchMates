import { supabase } from './supabase.client';
import { Post, PostLike } from '../../types';

export const postsService = {
  // Create a new post
  createPost: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    rating: number | null,
    reviewText: string
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
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get feed (posts from users you follow + your own)
  getFeed: async (userId: string, limit: number = 20, offset: number = 0): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles!posts_user_id_fkey(username, full_name, avatar_url),
        like_count:post_likes(count),
        is_liked:post_likes!inner(user_id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  },

  // Get user's posts
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

  // Delete post
  deletePost: async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
  },

  // Like a post
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

  // Unlike a post
  unlikePost: async (userId: string, postId: string) => {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    
    if (error) throw error;
  },

  // Check if user liked a post
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

  // Get like count for a post
  getLikeCount: async (postId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (error) throw error;
    return count || 0;
  },
};