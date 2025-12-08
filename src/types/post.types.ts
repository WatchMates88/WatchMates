export interface Post {
  id: string;
  user_id: string;

  media_id: number;
  media_type: 'movie' | 'tv';
  media_title: string;
  media_poster: string | null;

  rating: number | null;
  review_text: string;

  images?: string[];   // Multiple attached images

  created_at: string;
  updated_at: string;

  like_count?: number;    // Optional
  is_liked?: boolean;     // Optional
  comment_count?: number; // NEW - Comment count for this post

  profile?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}