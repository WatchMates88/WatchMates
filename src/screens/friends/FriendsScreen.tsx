import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '../../components/layout/Container';
import { UserAvatar } from '../../components/user/UserAvatar';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';
import { useFriendsStore } from '../../store';
import { useAuthStore } from '../../store';
import { Profile } from '../../types';

type Props = {
  navigation: any;
};

export const FriendsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { followers, following, mutuals, isLoading, fetchFollowers, fetchFollowing } = useFriendsStore();

  useEffect(() => {
    if (user) {
      loadFriendsData();
    }
  }, [user]);

  const loadFriendsData = async () => {
    if (!user) return;
    
    await Promise.all([
      fetchFollowers(user.id),
      fetchFollowing(user.id),
    ]);
  };

  const handleUserPress = (profile: Profile) => {
    navigation.navigate('FriendProfile', { userId: profile.id });
  };

  const handleSearchPress = () => {
    navigation.navigate('SearchUsers');
  };

  const renderUserList = (users: Profile[], emptyMessage: string) => {
    if (users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    return users.map((profile) => (
      <TouchableOpacity
        key={profile.id}
        style={styles.userCard}
        onPress={() => handleUserPress(profile)}
        activeOpacity={0.7}
      >
        <View style={styles.userInfo}>
          <UserAvatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size={48}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{profile.full_name || profile.username}</Text>
            <Text style={styles.userUsername}>@{profile.username}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ));
  };

  if (!user) {
    return (
      <Container>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to see friends</Text>
        </View>
      </Container>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Find Friends Button */}
        <View style={styles.searchButtonContainer}>
          <Button
            title="🔍 Find Friends"
            onPress={handleSearchPress}
            variant="primary"
          />
        </View>

        {/* Friends (Mutuals) Section */}
        <View style={styles.section}>
          <SectionHeader title={`Friends (${mutuals.length})`} />
          {renderUserList(mutuals, 'No mutual friends yet. Follow someone who follows you back!')}
        </View>

        {/* Following Section */}
        <View style={styles.section}>
          <SectionHeader title={`Following (${following.length})`} />
          {renderUserList(following, 'Not following anyone yet')}
        </View>

        {/* Followers Section */}
        <View style={styles.section}>
          <SectionHeader title={`Followers (${followers.length})`} />
          {renderUserList(followers, 'No followers yet')}
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  searchButtonContainer: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  userUsername: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chevron: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});