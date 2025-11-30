import { Profile } from './user.types';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  comment_text: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  profile?: Profile;
  like_count?: number;
  is_liked?: boolean;
  
  // For nested replies
  replies?: Comment[];
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
}