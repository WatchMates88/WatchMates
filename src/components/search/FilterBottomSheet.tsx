import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchFilterStore } from '../../store/searchFilterStore';
import { GenreSelector } from './GenreSelector';
import { YearRangeSlider } from './YearRangeSlider';
import { RatingSelector } from './RatingSelector';
import { PlatformSelector } from './PlatformSelector';
import { LanguageSelector } from './LanguageSelector';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

export const FilterBottomSheet: React.FC = () => {
  const {
    isFilterSheetOpen,
    setFilterSheetOpen,
    resetFilters,
    hasActiveFilters,
    contentType,
    setContentType,
  } = useSearchFilterStore();

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFilterSheetOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFilterSheetOpen]);

  const handleClose = () => {
    setFilterSheetOpen(false);
  };

  const handleReset = () => {
    resetFilters();
  };

  if (!isFilterSheetOpen) return null;

  return (
    <Modal
      visible={isFilterSheetOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="options-outline" size={24} color="#F5F5FF" />
              <Text style={styles.headerTitle}>Filters</Text>
            </View>
            <View style={styles.headerRight}>
              {hasActiveFilters() && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#F5F5FF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Content Type Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content Type</Text>
              <View style={styles.contentTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.contentTypeButton,
                    contentType === 'all' && styles.contentTypeButtonActive,
                  ]}
                  onPress={() => setContentType('all')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.contentTypeText,
                      contentType === 'all' && styles.contentTypeTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.contentTypeButton,
                    contentType === 'movie' && styles.contentTypeButtonActive,
                  ]}
                  onPress={() => setContentType('movie')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.contentTypeText,
                      contentType === 'movie' && styles.contentTypeTextActive,
                    ]}
                  >
                    Movies
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.contentTypeButton,
                    contentType === 'tv' && styles.contentTypeButtonActive,
                  ]}
                  onPress={() => setContentType('tv')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.contentTypeText,
                      contentType === 'tv' && styles.contentTypeTextActive,
                    ]}
                  >
                    TV Shows
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Genre Selector */}
            <GenreSelector />

            <View style={styles.divider} />

            {/* Year Range */}
            <YearRangeSlider />

            <View style={styles.divider} />

            {/* Rating */}
            <RatingSelector />

            <View style={styles.divider} />

            {/* Platforms */}
            <PlatformSelector />

            <View style={styles.divider} />

            {/* Languages */}
            <LanguageSelector />

            <View style={styles.divider} />

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#0E0E12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5FF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,255,0.15)',
    borderWidth: 1,
    borderColor: '#8B5CFF',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CFF',
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,255,0.15)',
    borderWidth: 1,
    borderColor: '#8B5CFF',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5FF',
    marginBottom: 12,
  },
  contentTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contentTypeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  contentTypeButtonActive: {
    backgroundColor: 'rgba(139,92,255,0.2)',
    borderColor: '#8B5CFF',
  },
  contentTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B9B4C8',
  },
  contentTypeTextActive: {
    color: '#8B5CFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0E0E12',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CFF',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#8B5CFF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});