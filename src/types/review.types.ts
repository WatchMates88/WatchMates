// src/types/review.types.ts

import { Post } from './post.types';

export interface TMDBReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface UnifiedReview {
  id: string;
  source: 'watchmates' | 'tmdb';
  author: string;
  authorAvatar: string | null;
  content: string;
  rating: number | null;
  createdAt: string;
  likeCount?: number;
  isLiked?: boolean;
  post?: Post; // Full post object if source is WatchMates
}