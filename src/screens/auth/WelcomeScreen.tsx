import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Content */}
      <View style={styles.content}>
        {/* Icon - Premium circular design */}
        <View style={[styles.iconContainer, {
          backgroundColor: isDark ? colors.backgroundSecondary : '#F3F0FF',
          shadowColor: colors.primary,
        }]}>
          <Text style={styles.iconEmoji}>🎬</Text>
        </View>

        {/* App Name - Premium typography */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoWatch, { color: colors.text }]}>Watch</Text>
          <Text style={[styles.logoMates, { color: colors.primary }]}>Mates</Text>
          <View style={[styles.logoDot, { backgroundColor: colors.secondary }]} />
        </View>

        {/* Subtitles */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your personal movie tracker.
        </Text>
        <Text style={[styles.description, { color: colors.textTertiary }]}>
          Simple. Social. Cinema.
        </Text>

        {/* Feature Pills - Premium cards */}
        <View style={styles.featuresContainer}>
          <View style={[styles.featurePill, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}>
            <Text style={styles.featureEmoji}>📝</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Track Watchlist</Text>
          </View>
          <View style={[styles.featurePill, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}>
            <Text style={styles.featureEmoji}>👥</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Connect Friends</Text>
          </View>
          <View style={[styles.featurePill, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}>
            <Text style={styles.featureEmoji}>⭐</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>Rate & Review</Text>
          </View>
        </View>
      </View>

      {/* Buttons - Premium style */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryActive]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, {
            borderColor: colors.border,
          }]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
            I Already Have an Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 56,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWatch: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  logoMates: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 56,
  },
  featuresContainer: {
    width: '100%',
    gap: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 26,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  buttonsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 56,
    gap: 14,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});