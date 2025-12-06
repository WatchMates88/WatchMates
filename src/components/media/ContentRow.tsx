import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../theme';

interface ContentRowProps {
  title: string;
  subtitle?: string; // e.g., "Updated 3 days ago", "5 people you follow"
  data: any[];
  onItemPress: (item: any) => void;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
  platformLogo?: string; // Optional platform logo URL
  accentColor?: string; // Arrow color for platform rows
  emptyMessage?: string; // Show when data is empty
}

const PosterCard = React.memo(({ item, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const posterUri = item.poster_path 
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.posterCard, { transform: [{ scale: scaleAnim }] }]}>
        {posterUri ? (
          <Image
            key={`${item.tmdb_id || item.id}-poster`}
            source={{ uri: posterUri }}
            style={styles.poster}
            resizeMode="cover"
            fadeDuration={0}
          />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={32} color="#6E6A80" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.tmdb_id === nextProps.item.tmdb_id;
});

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  data,
  onItemPress,
  onSeeAll,
  showSeeAll = false,
  platformLogo,
  accentColor = '#8B5CFF',
  emptyMessage,
}) => {
  // Don't render if no data and no empty message
  if (data.length === 0 && !emptyMessage) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {platformLogo && (
            <Image
              source={{ uri: platformLogo }}
              style={styles.platformLogo}
              resizeMode="contain"
            />
          )}
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {showSeeAll && onSeeAll && data.length > 0 && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
            <Ionicons name="arrow-forward" size={22} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {data.map((item, index) => (
            <PosterCard
              key={item.tmdb_id || item.id || index}
              item={item}
              onPress={() => onItemPress(item)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={40} color="#6E6A80" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#F5F5FF',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6A80',
    marginTop: 2,
  },
  seeAllButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  posterCard: {
    width: 120,
    // Shadows temporarily disabled for testing
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#1A1A20',
    overflow: 'hidden',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6E6A80',
    marginTop: 12,
    textAlign: 'center',
  },
});