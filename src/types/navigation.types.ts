// src/types/navigation.types.ts - COMPLETE WITH IMAGE VIEWER

import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Feed: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;

  MainTabs: NavigatorScreenParams<TabParamList>;

  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };

  FriendProfile: { userId: string };
  SearchUsers: undefined;

  PostDetail: { postId: string };

  CreatePost: { 
    movieId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    poster: string | null;
    editPostId?: string;
    existingText?: string;
    existingRating?: number | null;
  };

  // NEW: Image Viewer
  FullScreenImageViewer: {
    images: string[];
    index: number;
  };

  Settings: undefined;
  Collections: undefined;
  CollectionDetail: { collectionId: string };
};