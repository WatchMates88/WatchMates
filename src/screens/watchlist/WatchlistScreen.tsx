import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Container } from '../../components/layout/Container';
import { PosterGrid } from '../../components/media/PosterGrid';
import { colors, spacing, typography } from '../../theme';

export const WatchlistScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'to_watch' | 'watched'>('to_watch');

  // TODO: Replace with actual watchlist data from Zustand store
  const toWatch: any[] = [];
  const watched: any[] = [];

  const data = selectedTab === 'to_watch' ? toWatch : watched;

  return (
    <Container style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'to_watch' && styles.activeTab]}
          onPress={() => setSelectedTab('to_watch')}
        >
          <Text style={[styles.tabText, selectedTab === 'to_watch' && styles.activeTabText]}>
            To Watch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'watched' && styles.activeTab]}
          onPress={() => setSelectedTab('watched')}
        >
          <Text style={[styles.tabText, selectedTab === 'watched' && styles.activeTabText]}>
            Watched
          </Text>
        </TouchableOpacity>
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
  tabContainer: {
    flexDirection: 'row',
    margin: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.background,
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
