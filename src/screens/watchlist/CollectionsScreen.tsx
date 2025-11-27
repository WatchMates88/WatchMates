import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore, useCollectionsStore } from '../../store';
import { collectionsService } from '../../services/supabase/collections.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Collections'>;

const EMOJI_OPTIONS = ['🎬', '🍿', '❤️', '🌟', '🔥', '😂', '😱', '🚀', '🎭', '🎪', '📚', '🎨'];
const COLOR_OPTIONS = [
  '#B8A4D4', '#FFB8C6', '#A8D8EA', '#FFD1A9', 
  '#C4E3CB', '#E6C4F5', '#FFE5B4', '#D4F1F9'
];

export const CollectionsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { collections, collaborativeCollections, isLoading, fetchCollections, fetchCollaborativeCollections, addCollection } = useCollectionsStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎬');
  const [selectedColor, setSelectedColor] = useState('#B8A4D4');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;
    await Promise.all([
      fetchCollections(user.id),
      fetchCollaborativeCollections(user.id),
    ]);
  };

  const handleCreateCollection = async () => {
    if (!user || !newName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      setCreating(true);
      const collection = await collectionsService.createCollection(
        user.id,
        newName.trim(),
        newDescription.trim() || null,
        selectedEmoji,
        selectedColor,
        isCollaborative
      );
      
      addCollection(collection);
      
      setShowCreateModal(false);
      setNewName('');
      setNewDescription('');
      setSelectedEmoji('🎬');
      setSelectedColor('#B8A4D4');
      setIsCollaborative(false);
      
      Alert.alert('Success', 'Collection created!');
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleCollectionPress = (collectionId: string) => {
    navigation.navigate('CollectionDetail', { collectionId });
  };

  const renderCollection = (collection: any, isCollab: boolean = false) => (
    <TouchableOpacity
      key={collection.id}
      style={[styles.collectionCard, { backgroundColor: collection.color + '20' }]}
      onPress={() => handleCollectionPress(collection.id)}
      activeOpacity={0.7}
    >
      <View style={styles.collectionHeader}>
        <View style={[styles.emojiContainer, { backgroundColor: collection.color + '30' }]}>
          <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
        </View>
        {isCollab && (
          <View style={styles.collabBadge}>
            <Ionicons name="people" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={styles.collectionName} numberOfLines={1}>{collection.name}</Text>
      {collection.description && (
        <Text style={styles.collectionDescription} numberOfLines={2}>
          {collection.description}
        </Text>
      )}
      <View style={styles.collectionFooter}>
        <Text style={styles.collectionCount}>
          {collection.item_count || 0} items
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view collections</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const allCollections = [...collections, ...collaborativeCollections];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* My Collections */}
        {collections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY COLLECTIONS</Text>
            <View style={styles.grid}>
              {collections.map(c => renderCollection(c, false))}
            </View>
          </View>
        )}

        {/* Collaborative Collections */}
        {collaborativeCollections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SHARED WITH ME</Text>
            <View style={styles.grid}>
              {collaborativeCollections.map(c => renderCollection(c, true))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {allCollections.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📁</Text>
            <Text style={styles.emptyTitle}>No Collections Yet</Text>
            <Text style={styles.emptySubtext}>
              Create custom lists to organize your favorite movies and shows!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Emoji Selector */}
              <Text style={styles.label}>Choose Emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.emojiOptionSelected,
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Color Selector */}
              <Text style={styles.label}>Choose Color</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              {/* Name Input */}
              <Text style={styles.label}>Collection Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Date Night Movies"
                placeholderTextColor={colors.textTertiary}
                value={newName}
                onChangeText={setNewName}
                maxLength={30}
              />

              {/* Description Input */}
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's this collection about?"
                placeholderTextColor={colors.textTertiary}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
                maxLength={150}
              />

              {/* Collaborative Toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setIsCollaborative(!isCollaborative)}
                activeOpacity={0.7}
              >
                <View style={styles.toggleInfo}>
                  <View style={styles.toggleIcon}>
                    <Ionicons name="people" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.toggleText}>
                    <Text style={styles.toggleTitle}>Collaborative</Text>
                    <Text style={styles.toggleSubtitle}>Friends can add items</Text>
                  </View>
                </View>
                <View style={[styles.toggle, isCollaborative && styles.toggleActive]}>
                  {isCollaborative && <View style={styles.toggleDot} />}
                </View>
              </TouchableOpacity>

              {/* Create Button */}
              <View style={{ marginTop: spacing.lg }}>
                <Button
                  title="Create Collection"
                  onPress={handleCreateCollection}
                  loading={creating}
                  disabled={!newName.trim()}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  collectionCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionEmoji: {
    fontSize: 28,
  },
  collabBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionName: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  collectionDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  collectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  collectionCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});