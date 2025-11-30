import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { spacing, typography } from '../../theme';
import { useAuthStore, useCollectionsStore } from '../../store';
import { collectionsService } from '../../services/supabase/collections.service';
import { useTheme } from '../../hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Collections'>;

const EMOJI_OPTIONS = [
  '🎬', '🍿', '❤️', '🌟', '🔥', '😂', '😱', '🚀', 
  '🎭', '🎪', '📚', '🎨', '🎵', '💀', '👻', '🦸',
  '🧙', '🤖', '👽', '🐉', '🦄', '🌈', '⚡', '💫',
  '🎃', '🎄', '🎁', '🎂', '🍕', '🌮', '🍜', '☕',
];

const COLOR_OPTIONS = [
  '#B8A4D4', '#FFB8C6', '#A8D8EA', '#FFD1A9', 
  '#C4E3CB', '#E6C4F5', '#FFE5B4', '#D4F1F9',
  '#FFC1CC', '#E0BBE4', '#FFDAB9', '#B0E0E6',
];

export const CollectionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
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

  const handleEditCollection = (collection: any) => {
    Alert.alert('Coming Soon', 'Edit collection feature coming soon!');
  };

  const renderCollection = (collection: any, isCollab: boolean = false) => (
    <TouchableOpacity
      key={collection.id}
      style={[styles.collectionCard, { 
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
      }]}
      onPress={() => handleCollectionPress(collection.id)}
      onLongPress={() => handleEditCollection(collection)}
      activeOpacity={0.7}
    >
      <View style={styles.collectionHeader}>
        <View style={[styles.emojiContainer, { backgroundColor: collection.color + '25' }]}>
          <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
        </View>
        {isCollab && (
          <View style={[styles.collabBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="people" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={[styles.collectionName, { color: colors.text }]} numberOfLines={1}>
        {collection.name}
      </Text>
      {collection.description && (
        <Text style={[styles.collectionDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {collection.description}
        </Text>
      )}
      <View style={styles.collectionFooter}>
        <Text style={[styles.collectionCount, { color: colors.textTertiary }]}>0 items</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.icon} />
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Please login</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const allCollections = [...collections, ...collaborativeCollections];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {collections.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>MY COLLECTIONS</Text>
            <View style={styles.grid}>
              {collections.map(c => renderCollection(c, false))}
            </View>
          </View>
        )}

        {collaborativeCollections.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SHARED WITH ME</Text>
            <View style={styles.grid}>
              {collaborativeCollections.map(c => renderCollection(c, true))}
            </View>
          </View>
        )}

        {allCollections.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📁</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Collections Yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Create custom lists to organize your favorite movies and shows!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Premium FAB with glow */}
      <TouchableOpacity 
        style={[styles.fab, { 
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        }]} 
        onPress={() => setShowCreateModal(true)}
      >
        <View style={[styles.fabGlow, { backgroundColor: colors.fabGlow }]} />
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Modal - Premium */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Collection</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.text }]}>Choose Emoji</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.emojiGrid}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiOption, 
                        { backgroundColor: colors.backgroundTertiary },
                        selectedEmoji === emoji && [
                          styles.emojiOptionSelected,
                          { 
                            borderColor: colors.primary,
                            backgroundColor: colors.primary + '20' 
                          }
                        ]
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <Text style={styles.emojiOptionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={[styles.label, { color: colors.text }]}>Choose Color</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption, 
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Collection Name</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                }]}
                placeholder="e.g., Date Night Movies"
                placeholderTextColor={colors.textTertiary}
                value={newName}
                onChangeText={setNewName}
                maxLength={30}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                }]}
                placeholder="What's this collection about?"
                placeholderTextColor={colors.textTertiary}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
                maxLength={150}
              />

              <TouchableOpacity 
                style={[styles.toggleRow, {
                  backgroundColor: colors.backgroundTertiary,
                }]} 
                onPress={() => setIsCollaborative(!isCollaborative)}
              >
                <View style={styles.toggleInfo}>
                  <View style={[styles.toggleIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="people" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.toggleText}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>Collaborative</Text>
                    <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                      Friends can add items
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.toggle, 
                  { backgroundColor: isCollaborative ? colors.primary : colors.border }
                ]}>
                  <View style={[
                    styles.toggleDot,
                    { 
                      alignSelf: isCollaborative ? 'flex-end' : 'flex-start',
                    }
                  ]} />
                </View>
              </TouchableOpacity>

              <View style={{ marginTop: spacing.xl }}>
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
  container: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { 
    fontSize: typography.fontSize.xs, 
    fontWeight: '700', 
    letterSpacing: 1.2, 
    marginBottom: spacing.md, 
    paddingHorizontal: spacing.xs 
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  collectionCard: { 
    width: '48%', 
    borderRadius: 20, 
    padding: spacing.lg, 
    marginBottom: spacing.md, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  collectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: spacing.md 
  },
  emojiContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  collectionEmoji: { fontSize: 30 },
  collabBadge: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  collectionName: { 
    fontSize: typography.fontSize.md, 
    fontWeight: '700', 
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  collectionDescription: { 
    fontSize: typography.fontSize.xs, 
    lineHeight: 16, 
    marginBottom: spacing.sm 
  },
  collectionFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  collectionCount: { 
    fontSize: typography.fontSize.xs, 
    fontWeight: '600' 
  },
  emptyState: { 
    alignItems: 'center', 
    paddingTop: 100, 
    paddingHorizontal: spacing.xl 
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.lg },
  emptyTitle: { 
    fontSize: typography.fontSize.xl, 
    fontWeight: '700', 
    marginBottom: spacing.sm 
  },
  emptySubtext: { 
    fontSize: typography.fontSize.sm, 
    textAlign: 'center', 
    lineHeight: 20 
  },
  fab: { 
    position: 'absolute', 
    bottom: 24, 
    right: 24, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.36, 
    shadowRadius: 16, 
    elevation: 12,
    overflow: 'visible',
  },
  fabGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.18,
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    padding: spacing.xl, 
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.2)',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.lg 
  },
  modalTitle: { 
    fontSize: typography.fontSize.xxl, 
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: { 
    fontSize: typography.fontSize.sm, 
    fontWeight: '700', 
    marginBottom: spacing.sm, 
    marginTop: spacing.lg,
    letterSpacing: 0.2,
  },
  emojiGrid: { 
    flexDirection: 'row', 
    gap: spacing.sm, 
    paddingVertical: spacing.xs 
  },
  emojiOption: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  emojiOptionSelected: {
    borderWidth: 2,
  },
  emojiOptionText: { fontSize: 26 },
  colorGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.sm 
  },
  colorOption: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    borderWidth: 3, 
    borderColor: 'transparent' 
  },
  colorOptionSelected: { 
    borderColor: '#FFFFFF', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6, 
    elevation: 4 
  },
  input: { 
    borderRadius: 16, 
    padding: spacing.lg, 
    fontSize: typography.fontSize.md, 
    borderWidth: 1,
  },
  textArea: { 
    height: 90, 
    textAlignVertical: 'top' 
  },
  toggleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderRadius: 16, 
    padding: spacing.lg, 
    marginTop: spacing.md 
  },
  toggleInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  toggleIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: spacing.md 
  },
  toggleText: { flex: 1 },
  toggleTitle: { 
    fontSize: typography.fontSize.md, 
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  toggleSubtitle: { 
    fontSize: typography.fontSize.xs, 
    marginTop: 2 
  },
  toggle: { 
    width: 52, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    padding: 3 
  },
  toggleDot: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: { 
    fontSize: typography.fontSize.md 
  },
});