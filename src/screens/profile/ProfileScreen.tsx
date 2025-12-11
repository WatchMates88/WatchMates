// src/screens/profile/ProfileScreen.tsx
// Complete with Guest Mode UI

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { spacing, typography } from '../../theme';
import { useAuthStore, usePostsStore, useFriendsStore } from '../../store';
import { UserAvatar } from '../../components/user/UserAvatar';
import { Post, Profile } from '../../types';
import { authService } from '../../services/supabase/auth.service';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  navigation?: any;
};

type FriendsView = 'none' | 'friends' | 'followers' | 'following';

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useAuthStore();
  const { colors } = useTheme();
  const { userPosts, fetchUserPosts } = usePostsStore();
  const { followers, following, mutuals, fetchFollowers, fetchFollowing } = useFriendsStore();
  
  const [friendsView, setFriendsView] = useState<FriendsView>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user && !user.isGuest) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user || user.isGuest) return;

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

  const uploadPhoto = async (uri: string) => {
    if (!user || user.isGuest) return;

    try {
      setUploadingPhoto(true);
      await authService.uploadAvatar(user.id, uri);
      
      const updatedProfile = await authService.getProfile(user.id);
      if (updatedProfile) {
        setUser(updatedProfile);
      }
      
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant permissions');
      return;
    }

    Alert.alert('Profile Picture', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
          if (cameraStatus.status !== 'granted') {
            Alert.alert('Permission Needed', 'Camera permission needed');
            return;
          }
          
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            await uploadPhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            await uploadPhoto(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUserPress = (profile: Profile) => {
    setFriendsView('none');
    setSearchQuery('');
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
      case 'friends': users = mutuals; break;
      case 'followers': users = followers; break;
      case 'following': users = following; break;
      default: return [];
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
      style={[styles.postCard, { 
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
      }]} 
      onPress={() => handlePostPress(item)} 
      activeOpacity={0.7}
    >
      <Text style={[styles.postReview, { color: colors.textSecondary }]} numberOfLines={3}>{item.review_text}</Text>
      {item.rating && (
        <View style={styles.postRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name={star <= item.rating! ? 'star' : 'star-outline'} size={12} color="#FFD700" />
          ))}
        </View>
      )}
      <View style={styles.postMeta}>
        <Text style={[styles.postMediaTitle, { color: colors.primary }]} numberOfLines={1}>{item.media_title}</Text>
        <Text style={[styles.postTime, { color: colors.textTertiary }]}>{formatTimeAgo(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity 
      style={[styles.userCard, { 
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
      }]} 
      onPress={() => handleUserPress(item)} 
      activeOpacity={0.7}
    >
      <UserAvatar avatarUrl={item.avatar_url} username={item.username} size={48} />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.full_name || item.username}</Text>
        <Text style={[styles.userUsername, { color: colors.textSecondary }]}>@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </TouchableOpacity>
  );

  // GUEST MODE UI
  if (user?.isGuest) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.guestContainer}>
          <View style={styles.guestIcon}>
            <Text style={styles.guestEmoji}>🎬</Text>
          </View>
          
          <Text style={styles.guestTitle}>Create Your Account</Text>
          <Text style={styles.guestSubtitle}>
            Unlock all features and join the community
          </Text>

          <View style={styles.guestFeatures}>
            <View style={styles.guestFeature}>
              <Text style={styles.featureIcon}>📌</Text>
              <Text style={styles.featureText}>Build your watchlist</Text>
            </View>
            <View style={styles.guestFeature}>
              <Text style={styles.featureIcon}>✍️</Text>
              <Text style={styles.featureText}>Write and share reviews</Text>
            </View>
            <View style={styles.guestFeature}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Follow friends</Text>
            </View>
            <View style={styles.guestFeature}>
              <Text style={styles.featureIcon}>📁</Text>
              <Text style={styles.featureText}>Create collections</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.guestSignupButton}
            onPress={() => navigation?.navigate('Signup')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#8B5CFF', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.guestGradientButton}
            >
              <Text style={styles.guestSignupText}>Create Free Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestLoginButton}
            onPress={() => navigation?.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestLoginText}>
              Already have an account? <Text style={styles.guestLoginAccent}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Please login</Text>
        </View>
      </View>
    );
  }

  if (friendsView !== 'none') {
    const filteredUsers = getFilteredUsers();
    const title = friendsView === 'friends' ? 'Friends' : friendsView === 'followers' ? 'Followers' : 'Following';

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.listHeader, { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity onPress={() => { setFriendsView('none'); setSearchQuery(''); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.listTitle, { color: colors.text }]}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
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
              <Text style={[styles.emptyUsersText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No users found' : `No ${title.toLowerCase()} yet`}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.headerButton, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border 
          }]} 
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.headerButton, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border 
          }]} 
          onPress={handleSettings}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        <View style={styles.content}>
          <View style={styles.avatarWrapper}>
            {uploadingPhoto ? (
              <View style={[styles.avatarLoading, { backgroundColor: colors.backgroundSecondary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <UserAvatar 
                avatarUrl={user.avatar_url} 
                username={user.username} 
                size={110} 
              />
            )}
            <TouchableOpacity 
              style={[styles.editBadge, { 
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.background 
              }]} 
              onPress={handleUploadPhoto}
              disabled={uploadingPhoto}
            >
              <Ionicons name="camera" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.displayName, { color: colors.text }]}>{user.full_name || user.username}</Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{user.username}</Text>

          {user.bio ? (
            <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={3}>{user.bio}</Text>
          ) : (
            <Text style={[styles.bioPlaceholder, { color: colors.textTertiary }]} numberOfLines={3}>
              Cinema lover. Sci-fi enthusiast. Always looking for the next hidden gem. 🎥 ✨
            </Text>
          )}

          <View style={[styles.followStatsCard, { 
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}>
            <TouchableOpacity style={styles.followStat} onPress={() => setFriendsView('friends')}>
              <Text style={[styles.followNumber, { color: colors.text }]}>{mutuals.length}</Text>
              <Text style={[styles.followLabel, { color: colors.textTertiary }]}>FRIENDS</Text>
            </TouchableOpacity>
            <View style={[styles.followDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.followStat} onPress={() => setFriendsView('followers')}>
              <Text style={[styles.followNumber, { color: colors.text }]}>{followers.length}</Text>
              <Text style={[styles.followLabel, { color: colors.textTertiary }]}>FOLLOWERS</Text>
            </TouchableOpacity>
            <View style={[styles.followDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.followStat} onPress={() => setFriendsView('following')}>
              <Text style={[styles.followNumber, { color: colors.text }]}>{following.length}</Text>
              <Text style={[styles.followLabel, { color: colors.textTertiary }]}>FOLLOWING</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postsSection}>
            <View style={styles.postsSectionHeader}>
              <Text style={[styles.postsSectionTitle, { color: colors.text }]}>My Reviews</Text>
              <Text style={[styles.postsCount, { color: colors.textSecondary }]}>{userPosts.length}</Text>
            </View>

            {userPosts.length > 0 ? (
              <FlatList data={userPosts} renderItem={renderPost} keyExtractor={(item) => item.id} scrollEnabled={false} />
            ) : (
              <View style={[styles.emptyPosts, { 
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              }]}>
                <Text style={styles.emptyPostsEmoji}>✍️</Text>
                <Text style={[styles.emptyPostsText, { color: colors.text }]}>No reviews yet</Text>
                <Text style={[styles.emptyPostsSubtext, { color: colors.textSecondary }]}>Watch something and share your thoughts!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // GUEST MODE STYLES
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  guestIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.2)',
  },
  guestEmoji: { fontSize: 60 },
  guestTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  guestSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  guestFeatures: {
    width: '100%',
    marginBottom: 40,
    gap: 12,
  },
  guestFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureIcon: { fontSize: 22, marginRight: 14 },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  guestSignupButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#8B5CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  guestGradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  guestSignupText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  guestLoginButton: { paddingVertical: 12 },
  guestLoginText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  guestLoginAccent: {
    color: '#A78BFA',
    fontWeight: '700',
  },
  
  // REGULAR PROFILE STYLES
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.md, 
    paddingBottom: spacing.sm, 
    zIndex: 100 
  },
  headerButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
  },
  content: { 
    alignItems: 'center', 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.md,
  },
  avatarWrapper: { marginBottom: spacing.md, position: 'relative' },
  avatarLoading: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2,
  },
  displayName: { 
    fontSize: 22, 
    fontWeight: '600', 
    marginBottom: 4, 
    letterSpacing: -0.3 
  },
  username: { 
    fontSize: 15, 
    fontWeight: '400', 
    marginBottom: spacing.md 
  },
  bio: { 
    fontSize: typography.fontSize.sm, 
    textAlign: 'center', 
    lineHeight: 20, 
    maxWidth: 280, 
    marginBottom: spacing.lg 
  },
  bioPlaceholder: { 
    fontSize: typography.fontSize.sm, 
    textAlign: 'center', 
    lineHeight: 20, 
    maxWidth: 280, 
    marginBottom: spacing.lg, 
    fontStyle: 'italic' 
  },
  followStatsCard: { 
    flexDirection: 'row', 
    borderRadius: 20, 
    padding: spacing.lg, 
    marginBottom: spacing.xl, 
    width: '100%', 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  followStat: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  followNumber: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  followLabel: { 
    fontSize: 10, 
    fontWeight: '600', 
    letterSpacing: 0.8,
  },
  followDivider: { width: 1 },
  postsSection: { width: '100%', marginTop: spacing.md },
  postsSectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.md, 
    paddingHorizontal: 4 
  },
  postsSectionTitle: { 
    fontSize: 17, 
    fontWeight: '600',
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
    marginBottom: spacing.sm 
  },
  postRating: { flexDirection: 'row', gap: 2, marginBottom: spacing.sm },
  postMeta: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  postMediaTitle: { 
    fontSize: typography.fontSize.xs, 
    fontWeight: '600', 
    flex: 1 
  },
  postTime: { fontSize: typography.fontSize.xs },
  emptyPosts: { 
    alignItems: 'center', 
    paddingVertical: spacing.xxl, 
    borderRadius: 20, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyPostsEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyPostsText: { 
    fontSize: typography.fontSize.md, 
    fontWeight: '600', 
    marginBottom: spacing.xs 
  },
  emptyPostsSubtext: { 
    fontSize: typography.fontSize.sm, 
    textAlign: 'center' 
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.fontSize.md },
  listHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.md, 
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontSize: 18, fontWeight: '600' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: spacing.md, 
    marginVertical: spacing.md, 
    borderRadius: 12, 
    paddingHorizontal: spacing.md 
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { 
    flex: 1, 
    paddingVertical: spacing.md, 
    fontSize: typography.fontSize.md,
  },
  userList: { padding: spacing.md },
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 16, 
    padding: spacing.lg, 
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  userInfo: { flex: 1, marginLeft: spacing.md },
  userName: { fontSize: typography.fontSize.md, fontWeight: '600' },
  userUsername: { fontSize: typography.fontSize.sm, marginTop: 2 },
  emptyUsers: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyUsersText: { fontSize: typography.fontSize.md },
});