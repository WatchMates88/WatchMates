// src/screens/auth/WelcomeScreen.tsx
// Fixed Layout: Proper spacing, no cutoff

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store';
import { tmdbService } from '../../services/tmdb/tmdb.service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const POSTER_WIDTH = 110;
const POSTER_HEIGHT = 165;
const POSTER_MARGIN = 10;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.95)).current;
  const button1Anim = useRef(new Animated.Value(0)).current;
  const button2Anim = useRef(new Animated.Value(0)).current;
  
  const { setUser } = useAuthStore();
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    loadTrendingPosters();
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 35,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(100, [
        Animated.timing(button1Anim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(button2Anim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -(POSTER_WIDTH + POSTER_MARGIN) * 20,
        duration: 50000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const loadTrendingPosters = async () => {
    try {
      const movies = await tmdbService.getTrendingMovies('week');
      const posterPaths = movies
        .filter(m => m.poster_path)
        .slice(0, 20)
        .map(m => `https://image.tmdb.org/t/p/w342${m.poster_path}`);
      
      setPosters([...posterPaths, ...posterPaths, ...posterPaths]);
    } catch (error) {
      console.error('Error loading posters:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Rolling Posters Background */}
      <View style={styles.postersSection}>
        <Animated.View style={[styles.posterRow, { transform: [{ translateX: scrollX }] }]}>
          {posters.map((uri, index) => (
            <Image key={`r1-${index}`} source={{ uri }} style={styles.poster} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.posterRow, { transform: [{ translateX: Animated.multiply(scrollX, 0.7) }] }]}>
          {posters.map((uri, index) => (
            <Image key={`r2-${index}`} source={{ uri }} style={styles.poster} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.posterRow, { transform: [{ translateX: Animated.multiply(scrollX, 0.5) }] }]}>
          {posters.map((uri, index) => (
            <Image key={`r3-${index}`} source={{ uri }} style={styles.poster} />
          ))}
        </Animated.View>
        
        <LinearGradient
          colors={['rgba(10, 10, 15, 0.2)', 'rgba(10, 10, 15, 0.85)', '#0A0A0F']}
          locations={[0, 0.55, 0.92]}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Content Section - Fixed Layout */}
      <View style={styles.contentSection}>
        <Animated.View 
          style={[
            styles.logoArea,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }, { scale: logoScale }]
            }
          ]}
        >
          <Text style={styles.appName}>
            Watch<Text style={styles.appNameAccent}>Mates</Text>
          </Text>
          <Text style={styles.tagline}>
            Track the movies you love. Discover what to watch next.
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons Area */}
        <View style={styles.buttonsArea}>
          <Animated.View style={{ opacity: button1Anim }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Signup' as never)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#8B5CFF', '#A78BFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: button2Anim }}>
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkAccent}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  
  // Posters Section
  postersSection: {
    height: SCREEN_HEIGHT * 0.52,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  posterRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 8,
    marginRight: POSTER_MARGIN,
    backgroundColor: '#1A1A20',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Content Section - NO space-between, manual control
  contentSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 110, // Enough space from bottom tabs
  },
  
  // Logo Area
  logoArea: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.6,
    marginBottom: 16,
    textAlign: 'center',
  },
  appNameAccent: {
    color: '#8B5CFF',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  
  // Flexible spacer
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  
  // Buttons Area
  buttonsArea: {
    gap: 18,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  loginLink: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginLinkAccent: {
    color: '#A78BFA',
    fontWeight: '700',
  },
});