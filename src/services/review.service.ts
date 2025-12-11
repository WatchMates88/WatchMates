// src/services/review.service.ts

import { tmdbService } from './tmdb/tmdb.service';
import { postsService } from './supabase/posts.service';
import { TMDBReview, UnifiedReview } from '../types/review.types';

export const reviewService = {
  /**
   * Get unified reviews (WatchMates + TMDB) for a movie/show
   */
  getUnifiedReviews: async (
    mediaType: 'movie' | 'tv',
    mediaId: number,
    userId?: string
  ): Promise<UnifiedReview[]> => {
    try {
      // Fetch both in parallel
      const [tmdbReviews, watchmatesPosts] = await Promise.all([
        mediaType === 'movie'
          ? tmdbService.getMovieReviews(mediaId)
          : tmdbService.getTVReviews(mediaId),
        postsService.getPostsByMedia(mediaType, mediaId, userId),
      ]);

      // Convert TMDB reviews
      const tmdbUnified: UnifiedReview[] = tmdbReviews.map((review: TMDBReview) => ({
        id: `tmdb-${review.id}`,
        source: 'tmdb' as const,
        author: review.author_details?.username || review.author,
        authorAvatar: review.author_details?.avatar_path
          ? `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}`
          : null,
        content: review.content,
        rating: review.author_details?.rating || null,
        createdAt: review.created_at,
      }));

      // Convert WatchMates posts (only posts with review_text)
      const watchmatesUnified: UnifiedReview[] = watchmatesPosts
        .filter((post) => post.review_text && post.review_text.trim().length > 0)
        .map((post) => ({
          id: `watchmates-${post.id}`,
          source: 'watchmates' as const,
          author: post.profile?.username || 'Anonymous',
          authorAvatar: post.profile?.avatar_url || null,
          content: post.review_text || '',
          rating: post.rating,
          createdAt: post.created_at,
          likeCount: post.like_count || 0,
          isLiked: post.is_liked || false,
          post, // Include full post object
        }));

      // Combine and sort by date (newest first)
      const allReviews = [...watchmatesUnified, ...tmdbUnified];
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allReviews;
    } catch (error) {
      console.error('Error fetching unified reviews:', error);
      return [];
    }
  },
};