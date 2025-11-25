import { create } from 'zustand';
import { Profile } from '../types';

interface FriendsState {
  followers: Profile[];
  following: Profile[];
  friends: Profile[];
  isLoading: boolean;
  
  setFollowers: (followers: Profile[]) => void;
  setFollowing: (following: Profile[]) => void;
  setFriends: (friends: Profile[]) => void;
  addFollowing: (user: Profile) => void;
  removeFollowing: (userId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  followers: [],
  following: [],
  friends: [],
  isLoading: false,
  
  setFollowers: (followers) => set({ followers }),
  setFollowing: (following) => set({ following }),
  setFriends: (friends) => set({ friends }),
  
  addFollowing: (user) => set((state) => ({
    following: [...state.following, user],
  })),
  
  removeFollowing: (userId) => set((state) => ({
    following: state.following.filter((u) => u.id !== userId),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));
