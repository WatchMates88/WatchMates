export interface Post {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  media_title: string;
  media_poster: string | null;
  rating: number | null;
  review_text: string;
  created_at: string;
  updated_at: string;
  
  // Joined data from queries
  profile?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  like_count?: number;
  is_liked?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}