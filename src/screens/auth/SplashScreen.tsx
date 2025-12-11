// src/screens/auth/SplashScreen.tsx
// Clean: Just "Watch" + "Mates" slide in and join (no pre-show)

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const watchAnim = useRef(new Animated.Value(-300)).current;
  const matesAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wait 0.8s, then animate
    const startDelay = setTimeout(() => {
      Animated.parallel([
        // Slide words in
        Animated.spring(watchAnim, {
          toValue: 0,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(matesAnim, {
          toValue: 0,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Navigate after 2.8 seconds total
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Gradient Orbs */}
      <View style={styles.gradientOrb1} />
      <View style={styles.gradientOrb2} />

      {/* Animated Text */}
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.textWatch,
            { transform: [{ translateX: watchAnim }] }
          ]}
        >
          Watch
        </Animated.Text>
        <Animated.Text
          style={[
            styles.textMates,
            { transform: [{ translateX: matesAnim }] }
          ]}
        >
          Mates
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOrb1: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 255, 0.12)',
    opacity: 0.6,
  },
  gradientOrb2: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    opacity: 0.5,
  },
  textContainer: {
    flexDirection: 'row',
  },
  textWatch: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  textMates: {
    fontSize: 52,
    fontWeight: '800',
    color: '#8B5CFF',
    letterSpacing: -2,
  },
});