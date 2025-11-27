import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { MovieDetailScreen } from '../screens/details/MovieDetailScreen';
import { ShowDetailScreen } from '../screens/details/ShowDetailScreen';
import { SearchUsersScreen } from '../screens/friends/SearchUsersScreen';
import { FriendProfileScreen } from '../screens/friends/FriendProfileScreen';
import { colors } from '../theme';
import { useAuthStore } from '../store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTintColor: colors.text,
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: 'Sign Up', headerBackTitle: 'Back' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MovieDetail"
            component={MovieDetailScreen}
            options={{ title: 'Movie Details' }}
          />
          <Stack.Screen
            name="ShowDetail"
            component={ShowDetailScreen}
            options={{ title: 'Show Details' }}
          />
          <Stack.Screen
            name="SearchUsers"
            component={SearchUsersScreen}
            options={{ title: 'Find Friends' }}
          />
          <Stack.Screen
            name="FriendProfile"
            component={FriendProfileScreen}
            options={{ title: 'Profile' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};