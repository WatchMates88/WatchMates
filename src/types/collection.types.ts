export interface Collection {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_collaborative: boolean;
  emoji: string;
  color: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  item_count?: number;
  collaborators?: string[];
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  added_by: string;
  created_at: string;
}

export interface CollectionCollaborator {
  id: string;
  collection_id: string;
  user_id: string;
  created_at: string;
}