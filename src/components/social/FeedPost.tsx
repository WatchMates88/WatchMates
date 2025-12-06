import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Post } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.75;

interface Props {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onUserPress: () => void;
  onMediaPress?: () => void;
  onImagePress: (index: number) => void;
  onOptions?: () => void;
  commentCount: number;
  isOwnPost: boolean;
}

export const FeedPost: React.FC<Props> = ({
  post,
  onLike,
  onComment,
  onUserPress,
  onMediaPress,
  onImagePress,
  onOptions,
  commentCount,
  isOwnPost,
}) => {
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onLike();
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onUserPress}>
          <Image
            source={{
              uri:
                post.profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${post.profile?.username || 'U'}&background=A78BFA&color=000`,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>
              {post.profile?.full_name || post.profile?.username}
            </Text>
            <Text style={styles.timestamp}>{formatTimeAgo(post.created_at)}</Text>
          </View>
          <Text style={styles.handle}>@{post.profile?.username || 'user'}</Text>
        </View>

        {isOwnPost && onOptions && (
          <TouchableOpacity onPress={onOptions} style={styles.optionsBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {post.review_text && post.review_text.trim() && (
          <Text style={styles.text}>{post.review_text}</Text>
        )}

        {post.images && post.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesScroll}
            decelerationRate="fast"
            snapToInterval={IMAGE_WIDTH + 8}
          >
            {post.images.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.95}
                onPress={() => onImagePress(idx)}
              >
                <Image source={{ uri }} style={styles.scrollImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {post.media_poster && (
          <TouchableOpacity style={styles.movieCard} onPress={onMediaPress} activeOpacity={0.95}>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${post.media_poster}` }}
              style={styles.moviePoster}
              resizeMode="cover"
            />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle} numberOfLines={1}>
                {post.media_title}
              </Text>
              <Text style={styles.movieType}>
                • {post.media_type === 'movie' ? 'Movie' : 'TV Show'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Heart
                size={20}
                color={post.is_liked ? '#A78BFA' : 'rgba(255,255,255,0.5)'}
                fill={post.is_liked ? '#A78BFA' : 'none'}
                strokeWidth={1.8}
              />
            </Animated.View>
            {(post.like_count || 0) > 0 && (
              <Text style={[styles.count, post.is_liked && styles.likedCount]}>
                {formatCount(post.like_count || 0)}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onComment} style={styles.actionBtn} activeOpacity={0.7}>
            <MessageCircle size={20} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
            {commentCount > 0 && <Text style={styles.count}>{formatCount(commentCount)}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Share2 size={20} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} activeOpacity={0.7}>
            <Bookmark size={20} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
    paddingRight: 16,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
  },
  handle: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  optionsBtn: {
    padding: 8,
  },

  content: {
    marginLeft: 50,
  },

  text: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
    letterSpacing: -0.1,
    marginBottom: 12,
    paddingRight: 16,
  },

  imagesScroll: {
    paddingRight: 66,
    gap: 8,
    marginBottom: 12,
  },
  scrollImage: {
    width: IMAGE_WIDTH,
    aspectRatio: 4 / 5,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  movieCard: {
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginRight: 16,
    backgroundColor: '#0A0A0A',
  },
  moviePoster: {
    width: '100%',
    aspectRatio: 1 / 1.15,
  },
  movieInfo: {
    padding: 10,
    backgroundColor: '#0A0A0A',
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  movieType: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  saveBtn: {
    marginLeft: 'auto',
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  likedCount: {
    color: '#A78BFA',
  },

  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 14,
    marginLeft: 50,
    marginRight: 16,
  },
});