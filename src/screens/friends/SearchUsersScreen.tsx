import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Profile } from '../../types';
import { Container } from '../../components/layout/Container';
import { SearchBar } from '../../components/search/SearchBar';
import { UserAvatar } from '../../components/user/UserAvatar';
import { FollowButton } from '../../components/user/FollowButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { spacing, typography } from '../../theme';
import { friendsService } from '../../services/supabase/friends.service';
import { useAuthStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchUsers'>;

export const SearchUsersScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (text.length > 2) {
      const timeout = setTimeout(async () => {
        try {
          setLoading(true);
          const results = await friendsService.searchProfiles(text);
          
          const filtered = results.filter(r => r.id !== user?.id);
          setSearchResults(filtered);
          
          if (user) {
            const following = await friendsService.getFollowing(user.id);
            const followingSet = new Set(following.map(f => f.id));
            setFollowingIds(followingSet);
          }
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setLoading(false);
        }
      }, 500);
      
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  };

  const handleFollowToggle = async (targetUser: Profile) => {
    if (!user) return;

    try {
      const isFollowing = followingIds.has(targetUser.id);
      
      if (isFollowing) {
        await friendsService.unfollowUser(user.id, targetUser.id);
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUser.id);
          return newSet;
        });
      } else {
        await friendsService.followUser(user.id, targetUser.id);
        setFollowingIds(prev => new Set(prev).add(targetUser.id));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUserPress = (profile: Profile) => {
    navigation.navigate('FriendProfile', { userId: profile.id });
  };

  return (
    <Container>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search users by username..."
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userCard, {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              }]}
              onPress={() => handleUserPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.userInfo}>
                <UserAvatar
                  avatarUrl={item.avatar_url}
                  username={item.username}
                  size={52}
                />
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {item.full_name || item.username}
                  </Text>
                  <Text style={[styles.userUsername, { color: colors.textSecondary }]}>
                    @{item.username}
                  </Text>
                  {item.bio && (
                    <Text style={[styles.userBio, { color: colors.textTertiary }]} numberOfLines={1}>
                      {item.bio}
                    </Text>
                  )}
                </View>
              </View>
              <FollowButton
                isFollowing={followingIds.has(item.id)}
                onPress={() => handleFollowToggle(item)}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={
            searchQuery.length > 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No users found
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Search for users by username
                </Text>
              </View>
            )
          }
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  userUsername: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  userBio: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
    lineHeight: 16,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
});