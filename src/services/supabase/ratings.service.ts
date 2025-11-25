import { supabase } from './supabase.client';
import { Rating } from '../../types';

export const ratingsService = {
  upsertRating: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    rating: number,
    review?: string
  ) => {
    const { data, error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        media_id: mediaId,
        media_type: mediaType,
        rating,
        review,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getUserRatings: async (userId: string): Promise<Rating[]> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getRating: async (
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv'
  ): Promise<Rating | null> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  deleteRating: async (ratingId: string) => {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId);
    
    if (error) throw error;
  },
};
