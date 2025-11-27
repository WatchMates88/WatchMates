import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Profile, WatchlistItem, Movie, TVShow } from '../../types';
import { Container } from '../../components/layout/Container';
import { UserAvatar } from '../../components/user/UserAvatar';
import { FollowButton } from '../../components/user/FollowButton';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, spacing, typography } from '../../theme';
import { friendsService } from '../../services/supabase/friends.service';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendProfile'>;

export const FriendProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<(Movie | TVShow)[]>([]);
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
      
      // Load watchlist
      const watchlist = await watchlistService.getWatchlist(userId);
      
      // Fetch TMDB details for each item
      const mediaPromises = watchlist.map(async (item: WatchlistItem) => {
        try {
          if (item.media_type === 'movie') {
            return await tmdbService.getMovieDetails(item.media_id);
          } else {
            return await tmdbService.getTVShowDetails(item.media_id);
          }
        } catch (error) {
          console.error('Error loading media:', error);
          return null;
        }
      });
      
      const mediaDetails = await Promise.all(mediaPromises);
      const validMedia = mediaDetails.filter(m => m !== null);
      setWatchlistItems(validMedia);
      
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
      } else {
        await friendsService.followUser(currentUser.id, profile.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleItemPress = (item: Movie | TVShow) => {
    if ('title' in item) {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation.navigate('ShowDetail', { showId: item.id });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <UserAvatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size={100}
          />
          <Text style={styles.name}>{profile.full_name || profile.username}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          
          {/* Follow Button */}
          {currentUser && currentUser.id !== profile.id && (
            <View style={styles.followButtonContainer}>
              <FollowButton
                isFollowing={isFollowing}
                onPress={handleFollowToggle}
                loading={followLoading}
              />
            </View>
          )}
        </View>

        {/* Watchlist Section */}
        <View style={styles.watchlistSection}>
          <SectionHeader title="Watchlist" />
          
          {watchlistItems.length > 0 ? (
            <PosterGrid 
              data={watchlistItems} 
              onItemPress={handleItemPress}
            />
          ) : (
            <View style={styles.emptyWatchlist}>
              <Text style={styles.emptyText}>No items in watchlist yet</Text>
            </View>
          )}
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
  followButtonContainer: {
    marginTop: spacing.lg,
    width: 200,
  },
  watchlistSection: {
    marginTop: spacing.lg,
  },
  emptyWatchlist: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
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