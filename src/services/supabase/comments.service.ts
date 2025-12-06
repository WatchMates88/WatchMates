// src/services/supabase/comments.service.ts - KEEP YOUR EXPORT STYLE

import { supabase } from './supabase.client';

export const commentsService = {
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(id, username, full_name, avatar_url),
        likes:comment_likes(count)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getCommentsWithLikes: async (postId: string, userId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(id, username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const commentsWithLikes = await Promise.all(
      (data || []).map(async (comment) => {
        const [likeCount, userLike] = await Promise.all([
          commentsService.getLikeCount(comment.id),
          commentsService.isCommentLiked(userId, comment.id),
        ]);

        return {
          ...comment,
          like_count: likeCount,
          is_liked: userLike,
        };
      })
    );

    return commentsWithLikes;
  },

  // UPDATED: Added images parameter
  createComment: async (
    userId: string,
    postId: string,
    commentText: string,
    parentCommentId?: string,
    images: string[] = [] // NEW
  ) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        comment_text: commentText,
        parent_comment_id: parentCommentId || null,
        images, // NEW
      })
      .select(`
        *,
        profile:profiles(id, username, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  updateComment: async (commentId: string, commentText: string) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ 
        comment_text: commentText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteComment: async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  likeComment: async (userId: string, commentId: string) => {
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        user_id: userId,
        comment_id: commentId,
      });

    if (error) throw error;
  },

  unlikeComment: async (userId: string, commentId: string) => {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId);

    if (error) throw error;
  },

  isCommentLiked: async (userId: string, commentId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  getLikeCount: async (commentId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);

    if (error) throw error;
    return count || 0;
  },

  getReplies: async (commentId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(id, username, full_name, avatar_url)
      `)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};