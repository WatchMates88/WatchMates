// src/store/friendsStore.ts
// Complete with Guest UUID checks

import { create } from 'zustand';
import { Profile } from '../types';
import { friendsService } from '../services/supabase/friends.service';

const GUEST_UUID = '00000000-0000-0000-0000-000000000000';

interface FriendsState {
  followers: Profile[];
  following: Profile[];
  mutuals: Profile[];
  isLoading: boolean;
  
  setFollowers: (followers: Profile[]) => void;
  setFollowing: (following: Profile[]) => void;
  computeMutuals: () => void;
  fetchFollowers: (userId: string) => Promise<void>;
  fetchFollowing: (userId: string) => Promise<void>;
  addFollowing: (user: Profile) => void;
  removeFollowing: (userId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  followers: [],
  following: [],
  mutuals: [],
  isLoading: false,
  
  setFollowers: (followers) => {
    set({ followers });
    get().computeMutuals();
  },
  
  setFollowing: (following) => {
    set({ following });
    get().computeMutuals();
  },
  
  computeMutuals: () => {
    const { followers, following } = get();
    const mutuals = following.filter(user => 
      followers.some(follower => follower.id === user.id)
    );
    set({ mutuals });
  },
  
  fetchFollowers: async (userId: string) => {
    // Skip for guest users
    if (userId === GUEST_UUID) {
      set({ followers: [], isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const followers = await friendsService.getFollowers(userId);
      get().setFollowers(followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      set({ followers: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchFollowing: async (userId: string) => {
    // Skip for guest users
    if (userId === GUEST_UUID) {
      set({ following: [], isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const following = await friendsService.getFollowing(userId);
      get().setFollowing(following);
    } catch (error) {
      console.error('Error fetching following:', error);
      set({ following: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addFollowing: (user) => set((state) => {
    const newFollowing = [...state.following, user];
    return { following: newFollowing };
  }),
  
  removeFollowing: (userId) => set((state) => {
    const newFollowing = state.following.filter((u) => u.id !== userId);
    return { following: newFollowing };
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));