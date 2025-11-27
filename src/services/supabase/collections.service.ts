import { supabase } from './supabase.client';
import { Collection, CollectionItem } from '../../types';

export const collectionsService = {
  // Get user's collections
  getCollections: async (userId: string): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get collaborative collections user is part of
  getCollaborativeCollections: async (userId: string): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from('collection_collaborators')
      .select('collection_id, collections(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map((item: any) => item.collections) || [];
  },

  // Create collection
  createCollection: async (
    userId: string,
    name: string,
    description: string | null,
    emoji: string,
    color: string,
    isCollaborative: boolean
  ): Promise<Collection> => {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        owner_id: userId,
        name,
        description,
        emoji,
        color,
        is_collaborative: isCollaborative,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update collection
  updateCollection: async (
    collectionId: string,
    updates: Partial<Collection>
  ): Promise<Collection> => {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete collection
  deleteCollection: async (collectionId: string) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);
    
    if (error) throw error;
  },

  // Add item to collection
  addItemToCollection: async (
    collectionId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    userId: string
  ): Promise<CollectionItem> => {
    const { data, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        media_id: mediaId,
        media_type: mediaType,
        added_by: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Remove item from collection
  removeItemFromCollection: async (itemId: string) => {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
  },

  // Get collection items
  getCollectionItems: async (collectionId: string): Promise<CollectionItem[]> => {
    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add collaborator
  addCollaborator: async (collectionId: string, userId: string) => {
    const { data, error } = await supabase
      .from('collection_collaborators')
      .insert({
        collection_id: collectionId,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Remove collaborator
  removeCollaborator: async (collectionId: string, userId: string) => {
    const { error } = await supabase
      .from('collection_collaborators')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Get collaborators
  getCollaborators: async (collectionId: string) => {
    const { data, error } = await supabase
      .from('collection_collaborators')
      .select('user_id, profiles(*)')
      .eq('collection_id', collectionId);
    
    if (error) throw error;
    return data?.map((item: any) => item.profiles) || [];
  },
};