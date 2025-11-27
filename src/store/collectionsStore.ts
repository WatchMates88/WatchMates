import { create } from 'zustand';
import { Collection, CollectionItem } from '../types';
import { collectionsService } from '../services/supabase/collections.service';

interface CollectionsState {
  collections: Collection[];
  collaborativeCollections: Collection[];
  isLoading: boolean;
  
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  removeCollection: (collectionId: string) => void;
  updateCollection: (collectionId: string, updates: Partial<Collection>) => void;
  
  fetchCollections: (userId: string) => Promise<void>;
  fetchCollaborativeCollections: (userId: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  collaborativeCollections: [],
  isLoading: false,
  
  setCollections: (collections) => set({ collections }),
  
  addCollection: (collection) => set((state) => ({
    collections: [collection, ...state.collections],
  })),
  
  removeCollection: (collectionId) => set((state) => ({
    collections: state.collections.filter((c) => c.id !== collectionId),
  })),
  
  updateCollection: (collectionId, updates) => set((state) => ({
    collections: state.collections.map((c) =>
      c.id === collectionId ? { ...c, ...updates } : c
    ),
  })),
  
  fetchCollections: async (userId: string) => {
    try {
      set({ isLoading: true });
      const collections = await collectionsService.getCollections(userId);
      set({ collections });
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchCollaborativeCollections: async (userId: string) => {
    try {
      const collab = await collectionsService.getCollaborativeCollections(userId);
      set({ collaborativeCollections: collab });
    } catch (error) {
      console.error('Error fetching collaborative collections:', error);
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));