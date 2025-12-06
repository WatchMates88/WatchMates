import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSearchFilterStore, RATING_OPTIONS } from '../../store/searchFilterStore';

export const RatingSelector: React.FC = () => {
  const { minRating, setMinRating } = useSearchFilterStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimum Rating</Text>
      <View style={styles.buttonRow}>
        {RATING_OPTIONS.map((option) => {
          const isSelected = minRating === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.button, isSelected && styles.buttonSelected]}
              onPress={() => setMinRating(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5FF',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minWidth: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: 'rgba(139,92,255,0.2)',
    borderColor: '#8B5CFF',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B9B4C8',
  },
  buttonTextSelected: {
    color: '#8B5CFF',
  },
});