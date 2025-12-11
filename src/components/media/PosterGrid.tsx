// src/components/media/PosterGrid.tsx
// Optimized: Performance props + memoized renderItem

import React, { useCallback } from 'react';
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
  // Memoize renderItem to prevent recreation on every render
  const renderItem = useCallback(
    ({ item }: { item: Movie | TVShow }) => (
      <PosterCard item={item} onPress={() => onItemPress(item)} />
    ),
    [onItemPress]
  );

  // Memoize keyExtractor
  const keyExtractor = useCallback(
    (item: Movie | TVShow) => item.id.toString(),
    []
  );

  return (
    <FlatList
      data={data}
      numColumns={GRID_COLUMNS}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={50}
      initialNumToRender={12}
      windowSize={7}
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