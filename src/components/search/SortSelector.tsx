import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchFilterStore, SORT_OPTIONS, SortOption } from '../../store/searchFilterStore';

export const SortSelector: React.FC = () => {
  const { sortBy, setSortBy } = useSearchFilterStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort By</Text>
      <View style={styles.optionList}>
        {SORT_OPTIONS.map((option) => {
          const isSelected = sortBy === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSortBy(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color="#8B5CFF" />
              )}
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
  optionList: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionSelected: {
    backgroundColor: 'rgba(139,92,255,0.15)',
    borderColor: '#8B5CFF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B9B4C8',
  },
  optionTextSelected: {
    color: '#F5F5FF',
  },
});