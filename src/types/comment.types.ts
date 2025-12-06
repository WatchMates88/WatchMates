import { Profile } from './user.types';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;

  comment_text: string;

  parent_comment_id?: string | null;

  images?: string[]; // NEW - multiple images for comments

  created_at: string;
  updated_at: string;

  like_count?: number; // Optional (depends on query)
  is_liked?: boolean;  // Optional

  profile?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };

  replies?: Comment[]; // Nested replies
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface CreateCommentInput {
  userId: string;
  postId: string;
  commentText: string;
  parentCommentId?: string;
  images?: string[]; // NEW
}
