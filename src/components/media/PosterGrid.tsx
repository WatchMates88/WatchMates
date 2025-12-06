import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Movie, TVShow } from '../../types';
import { PosterCard } from './PosterCard';
import { spacing } from '../../theme';
import { GRID_COLUMNS } from '../../utils/constants';

interface PosterGridProps {
  data: (Movie | TVShow)[];
  onItemPress: (item: Movie | TVShow) => void;
  ListHeaderComponent?: React.ReactElement;
}

export const PosterGrid: React.FC<PosterGridProps> = ({
  data,
  onItemPress,
  ListHeaderComponent,
}) => {
  return (
    <FlatList
      data={data}
      numColumns={GRID_COLUMNS}
      renderItem={({ item }) => (
        <PosterCard item={item} onPress={() => onItemPress(item)} />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
});