// src/types/navigation.types.ts - COMPLETE FILE
// Updated: Welcome added to TabParamList

import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Welcome: undefined;
  Home: undefined;
  Search: undefined;
  Feed: undefined;
  Watchlist: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
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

  Reviews: {
    mediaType: 'movie' | 'tv';
    mediaId: number;
    mediaTitle: string;
  };

  Settings: undefined;
  Collections: undefined;
  CollectionDetail: { collectionId: string };
};