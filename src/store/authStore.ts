// src/store/authStore.ts
// Fixed: Proper initialization for splash → welcome flow

import { create } from 'zustand';
import { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true to check for existing session
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user && !user.isGuest,
    isLoading: false,
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
  }),
  
  // Call this on app start to finish loading
  initialize: () => set({ isLoading: false }),
}));