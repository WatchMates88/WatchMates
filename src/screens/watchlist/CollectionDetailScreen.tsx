import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Collection, CollectionItem, Movie, TVShow } from '../../types';
import { PosterGrid } from '../../components/media/PosterGrid';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { UserAvatar } from '../../components/user/UserAvatar';
import { colors, spacing, typography } from '../../theme';
import { collectionsService } from '../../services/supabase/collections.service';
import { tmdbService } from '../../services/tmdb/tmdb.service';
import { useAuthStore } from '../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'CollectionDetail'>;

export const CollectionDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { collectionId } = route.params;
  const { user } = useAuthStore();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollectionDetails();
  }, [collectionId]);

  const loadCollectionDetails = async () => {
    try {
      setLoading(true);
      
      // Get collection items
      const collectionItems = await collectionsService.getCollectionItems(collectionId);
      
      // Fetch TMDB details
      const mediaPromises = collectionItems.map(async (item: CollectionItem) => {
        try {
          if (item.media_type === 'movie') {
            return await tmdbService.getMovieDetails(item.media_id);
          } else {
            return await tmdbService.getTVShowDetails(item.media_id);
          }
        } catch (error) {
          return null;
        }
      });
      
      const mediaDetails = await Promise.all(mediaPromises);
      setItems(mediaDetails.filter(m => m !== null));
      
      // Get collaborators if collaborative
      const collabs = await collectionsService.getCollaborators(collectionId);
      setCollaborators(collabs);
      
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: Movie | TVShow) => {
    if ('title' in item) {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation.navigate('ShowDetail', { showId: item.id });
    }
  };

  const handleShare = () => {
    Alert.alert('Coming Soon', 'Share collection with friends feature coming soon!');
  };

  const handleOptions = () => {
    Alert.alert(
      'Collection Options',
      'Choose an option',
      [
        {
          text: 'Edit Collection',
          onPress: () => Alert.alert('Coming Soon', 'Edit collection coming soon!'),
        },
        {
          text: 'Manage Collaborators',
          onPress: () => Alert.alert('Coming Soon', 'Manage collaborators coming soon!'),
        },
        {
          text: 'Delete Collection',
          onPress: handleDelete,
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure? This will delete the collection and all its items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await collectionsService.deleteCollection(collectionId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete collection');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleOptions}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Collaborators */}
      {collaborators.length > 0 && (
        <View style={styles.collaboratorsSection}>
          <Text style={styles.collaboratorsLabel}>SHARED WITH</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.collaboratorsList}>
              {collaborators.map((collab) => (
                <View key={collab.id} style={styles.collaboratorItem}>
                  <UserAvatar
                    avatarUrl={collab.avatar_url}
                    username={collab.username}
                    size={32}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addCollaborator}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Items Grid */}
      {items.length > 0 ? (
        <PosterGrid 
          data={items} 
          onItemPress={handleItemPress}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>No items yet</Text>
          <Text style={styles.emptySubtext}>
            Add movies and shows from their detail pages!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collaboratorsSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  collaboratorsLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  collaboratorsList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  collaboratorItem: {
    alignItems: 'center',
  },
  addCollaborator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});