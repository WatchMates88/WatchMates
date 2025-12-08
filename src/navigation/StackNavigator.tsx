// src/navigation/StackNavigator.tsx
// Cleaned - Removed TrailerPlayer modal

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';

import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

import { MovieDetailScreen } from '../screens/details/MovieDetailScreen';
import { ShowDetailScreen } from '../screens/details/ShowDetailScreen';

import { FriendProfileScreen } from '../screens/friends/FriendProfileScreen';
import { SearchUsersScreen } from '../screens/friends/SearchUsersScreen';

import { CreatePostScreen } from '../screens/feed/CreatePostScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { FullScreenImageViewer } from '../screens/feed/FullScreenImageViewer';
import { TrailerPlayerModal } from '../screens/media/TrailerPlayerModal';

import { SettingsScreen } from '../screens/profile/SettingsScreen';

import { CollectionsScreen } from '../screens/watchlist/CollectionsScreen';
import { CollectionDetailScreen } from '../screens/watchlist/CollectionDetailScreen';

import { useAuthStore } from '../store';
import { useTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { colors } = useTheme();

  if (isLoading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '600', fontSize: 17 },
        headerTintColor: colors.icon,
        headerShadowVisible: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />

          {/* Details Screens */}
          <Stack.Screen
            name="MovieDetail"
            component={MovieDetailScreen}
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="ShowDetail"
            component={ShowDetailScreen}
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />

          {/* Social */}
          <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: 'Profile' }} />
          <Stack.Screen name="SearchUsers" component={SearchUsersScreen} options={{ title: 'Find Friends' }} />

          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{
              title: 'Write Review',
              presentation: 'modal',
            }}
          />

          <Stack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            options={{ headerShown: false }}
          />

          {/* Full-screen Image Viewer */}
          <Stack.Screen
            name="FullScreenImageViewer"
            component={FullScreenImageViewer}
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />

          {/* Trailer Player */}
          <Stack.Screen
            name="TrailerPlayer"
            component={TrailerPlayerModal}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />

          {/* Settings */}
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />

          {/* Collections */}
          <Stack.Screen name="Collections" component={CollectionsScreen} options={{ title: 'Collections' }} />
          <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} options={{ title: 'Collection' }} />
        </>
      )}
    </Stack.Navigator>
  );
};