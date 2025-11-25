import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions, View, Text } from 'react-native';
import { Movie, TVShow } from '../../types';
import { colors, spacing } from '../../theme';
import { POSTER_ASPECT_RATIO } from '../../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 4) / 3;
const CARD_HEIGHT = CARD_WIDTH / POSTER_ASPECT_RATIO;

interface PosterCardProps {
  item: Movie | TVShow;
  onPress: () => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({ item, onPress }) => {
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null;

  const title = 'title' in item ? item.title : item.name;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  placeholderText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
  },
});
