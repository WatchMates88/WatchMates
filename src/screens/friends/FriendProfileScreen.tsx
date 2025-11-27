import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Profile, Post } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { friendsService } from '../../services/supabase/friends.service';
import { postsService } from '../../services/supabase/posts.service';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendProfile'>;

export const FriendProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profileData = await friendsService.getProfile(userId);
      setProfile(profileData);
      
      // Check if following
      if (currentUser) {
        const following = await friendsService.isFollowing(currentUser.id, userId);
        setIsFollowing(following);
      }
      
      // Load follower/following counts
      const [followers, following] = await Promise.all([
        friendsService.getFollowers(userId),
        friendsService.getFollowing(userId),
      ]);
      
      setFollowerCount(followers.length);
      setFollowingCount(following.length);
      
      // Load user's posts (PUBLIC - not watchlist!)
      const posts = await postsService.getUserPosts(userId);
      setUserPosts(posts);
      
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return;

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await friendsService.unfollowUser(currentUser.id, profile.id);
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else {
        await friendsService.followUser(currentUser.id, profile.id);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostPress = (post: Post) => {
    if (post.media_type === 'movie') {
      navigation.navigate('MovieDetail', { movieId: post.media_id });
    } else {
      navigation.navigate('ShowDetail', { showId: post.media_id });
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGradient}>
              <Text style={styles.avatarLetter}>
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.displayName}>
            {profile.full_name || profile.username}
          </Text>
          <Text style={styles.username}>{profile.username}</Text>

          {/* Bio */}
          {profile.bio && (
            <Text style={styles.bio} numberOfLines={3}>{profile.bio}</Text>
          )}

          {/* Follow Stats */}
          <View style={styles.followStats}>
            <View style={styles.followStat}>
              <Text style={styles.followNumber}>{followerCount}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
            <View style={styles.followDivider} />
            <View style={styles.followStat}>
              <Text style={styles.followNumber}>{followingCount}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </View>

          {/* Follow Button */}
          {currentUser && currentUser.id !== profile.id && (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollowToggle}
              disabled={followLoading}
              activeOpacity={0.8}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Posts Section */}
          <View style={styles.postsSection}>
            <View style={styles.postsSectionHeader}>
              <Text style={styles.postsSectionTitle}>Reviews</Text>
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
                <Text style={styles.emptyPostsEmoji}>📭</Text>
                <Text style={styles.emptyPostsText}>No reviews yet</Text>
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
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  avatarWrapper: {
    marginBottom: spacing.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarLetter: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A4A58',
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
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
  followStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  followStat: {
    flex: 1,
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A4A58',
  },
  followLabel: {
    fontSize: 12,
    color: '#8E8E9A',
    marginTop: 2,
  },
  followDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  followButton: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  followingButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.text,
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
  },
  emptyPostsEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyPostsText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
  },
});