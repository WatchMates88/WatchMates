import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore, usePostsStore, useFriendsStore } from '../../store';
import { UserAvatar } from '../../components/user/UserAvatar';
import { Post, Profile } from '../../types';

type Props = {
  navigation?: any;
};

type FriendsView = 'none' | 'friends' | 'followers' | 'following';

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { userPosts, fetchUserPosts } = usePostsStore();
  const { followers, following, mutuals, fetchFollowers, fetchFollowing } = useFriendsStore();
  
  const [friendsView, setFriendsView] = useState<FriendsView>('none');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        fetchFollowers(user.id),
        fetchFollowing(user.id),
        fetchUserPosts(user.id),
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleSettings = () => {
    navigation?.navigate('Settings');
  };

  const handleShare = () => {
    console.log('Share profile');
  };

  const handleUserPress = (profile: Profile) => {
    navigation?.navigate('FriendProfile', { userId: profile.id });
  };

  const handlePostPress = (post: Post) => {
    if (post.media_type === 'movie') {
      navigation?.navigate('MovieDetail', { movieId: post.media_id });
    } else {
      navigation?.navigate('ShowDetail', { showId: post.media_id });
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const getFilteredUsers = () => {
    let users: Profile[] = [];
    
    switch (friendsView) {
      case 'friends':
        users = mutuals;
        break;
      case 'followers':
        users = followers;
        break;
      case 'following':
        users = following;
        break;
      default:
        return [];
    }

    if (searchQuery.trim()) {
      return users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return users;
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.postReview} numberOfLines={3}>{item.review_text}</Text>
      
      {item.rating && (
        <View style={styles.postRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating! ? 'star' : 'star-outline'}
              size={12}
              color="#FFD700"
            />
          ))}
        </View>
      )}
      
      <View style={styles.postMeta}>
        <Text style={styles.postMediaTitle} numberOfLines={1}>{item.media_title}</Text>
        <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <UserAvatar avatarUrl={item.avatar_url} username={item.username} size={48} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name || item.username}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view your profile</Text>
        </View>
      </View>
    );
  }

  // Show Friends List View
  if (friendsView !== 'none') {
    const filteredUsers = getFilteredUsers();
    const title = friendsView === 'friends' ? 'Friends' : friendsView === 'followers' ? 'Followers' : 'Following';

    return (
      <View style={styles.container}>
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={() => setFriendsView('none')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.listTitle}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.userList}
          ListEmptyComponent={
            <View style={styles.emptyUsers}>
              <Text style={styles.emptyUsersText}>
                {searchQuery ? 'No users found' : `No ${title.toLowerCase()} yet`}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  // Main Profile View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleSettings} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGradient}>
              <Text style={styles.avatarLetter}>
                {(user.full_name || user.username).charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBadge} activeOpacity={0.7}>
              <Ionicons name="camera" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>{user.full_name || user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>

          {user.bio ? (
            <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>
          ) : (
            <Text style={styles.bioPlaceholder} numberOfLines={3}>
              Cinema lover. Sci-fi enthusiast. Always looking for the next hidden gem. 🎥 ✨
            </Text>
          )}

          {/* Friends Stats - 3 columns clickable */}
          <View style={styles.followStatsCard}>
            <TouchableOpacity 
              style={styles.followStat}
              onPress={() => setFriendsView('friends')}
              activeOpacity={0.7}
            >
              <Text style={styles.followNumber}>{mutuals.length}</Text>
              <Text style={styles.followLabel}>FRIENDS</Text>
            </TouchableOpacity>
            
            <View style={styles.followDivider} />
            
            <TouchableOpacity 
              style={styles.followStat}
              onPress={() => setFriendsView('followers')}
              activeOpacity={0.7}
            >
              <Text style={styles.followNumber}>{followers.length}</Text>
              <Text style={styles.followLabel}>FOLLOWERS</Text>
            </TouchableOpacity>
            
            <View style={styles.followDivider} />
            
            <TouchableOpacity 
              style={styles.followStat}
              onPress={() => setFriendsView('following')}
              activeOpacity={0.7}
            >
              <Text style={styles.followNumber}>{following.length}</Text>
              <Text style={styles.followLabel}>FOLLOWING</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postsSection}>
            <View style={styles.postsSectionHeader}>
              <Text style={styles.postsSectionTitle}>My Reviews</Text>
              <Text style={styles.postsCount}>{userPosts.length}</Text>
            </View>

            {userPosts.length > 0 ? (
              <FlatList
                data={userPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyPosts}>
                <Text style={styles.emptyPostsEmoji}>✍️</Text>
                <Text style={styles.emptyPostsText}>No reviews yet</Text>
                <Text style={styles.emptyPostsSubtext}>
                  Watch something and share your thoughts!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
  },
  avatarWrapper: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarLetter: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A4A58',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E9A',
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.fontSize.sm,
    color: '#8E8E9A',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  bioPlaceholder: {
    fontSize: typography.fontSize.sm,
    color: '#B8B8C8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  followStatsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  followStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  followNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A4A58',
    marginBottom: 4,
  },
  followLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E9A',
    letterSpacing: 0.5,
  },
  followDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  postsSection: {
    width: '100%',
    marginTop: spacing.md,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  postsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A58',
  },
  postsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  postCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  postReview: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  postRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: spacing.sm,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postMediaTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  postTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptyPostsEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyPostsText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyPostsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
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
  // Friends List View Styles
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  userList: {
    padding: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  userUsername: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyUsers: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyUsersText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});