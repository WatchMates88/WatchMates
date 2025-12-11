// src/components/auth/SignupPromptModal.tsx
// Beautiful modal prompting guest to sign up

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface SignupPromptModalProps {
  visible: boolean;
  onClose: () => void;
  action: 'save' | 'like' | 'review' | 'follow' | 'collect';
}

const ACTION_CONFIG = {
  save: {
    icon: '📌',
    title: 'Sign up to save',
    description: 'Create a free account to build your personal watchlist',
  },
  like: {
    icon: '❤️',
    title: 'Sign up to like',
    description: 'Join the community to like and interact with posts',
  },
  review: {
    icon: '✍️',
    title: 'Sign up to review',
    description: 'Share your thoughts and rate movies with friends',
  },
  follow: {
    icon: '👥',
    title: 'Sign up to follow',
    description: 'Connect with friends and see what they are watching',
  },
  collect: {
    icon: '📁',
    title: 'Sign up to collect',
    description: 'Create custom collections and organize your favorites',
  },
} as const;

export const SignupPromptModal: React.FC<SignupPromptModalProps> = ({
  visible,
  onClose,
  action,
}) => {
  const navigation = useNavigation();
  const config = ACTION_CONFIG[action];

  const handleSignUp = () => {
    onClose();
    navigation.navigate('Signup' as never);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>

          {/* Content */}
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.description}>{config.description}</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignUp}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#8B5CFF', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.signupButtonText}>Create Free Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#15121F',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.2)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  signupButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#8B5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 15,
    fontWeight: '600',
  },
});