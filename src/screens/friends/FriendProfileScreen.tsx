import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Profile, Post } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { UserAvatar } from '../../components/user/UserAvatar';
import { spacing, typography } from '../../theme';
import { friendsService } from '../../services/supabase/friends.service';
import { postsService } from '../../services/supabase/posts.service';
import { useAuthStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendProfile'>;

export const FriendProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const { colors } = useTheme();
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
      
      const profileData = await friendsService.getProfile(userId);
      setProfile(profileData);
      
      if (currentUser) {
        const following = await friendsService.isFollowing(currentUser.id, userId);
        setIsFollowing(following);
      }
      
      const [followers, following] = await Promise.all([
        friendsService.getFollowers(userId),
        friendsService.getFollowing(userId),
      ]);
      
      setFollowerCount(followers.length);
      setFollowingCount(following.length);
      
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
      style={[styles.postCard, {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
      }]}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.postReview, { color: colors.textSecondary }]} numberOfLines={3}>
        {item.review_text}
      </Text>
      
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
        <Text style={[styles.postMediaTitle, { color: colors.primary }]} numberOfLines={1}>
          {item.media_title}
        </Text>
        <Text style={[styles.postTime, { color: colors.textTertiary }]}>
          {formatTimeAgo(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <UserAvatar 
              avatarUrl={profile.avatar_url} 
              username={profile.username} 
              size={100} 
            />
          </View>

          {/* Name */}
          <Text style={[styles.displayName, { color: colors.text }]}>
            {profile.full_name || profile.username}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>
            @{profile.username}
          </Text>

          {/* Bio */}
          {profile.bio && (
            <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={3}>
              {profile.bio}
            </Text>
          )}

          {/* Follow Stats - Premium card */}
          <View style={[styles.followStats, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}>
            <View style={styles.followStat}>
              <Text style={[styles.followNumber, { color: colors.text }]}>{followerCount}</Text>
              <Text style={[styles.followLabel, { color: colors.textTertiary }]}>Followers</Text>
            </View>
            <View style={[styles.followDivider, { backgroundColor: colors.border }]} />
            <View style={styles.followStat}>
              <Text style={[styles.followNumber, { color: colors.text }]}>{followingCount}</Text>
              <Text style={[styles.followLabel, { color: colors.textTertiary }]}>Following</Text>
            </View>
          </View>

          {/* Follow Button - Premium */}
          {currentUser && currentUser.id !== profile.id && (
            <TouchableOpacity
              style={[
                styles.followButton,
                { backgroundColor: isFollowing ? colors.backgroundTertiary : colors.primary },
                isFollowing && { 
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.followButtonText,
                { color: isFollowing ? colors.text : '#FFFFFF' }
              ]}>
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Posts Section */}
          <View style={styles.postsSection}>
            <View style={styles.postsSectionHeader}>
              <Text style={[styles.postsSectionTitle, { color: colors.text }]}>Reviews</Text>
              <Text style={[styles.postsCount, { color: colors.textSecondary }]}>
                {userPosts.length}
              </Text>
            </View>

            {userPosts.length > 0 ? (
              <FlatList
                data={userPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={[styles.emptyPosts, {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              }]}>
                <Text style={styles.emptyPostsEmoji}>📭</Text>
                <Text style={[styles.emptyPostsText, { color: colors.text }]}>
                  No reviews yet
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
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  avatarWrapper: {
    marginBottom: spacing.lg,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  username: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  bio: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  followStats: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  followStat: {
    flex: 1,
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  followLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  followDivider: {
    width: 1,
  },
  followButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#8B5CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
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
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  postsCount: {
    fontSize: 15,
    fontWeight: '600',
  },
  postCard: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  postReview: {
    fontSize: typography.fontSize.sm,
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
    flex: 1,
  },
  postTime: {
    fontSize: typography.fontSize.xs,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyPostsEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyPostsText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.md,
  },
});