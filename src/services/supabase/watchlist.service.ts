// src/services/supabase/watchlist.service.ts
// Complete - NO created_at references, with event emissions

import { supabase } from './supabase.client';
import { refreshEventService, RefreshEvents } from '../refreshEvent.service';

export const watchlistService = {
  addToWatchlist: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    status: 'to_watch' | 'watched'
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
    
    // 🔥 Emit event - All screens listening will refresh
    refreshEventService.emit(RefreshEvents.WATCHLIST_UPDATED);
    
    return data;
  },

  removeFromWatchlist: async (itemId: string) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    
    // 🔥 Emit event
    refreshEventService.emit(RefreshEvents.WATCHLIST_UPDATED);
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
    
    // 🔥 Emit event
    refreshEventService.emit(RefreshEvents.WATCHLIST_UPDATED);
    
    return data;
  },

  getWatchlist: async (userId: string) => {
    // Skip query for guest users
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return [];
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  isInWatchlist: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    // Skip query for guest users
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return null;
    }

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