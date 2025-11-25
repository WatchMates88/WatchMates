import { create } from 'zustand';
import { WatchlistItem } from '../types';

interface WatchlistState {
  items: WatchlistItem[];
  isLoading: boolean;
  
  setItems: (items: WatchlistItem[]) => void;
  addItem: (item: WatchlistItem) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<WatchlistItem>) => void;
  setLoading: (loading: boolean) => void;
  
  getToWatch: () => WatchlistItem[];
  getWatched: () => WatchlistItem[];
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: [],
  isLoading: false,
  
  setItems: (items) => set({ items }),
  
  addItem: (item) => set((state) => ({
    items: [item, ...state.items],
  })),
  
  removeItem: (itemId) => set((state) => ({
    items: state.items.filter((item) => item.id !== itemId),
  })),
  
  updateItem: (itemId, updates) => set((state) => ({
    items: state.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    ),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  getToWatch: () => get().items.filter((item) => item.status === 'to_watch'),
  getWatched: () => get().items.filter((item) => item.status === 'watched'),
}));
