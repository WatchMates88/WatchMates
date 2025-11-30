import { supabase } from './supabase.client';

export const commentsService = {
  // Get all comments for a post (with profile data and like counts)
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

    // Add like_count and is_liked fields
    return data || [];
  },

  // Get comments with like info for current user
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

    // Get like counts and user's likes
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

  // Create a comment or reply
  createComment: async (
    userId: string,
    postId: string,
    commentText: string,
    parentCommentId?: string
  ) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        comment_text: commentText,
        parent_comment_id: parentCommentId || null,
      })
      .select(`
        *,
        profile:profiles(id, username, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update comment text
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

  // Delete a comment
  deleteComment: async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  // Like a comment
  likeComment: async (userId: string, commentId: string) => {
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        user_id: userId,
        comment_id: commentId,
      });

    if (error) throw error;
  },

  // Unlike a comment
  unlikeComment: async (userId: string, commentId: string) => {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId);

    if (error) throw error;
  },

  // Check if user liked a comment
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

  // Get like count for a comment
  getLikeCount: async (commentId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);

    if (error) throw error;
    return count || 0;
  },

  // Get replies for a comment
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