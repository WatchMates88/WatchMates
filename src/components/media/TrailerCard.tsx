// src/components/media/TrailerCard.tsx
// Apple TV-style trailer card

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.68; // Reduced from 0.72 (more breathing room)
const CARD_HEIGHT = CARD_WIDTH * (9/16); // 16:9 aspect ratio

interface TrailerCardProps {
  videoKey: string;
  title: string;
  type?: string;
  isOfficial?: boolean;
  onPress: () => void;
}

export const TrailerCard: React.FC<TrailerCardProps> = ({
  videoKey,
  title,
  type,
  isOfficial,
  onPress,
}) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="#000000" />
          </View>
        </View>

        {isOfficial && (
          <View style={styles.officialBadge}>
            <Text style={styles.officialText}>OFFICIAL</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      
      {type && (
        <Text style={styles.type}>{type}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 16, // Increased from 12px for more breathing room
    marginBottom: 12, // Added bottom margin for visual separation
  },
  thumbnailContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 52, // Reduced from 56px (slightly smaller, less heavy)
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  officialBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  officialText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: -0.2,
  },
  type: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
});