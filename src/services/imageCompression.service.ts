// src/services/imageCompression.service.ts
// Auto-compress images before upload (800KB max)

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  size: number;
}

export class ImageCompressionService {
  private static readonly MAX_FILE_SIZE = 800 * 1024; // 800KB
  private static readonly MAX_DIMENSION = 1280;
  private static readonly INITIAL_QUALITY = 0.8;
  private static readonly MIN_QUALITY = 0.5;

  /**
   * Compress image to under 800KB
   */
  static async compressImage(uri: string): Promise<CompressionResult> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Handle FileInfo type properly
      if (!fileInfo.exists) {
        throw new Error('File not found');
      }
      
      const originalSize = fileInfo.size || 0;

      console.log(`Original: ${(originalSize / 1024).toFixed(1)}KB`);

      // If small enough, just resize
      if (originalSize <= this.MAX_FILE_SIZE) {
        return await this.resizeImage(uri, this.INITIAL_QUALITY);
      }

      // Reduce quality until under limit
      let quality = this.INITIAL_QUALITY;
      let result = await this.resizeImage(uri, quality);

      while (result.size > this.MAX_FILE_SIZE && quality > this.MIN_QUALITY) {
        quality -= 0.1;
        result = await this.resizeImage(uri, quality);
      }

      console.log(`Compressed: ${(result.size / 1024).toFixed(1)}KB`);
      return result;
    } catch (error) {
      console.error('Compression failed:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Resize with quality setting
   */
  private static async resizeImage(
    uri: string,
    quality: number
  ): Promise<CompressionResult> {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: this.MAX_DIMENSION } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
    
    // Handle FileInfo type properly
    const size = (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0;
    
    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
      size,
    };
  }

  /**
   * Compress multiple images
   */
  static async compressMultipleImages(
    uris: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const compressed: string[] = [];

    for (let i = 0; i < uris.length; i++) {
      if (onProgress) onProgress(i + 1, uris.length);
      
      const result = await this.compressImage(uris[i]);
      compressed.push(result.uri);
    }

    return compressed;
  }
}