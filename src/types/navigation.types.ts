import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };
  SearchUsers: undefined;
  FriendProfile: { userId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Friends: undefined;
  Profile: undefined;
};  