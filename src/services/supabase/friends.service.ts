import { supabase } from './supabase.client';
import { Profile } from '../../types';

export const friendsService = {
  // Follow a user
  followUser: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Unfollow a user
  unfollowUser: async (followerId: string, followingId: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) throw error;
  },

  // Get followers
  getFollowers: async (userId: string): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);
    
    if (error) throw error;
    return data?.map((item: any) => item.profiles) || [];
  },

  // Get following
  getFollowing: async (userId: string): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);
    
    if (error) throw error;
    return data?.map((item: any) => item.profiles) || [];
  },

  // Check if following
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

  // Search profiles by username
  searchProfiles: async (query: string): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  // Get single profile
  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
};