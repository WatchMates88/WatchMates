import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };
  FriendProfile: { userId: string };
  SearchUsers: undefined;
  CreatePost: { movieId: number; mediaType: 'movie' | 'tv'; title: string; poster: string | null };
  Settings: undefined;
  Collections: undefined;
  CollectionDetail: { collectionId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Feed: undefined;
  Watchlist: undefined;
  Profile: undefined;
};