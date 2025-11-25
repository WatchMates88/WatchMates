import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface UserAvatarProps {
  avatarUrl?: string | null;
  username: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  username,
  size = 48,
}) => {
  const initial = username.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.image} />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: colors.background,
    fontWeight: typography.fontWeight.bold,
  },
});
