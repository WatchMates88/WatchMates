export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  isGuest?: boolean; // ← ADD THIS FIELD
  created_at?: string;
  updated_at?: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  status: 'to_watch' | 'watched';
  added_at: string;
  watched_at: string | null;
}

export interface Rating {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
}
