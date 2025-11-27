import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container } from '../../components/layout/Container';
import { PosterGrid } from '../../components/media/PosterGrid';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { colors, spacing, typography } from '../../theme';

type Props = {
  navigation?: any;
};

export const WatchlistScreen: React.FC<Props> = () => {
  const [selectedTab, setSelectedTab] = useState<'to_watch' | 'watched'>('to_watch');

  const toWatch: any[] = [];
  const watched: any[] = [];

  const data = selectedTab === 'to_watch' ? toWatch : watched;

  return (
    <Container style={styles.container}>
      <View style={styles.toggleWrapper}>
        <SegmentedControl
          segments={['To Watch', 'Watched']}
          selectedIndex={selectedTab === 'to_watch' ? 0 : 1}
          onChange={(index) => setSelectedTab(index === 0 ? 'to_watch' : 'watched')}
        />
      </View>

      {data.length > 0 ? (
        <PosterGrid data={data} onItemPress={(item) => console.log(item)} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedTab === 'to_watch'
              ? 'No items in your watchlist yet'
              : "You haven't watched anything yet"}
          </Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  toggleWrapper: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});