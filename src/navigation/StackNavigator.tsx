// src/navigation/StackNavigator.tsx
// Updated: Splash → MainTabs (with Welcome tab)

import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';

import { SplashScreen } from '../screens/auth/SplashScreen';
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
import { ReviewsScreen } from '../screens/reviews/ReviewsScreen';

import { SettingsScreen } from '../screens/profile/SettingsScreen';

import { CollectionsScreen } from '../screens/watchlist/CollectionsScreen';
import { CollectionDetailScreen } from '../screens/watchlist/CollectionDetailScreen';

import { useAuthStore } from '../store';
import { useTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
  const { user, isLoading } = useAuthStore();
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 3.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return null;

  // Show splash on first load
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

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
      {/* Main Tabs - Always Show (includes Welcome for guests) */}
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />

      {/* Auth Screens (Modal style) */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />

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
      <Stack.Screen 
        name="FriendProfile" 
        component={FriendProfileScreen} 
        options={{ title: 'Profile' }} 
      />
      <Stack.Screen 
        name="SearchUsers" 
        component={SearchUsersScreen} 
        options={{ title: 'Find Friends' }} 
      />

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

      {/* Reviews */}
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: 'Reviews' }}
      />

      {/* Settings */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />

      {/* Collections */}
      <Stack.Screen 
        name="Collections" 
        component={CollectionsScreen} 
        options={{ title: 'Collections' }} 
      />
      <Stack.Screen 
        name="CollectionDetail" 
        component={CollectionDetailScreen} 
        options={{ title: 'Collection' }} 
      />
    </Stack.Navigator>
  );
};