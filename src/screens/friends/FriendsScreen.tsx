import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Container } from '../../components/layout/Container';
import { UserAvatar } from '../../components/user/UserAvatar';
import { FollowButton } from '../../components/user/FollowButton';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { colors, spacing, typography } from '../../theme';

// Dummy friends data - will be replaced with real data later
const dummyFriends = [
  { id: '1', username: 'john_doe', full_name: 'John Doe', avatar_url: null },
  { id: '2', username: 'jane_smith', full_name: 'Jane Smith', avatar_url: null },
  { id: '3', username: 'mike_wilson', full_name: 'Mike Wilson', avatar_url: null },
];

export const FriendsScreen: React.FC = () => {
  const handleFollowToggle = (userId: string) => {
    // TODO: Implement follow/unfollow logic with friendsService
    console.log('Toggle follow for user:', userId);
  };

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile
    console.log('View user profile:', userId);
  };

  return (
    <Container>
      <SectionHeader title="Friends" />
      
      <FlatList
        data={dummyFriends}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendCard}
            onPress={() => handleUserPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.friendInfo}>
              <UserAvatar
                avatarUrl={item.avatar_url}
                username={item.username}
                size={48}
              />
              <View style={styles.friendDetails}>
                <Text style={styles.friendName}>{item.full_name || item.username}</Text>
                <Text style={styles.friendUsername}>@{item.username}</Text>
              </View>
            </View>
            <FollowButton
              isFollowing={true}
              onPress={() => handleFollowToggle(item.id)}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends yet. Start following people!</Text>
          </View>
        }
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  friendName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  friendUsername: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
