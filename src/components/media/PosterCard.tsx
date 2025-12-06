import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie, TVShow } from '../../types';

interface PosterCardProps {
  item: Movie | TVShow;
  onPress: () => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({ item, onPress }) => {
  const posterPath = 'poster_path' in item ? item.poster_path : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {posterPath ? (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w342${posterPath}` }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: '#1A1A20',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});