import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchFilterStore } from '../../store/searchFilterStore';

interface FilterButtonProps {
  variant: 'filter' | 'sort';
  onPress: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ variant, onPress }) => {
  const { getActiveFilterCount, sortBy } = useSearchFilterStore();
  const activeCount = getActiveFilterCount();
  
  // Pulse animation for badge
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (variant === 'filter' && activeCount > 0) {
      // Pulse animation when filters change
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeCount, variant]);

  if (variant === 'sort') {
    return (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={
            sortBy === 'popularity' ? 'flame' : 
            sortBy === 'rating' ? 'star' : 
            sortBy === 'votes' ? 'people' : 
            'calendar'
          } 
          size={20} 
          color="#F5F5FF" 
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="options-outline" size={20} color="#F5F5FF" />
      {activeCount > 0 && (
        <Animated.View style={[styles.badge, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="ellipse" size={8} color="#8B5CFF" />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});