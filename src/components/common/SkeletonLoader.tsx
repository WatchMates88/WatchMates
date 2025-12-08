// src/components/common/SkeletonLoader.tsx
// Skeleton loading states for premium feel

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { spacing } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SkeletonType = 'post' | 'comment' | 'user' | 'search';

interface SkeletonLoaderProps {
  type: SkeletonType;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 3,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const renderPostSkeleton = () => (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Animated.View style={[styles.avatar, { opacity: shimmerOpacity }]} />
        <View style={styles.userInfo}>
          <Animated.View style={[styles.usernameSkeleton, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.handleSkeleton, { opacity: shimmerOpacity }]} />
        </View>
      </View>

      {/* Text */}
      <View style={styles.postContent}>
        <Animated.View style={[styles.textLine, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.textLine, { width: '80%', opacity: shimmerOpacity }]} />
      </View>

      {/* Image */}
      <Animated.View style={[styles.imageSkeleton, { opacity: shimmerOpacity }]} />

      {/* Actions */}
      <View style={styles.actionsSkeleton}>
        <Animated.View style={[styles.actionItem, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.actionItem, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.actionItem, { opacity: shimmerOpacity }]} />
      </View>

      <View style={styles.divider} />
    </View>
  );

  const renderCommentSkeleton = () => (
    <View style={styles.commentContainer}>
      <Animated.View style={[styles.commentAvatar, { opacity: shimmerOpacity }]} />
      <View style={styles.commentContent}>
        <Animated.View style={[styles.commentHeader, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.commentText, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.commentText, { width: '70%', opacity: shimmerOpacity }]} />
      </View>
    </View>
  );

  const renderUserSkeleton = () => (
    <View style={styles.userContainer}>
      <Animated.View style={[styles.userAvatar, { opacity: shimmerOpacity }]} />
      <View style={styles.userDetails}>
        <Animated.View style={[styles.userName, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.userHandle, { opacity: shimmerOpacity }]} />
      </View>
    </View>
  );

  const renderSearchSkeleton = () => (
    <View style={styles.searchContainer}>
      <Animated.View style={[styles.searchPoster, { opacity: shimmerOpacity }]} />
      <View style={styles.searchInfo}>
        <Animated.View style={[styles.searchTitle, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.searchMeta, { opacity: shimmerOpacity }]} />
      </View>
    </View>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'post':
        return renderPostSkeleton();
      case 'comment':
        return renderCommentSkeleton();
      case 'user':
        return renderUserSkeleton();
      case 'search':
        return renderSearchSkeleton();
    }
  };

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>{renderSkeleton()}</View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Post Skeleton
  postContainer: {
    paddingLeft: 16,
    paddingTop: 12,
  },
  postHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    paddingRight: 16,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  userInfo: {
    flex: 1,
  },
  usernameSkeleton: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 6,
  },
  handleSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  postContent: {
    marginLeft: 50,
    marginBottom: 12,
  },
  textLine: {
    width: '100%',
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 6,
  },
  imageSkeleton: {
    marginLeft: 50,
    width: SCREEN_WIDTH * 0.7,
    height: 350,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  actionsSkeleton: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 50,
    paddingVertical: 8,
  },
  actionItem: {
    width: 40,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 14,
    marginLeft: 50,
    marginRight: 16,
  },

  // Comment Skeleton
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 12,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  commentText: {
    width: '100%',
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },

  // User Skeleton
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    width: 140,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 6,
  },
  userHandle: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Search Skeleton
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  searchPoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  searchInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchTitle: {
    width: '80%',
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 6,
  },
  searchMeta: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});