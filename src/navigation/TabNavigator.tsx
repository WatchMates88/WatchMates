// src/navigation/TabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from '../types';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { WatchlistScreen } from '../screens/watchlist/WatchlistScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useAuthStore } from '../store';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const { user } = useAuthStore();
  const isAuthenticated = user && !user.isGuest;

  console.log('[TabNavigator] Auth status:', isAuthenticated ? 'Logged In' : 'Guest/None');

  return (
    <Tab.Navigator
      initialRouteName={isAuthenticated ? "Home" : "Welcome"}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0A0A0F',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontSize: 17,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 80,
          paddingTop: 12,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: '#8B5CFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.5,
        },
      }}
    >

      {/* Welcome (Guests only) */}
      {!isAuthenticated && (
        <Tab.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'star' : 'star-outline'} size={26} color={color} />
            ),
            tabBarLabel: 'WELCOME',
          }}
        />
      )}

      {/* HOME — disable header so banner can go full width */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,    // ⭐ FIX ADDED ⭐
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
          tabBarLabel: 'HOME',
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={26} color={color} />
          ),
          tabBarLabel: 'SEARCH',
        }}
      />

      {/* Authenticated-only tabs */}
      {isAuthenticated && (
        <>
          <Tab.Screen
            name="Feed"
            component={FeedScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={26} color={color} />
              ),
              tabBarLabel: 'FEED',
            }}
          />

          <Tab.Screen
            name="Watchlist"
            component={WatchlistScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'list' : 'list-outline'} size={26} color={color} />
              ),
              tabBarLabel: 'WATCHLIST',
            }}
          />

          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={26} color={color} />
              ),
              tabBarLabel: 'PROFILE',
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};
