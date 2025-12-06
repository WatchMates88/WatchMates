import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchFilterStore, LANGUAGE_OPTIONS } from '../../store/searchFilterStore';

export const LanguageSelector: React.FC = () => {
  const { languages, toggleLanguage } = useSearchFilterStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language</Text>
      <View style={styles.grid}>
        {LANGUAGE_OPTIONS.map((language) => {
          const isSelected = languages.includes(language.code);
          return (
            <TouchableOpacity
              key={language.code}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleLanguage(language.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {language.name}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={16} color="#8B5CFF" />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: 'rgba(139,92,255,0.15)',
    borderColor: '#8B5CFF',
  },
  flag: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B9B4C8',
  },
  chipTextSelected: {
    color: '#F5F5FF',
  },
});