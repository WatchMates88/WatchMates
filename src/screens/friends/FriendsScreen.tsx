import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '../../components/layout/Container';
import { UserAvatar } from '../../components/user/UserAvatar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { useFriendsStore } from '../../store';
import { useAuthStore } from '../../store';
import { Profile } from '../../types';

type Props = {
  navigation: any;
};

type TabType = 'friends' | 'following' | 'followers';

export const FriendsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { followers, following, mutuals, isLoading, fetchFollowers, fetchFollowing } = useFriendsStore();
  const [activeTab, setActiveTab] = useState<TabType>('friends');

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

  const tabs = [
    { id: 'friends' as TabType, label: 'Friends', count: mutuals.length },
    { id: 'following' as TabType, label: 'Following', count: following.length },
    { id: 'followers' as TabType, label: 'Followers', count: followers.length },
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case 'friends': return mutuals;
      case 'following': return following;
      case 'followers': return followers;
    }
  };

  const getEmptyState = () => {
    switch (activeTab) {
      case 'friends':
        return {
          emoji: '🤝',
          message: 'No mutual friends yet',
          subtext: 'Follow someone who follows you back to see them here.',
        };
      case 'following':
        return {
          emoji: '🔭',
          message: "You're not following anyone",
          subtext: 'Search for users to see their watchlist and reviews.',
        };
      case 'followers':
        return {
          emoji: '👋',
          message: 'No followers yet',
          subtext: 'Start reviewing movies to attract a crowd!',
        };
    }
  };

  const renderUserList = (users: Profile[]) => {
    if (users.length === 0) {
      const emptyState = getEmptyState();
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emojiText}>{emptyState.emoji}</Text>
          </View>
          <Text style={styles.emptyMessage}>{emptyState.message}</Text>
          <Text style={styles.emptySubtext}>{emptyState.subtext}</Text>
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
    <Container style={styles.container}>
      {/* Find Friends Button */}
      <TouchableOpacity
        style={styles.findFriendsButton}
        onPress={handleSearchPress}
        activeOpacity={0.8}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.findFriendsText}>Find Friends</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
            <Text style={[styles.tabCount, activeTab === tab.id && styles.tabCountActive]}>
              {tab.count}
            </Text>
            {activeTab === tab.id && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderUserList(getActiveData())}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  findFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  findFriendsText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEC',
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingBottom: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  tabCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  tabCountActive: {
    color: colors.text,
    opacity: 0.6,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.text,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 24,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
    marginTop: spacing.lg,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2EFF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emojiText: {
    fontSize: 40,
  },
  emptyMessage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 200,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});