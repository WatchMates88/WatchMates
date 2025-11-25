import { supabase } from './supabase.client';
import { WatchlistItem } from '../../types';

export const watchlistService = {
  getWatchlist: async (userId: string): Promise<WatchlistItem[]> => {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  addToWatchlist: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    status: 'to_watch' | 'watched' = 'to_watch'
  ) => {
    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: userId,
        media_id: mediaId,
        media_type: mediaType,
        status,
        watched_at: status === 'watched' ? new Date().toISOString() : null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateStatus: async (itemId: string, status: 'to_watch' | 'watched') => {
    const { data, error } = await supabase
      .from('watchlist')
      .update({
        status,
        watched_at: status === 'watched' ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  removeFromWatchlist: async (itemId: string) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
  },

  isInWatchlist: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv'
  ): Promise<WatchlistItem | null> => {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
};
