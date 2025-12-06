// src/services/supabase/imageUpload.service.ts - ACTUALLY WORKING

import { supabase } from './supabase.client';
import { decode } from 'base64-arraybuffer';

export const imageUploadService = {
  uploadImage: async (uri: string, folder: 'posts' | 'comments' = 'posts'): Promise<string> => {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `${folder}/${timestamp}-${random}.jpeg`;

      // Fetch the image
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert blob to array buffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filename, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filename);

      console.log('Image uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  uploadMultipleImages: async (uris: string[], folder: 'posts' | 'comments' = 'posts'): Promise<string[]> => {
    try {
      console.log('Uploading', uris.length, 'images...');
      const uploadPromises = uris.map(uri => imageUploadService.uploadImage(uri, folder));
      const urls = await Promise.all(uploadPromises);
      console.log('All images uploaded:', urls);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  },

  deleteImage: async (url: string): Promise<void> => {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const folder = parts[parts.length - 2];
      const path = `${folder}/${filename}`;

      const { error } = await supabase.storage
        .from('post-images')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
};