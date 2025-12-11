// src/services/supabase/auth.service.ts
// Complete with password reset functionality

import { supabase } from './supabase.client';
import { Profile } from '../../types';
import * as FileSystem from 'expo-file-system/legacy';

export const authService = {
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username });
      
      if (profileError) throw profileError;
    }
    
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://yourdomain.com/reset-password', // Change to your domain
      // Or for mobile deep link: 'watchmates://reset-password'
    });

    if (error) throw error;
  },

  // Update password (for authenticated users or after reset)
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // Upload avatar using expo-file-system
  uploadAvatar: async (userId: string, imageUri: string): Promise<string> => {
    try {
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer.buffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = publicData.publicUrl;

      await authService.updateProfile(userId, { avatar_url: avatarUrl });

      return avatarUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },
};