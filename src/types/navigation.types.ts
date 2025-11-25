import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Friends: undefined;
  Profile: undefined;
};
