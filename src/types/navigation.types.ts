// src/types/navigation.types.ts
// Complete navigation types with TrailerPlayer

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

  FullScreenImageViewer: {
    images: string[];
    index: number;
  };

  TrailerPlayer: {
    videoKey: string;
    title?: string;
  };

  Settings: undefined;
  Collections: undefined;
  CollectionDetail: { collectionId: string };
};