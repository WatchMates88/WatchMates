import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Container } from '../../components/layout/Container';
import { UserAvatar } from '../../components/user/UserAvatar';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';

export const ProfileScreen: React.FC = () => {
  // TODO: Get user data from auth store
  const user = {
    username: 'demo_user',
    full_name: 'Demo User',
    bio: 'Movie enthusiast and TV show addict 🎬',
    avatar_url: null,
  };

  // TODO: Get stats from stores
  const stats = {
    watchlist: 0,
    watched: 0,
    ratings: 0,
    friends: 0,
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleLogout = () => {
    // TODO: Implement logout with authService
    console.log('Logout');
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <UserAvatar
            avatarUrl={user.avatar_url}
            username={user.username}
            size={100}
          />
          <Text style={styles.name}>{user.full_name || user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.watchlist}</Text>
            <Text style={styles.statLabel}>Watchlist</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.watched}</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.ratings}</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Edit Profile" onPress={handleEditProfile} variant="primary" />
          <View style={{ height: spacing.md }} />
          <Button title="Logout" onPress={handleLogout} variant="outline" />
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  username: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
  },
});
