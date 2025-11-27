import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {/* Icon - Soft Pastel Circle */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🎬</Text>
        </View>

        {/* App Name */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoWatch}>Watch</Text>
          <Text style={styles.logoMates}>Mates</Text>
          <View style={styles.logoDot} />
        </View>

        {/* Subtitles */}
        <Text style={styles.subtitle}>Your personal movie tracker.</Text>
        <Text style={styles.description}>Simple. Social. Cinema.</Text>

        {/* Feature Pills */}
        <View style={styles.featuresContainer}>
          <View style={styles.featurePill}>
            <Text style={styles.featureEmoji}>📝</Text>
            <Text style={styles.featureText}>Track Watchlist</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featureEmoji}>👥</Text>
            <Text style={styles.featureText}>Connect Friends</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featureEmoji}>⭐</Text>
            <Text style={styles.featureText}>Rate & Review</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
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
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    shadowColor: '#B8A4D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
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
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#1A1A2E',
  },
  logoMates: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#B8A4D4',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F0FF',
    marginLeft: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 48,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  buttonsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 56,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#B8A4D4',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#B8A4D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});