import { supabase } from './supabase.client';
import { Profile } from '../../types';

export const friendsService = {
  followUser: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) throw error;
  },

  getFollowers: async (userId: string): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);
    
    if (error) throw error;
    return data?.map(item => item.profiles) || [];
  },

  getFollowing: async (userId: string): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);
    
    if (error) throw error;
    return data?.map(item => item.profiles) || [];
  },

  getFriends: async (userId: string): Promise<Profile[]> => {
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (followingError) throw followingError;
    
    const followingIds = following?.map(f => f.following_id) || [];
    
    if (followingIds.length === 0) return [];
    
    const { data: mutualFollows, error: mutualError } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId)
      .in('follower_id', followingIds);
    
    if (mutualError) throw mutualError;
    return mutualFollows?.map(item => item.profiles) || [];
  },

  isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },
};
