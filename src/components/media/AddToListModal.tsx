// src/components/media/AddToListModal.tsx
// Butter-smooth bottom sheet with swipe-to-close

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  TextInput, // ✅ FIXED: Added TextInput import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Check, Plus, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, useCollectionsStore } from '../../store';
import { watchlistService } from '../../services/supabase/watchlist.service';
import { collectionsService } from '../../services/supabase/collections.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddToListModalProps {
  visible: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  mediaPoster: string | null;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  visible,
  onClose,
  mediaId,
  mediaType,
  mediaTitle,
}) => {
  const { user } = useAuthStore();
  const { collections, fetchCollections } = useCollectionsStore();
  
  const [inWatchlist, setInWatchlist] = useState(false);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create collection form
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Smooth slide animation
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Pan responder for swipe-to-close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5; // Only respond to downward swipes
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Swipe down far enough → close
          handleClose();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }).start();
      
      if (user) loadData();
    } else {
      // Reset position when closed
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const watchlistItem = await watchlistService.isInWatchlist(user.id, mediaId, mediaType);
      setInWatchlist(!!watchlistItem);

      await fetchCollections(user.id);

      const collectionPromises = collections.map(async (collection) => {
        const items = await collectionsService.getCollectionItems(collection.id);
        const hasItem = items.some(item => 
          item.media_id === mediaId && item.media_type === mediaType
        );
        return hasItem ? collection.id : null;
      });

      const results = await Promise.all(collectionPromises);
      setCollectionIds(results.filter(id => id !== null) as string[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setShowCreateForm(false);
      setNewName('');
    });
  };

  const handleToggleWatchlist = async () => {
    if (!user) return;

    try {
      if (inWatchlist) {
        const item = await watchlistService.isInWatchlist(user.id, mediaId, mediaType);
        if (item) {
          await watchlistService.removeFromWatchlist(item.id);
          setInWatchlist(false);
        }
      } else {
        await watchlistService.addToWatchlist(user.id, mediaId, mediaType, 'to_watch');
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      Alert.alert('Error', 'Failed to update watchlist');
    }
  };

  const handleToggleCollection = async (collectionId: string) => {
    if (!user) return;

    try {
      const isInCollection = collectionIds.includes(collectionId);

      if (isInCollection) {
        const items = await collectionsService.getCollectionItems(collectionId);
        const item = items.find(i => i.media_id === mediaId && i.media_type === mediaType);
        
        if (item) {
          await collectionsService.removeItemFromCollection(item.id);
          setCollectionIds(prev => prev.filter(id => id !== collectionId));
        }
      } else {
        await collectionsService.addItemToCollection(collectionId, mediaId, mediaType, user.id);
        setCollectionIds(prev => [...prev, collectionId]);
      }
    } catch (error) {
      console.error('Error toggling collection:', error);
      Alert.alert('Error', 'Failed to update collection');
    }
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
        null,
        '🎬',
        '#B8A4D4',
        false
      );

      // Add to this collection immediately
      await collectionsService.addItemToCollection(collection.id, mediaId, mediaType, user.id);
      
      // Refresh collections
      await fetchCollections(user.id);
      setCollectionIds(prev => [...prev, collection.id]);
      
      // Close create form
      setShowCreateForm(false);
      setNewName('');
      
      Alert.alert('Success', `Added to "${collection.name}"!`);
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {showCreateForm ? 'New Collection' : 'Add to...'}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {!showCreateForm && (
              <Text style={styles.movieTitle} numberOfLines={1}>{mediaTitle}</Text>
            )}

            {/* Content */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#8B5CFF" />
              </View>
            ) : showCreateForm ? (
              // Create Collection Form
              <View style={styles.createForm}>
                <Text style={styles.label}>Collection Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="folder-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                  {/* ✅ FIXED: Changed from <input> to <TextInput> */}
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Date Night Movies"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={newName}
                    onChangeText={setNewName}
                    autoFocus
                  />
                </View>

                <View style={styles.createFormButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowCreateForm(false);
                      setNewName('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.createButtonFinal}
                    onPress={handleCreateCollection}
                    disabled={!newName.trim() || creating}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#8B5CFF', '#A78BFA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.createGradient}
                    >
                      <Text style={styles.createButtonFinalText}>
                        {creating ? 'Creating...' : 'Create & Add'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // List Selection
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* My Watchlist */}
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={handleToggleWatchlist}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemIcon}>
                    <Ionicons name="bookmark" size={22} color="#8B5CFF" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>My Watchlist</Text>
                    <Text style={styles.listItemSubtitle}>Your personal to-watch list</Text>
                  </View>
                  {inWatchlist && (
                    <Check size={22} color="#10B981" strokeWidth={3} />
                  )}
                </TouchableOpacity>

                {/* Divider */}
                {collections.length > 0 && <View style={styles.divider} />}

                {/* Collections */}
                {collections.map((collection) => {
                  const isInCollection = collectionIds.includes(collection.id);
                  
                  return (
                    <TouchableOpacity
                      key={collection.id}
                      style={styles.listItem}
                      onPress={() => handleToggleCollection(collection.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.listItemIcon, { backgroundColor: collection.color + '20' }]}>
                        <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
                      </View>
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle}>{collection.name}</Text>
                        {collection.description && (
                          <Text style={styles.listItemSubtitle} numberOfLines={1}>
                            {collection.description}
                          </Text>
                        )}
                      </View>
                      {isInCollection && (
                        <Check size={22} color="#10B981" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Create New Collection */}
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateForm(true)}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color="#8B5CFF" strokeWidth={2.5} />
                  <Text style={styles.createButtonTextLink}>Create New Collection</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#15121F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.15)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionEmoji: {
    fontSize: 22,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  listItemSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 255, 0.3)',
    borderStyle: 'dashed',
  },
  createButtonTextLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CFF',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  
  // Create Form Styles
  createForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 14,
  },
  createFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '700',
  },
  createButtonFinal: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  createGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonFinalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});