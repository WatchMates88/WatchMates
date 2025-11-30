import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation';
import { useAuthStore, useThemeStore } from './src/store';
import { authService } from './src/services/supabase/auth.service';
import { supabase } from './src/services/supabase/supabase.client';
import { useTheme } from './src/hooks/useTheme';

export default function App() {
  const { setUser, setLoading } = useAuthStore();
  const { loadTheme } = useThemeStore();
  const { colors, isDark } = useTheme();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Initialize app
    initializeApp();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          // User logged in
          try {
            const profile = await authService.getProfile(session.user.id);
            setUser(profile);
          } catch (error) {
            console.error('Error loading profile:', error);
            setUser(null);
          }
        } else {
          // User logged out
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Load theme from storage
      await loadTheme();
      
      // Check auth state
      const user = await authService.getCurrentUser();
      
      if (user) {
        try {
          const profile = await authService.getProfile(user.id);
          setUser(profile);
        } catch (error) {
          console.log('No profile found for user, will create on first action');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // Session missing is expected when not logged in
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  // Show loading screen while checking auth
  if (initializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style={isDark ? "light" : "auto"} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});