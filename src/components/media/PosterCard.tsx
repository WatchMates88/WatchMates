// src/components/media/PosterCard.tsx
// Optimized: Memoized for performance

import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie, TVShow } from '../../types';
import { GRID_COLUMNS, POSTER_ASPECT_RATIO } from '../../utils/constants';

interface PosterCardProps {
  item: Movie | TVShow;
  onPress: () => void;
}

const screenWidth = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 16;
const POSTER_MARGIN = 6;
const TOTAL_MARGIN = POSTER_MARGIN * 2 * GRID_COLUMNS;
const POSTER_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - TOTAL_MARGIN) / GRID_COLUMNS;

const PosterCardComponent: React.FC<PosterCardProps> = ({ item, onPress }) => {
  const posterPath = 'poster_path' in item ? item.poster_path : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {posterPath ? (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${posterPath}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.poster, styles.placeholder]}>
          <Ionicons name="film-outline" size={32} color="#6E6A80" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Memoize to prevent unnecessary re-renders
export const PosterCard = React.memo(PosterCardComponent);

const styles = StyleSheet.create({
  container: {
    width: POSTER_WIDTH,
    margin: POSTER_MARGIN,
  },
  poster: {
    width: '100%',
    aspectRatio: POSTER_ASPECT_RATIO,
    borderRadius: 12,
    backgroundColor: '#1A1A20',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});