import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSearchFilterStore, DECADE_OPTIONS } from '../../store/searchFilterStore';

export const YearRangeSlider: React.FC = () => {
  const { yearRange, setYearRange } = useSearchFilterStore();
  const [minYear, maxYear] = yearRange;

  const handleDecadeSelect = (start: number, end: number) => {
    setYearRange([start, end]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Release Year</Text>
      
      {/* Year Display */}
      <View style={styles.yearDisplay}>
        <Text style={styles.yearText}>{minYear}</Text>
        <Text style={styles.separator}>—</Text>
        <Text style={styles.yearText}>{maxYear}</Text>
      </View>

      {/* Dual Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>From</Text>
          <Slider
            style={styles.slider}
            minimumValue={1990}
            maximumValue={maxYear}
            step={1}
            value={minYear}
            onValueChange={(value) => setYearRange([Math.floor(value), maxYear])}
            minimumTrackTintColor="#8B5CFF"
            maximumTrackTintColor="rgba(255,255,255,0.15)"
            thumbTintColor="#8B5CFF"
          />
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>To</Text>
          <Slider
            style={styles.slider}
            minimumValue={minYear}
            maximumValue={2025}
            step={1}
            value={maxYear}
            onValueChange={(value) => setYearRange([minYear, Math.floor(value)])}
            minimumTrackTintColor="#8B5CFF"
            maximumTrackTintColor="rgba(255,255,255,0.15)"
            thumbTintColor="#8B5CFF"
          />
        </View>
      </View>

      {/* Decade Quick Filters */}
      <Text style={styles.subtitle}>Quick Select</Text>
      <View style={styles.decadeRow}>
        {DECADE_OPTIONS.map((decade) => (
          <TouchableOpacity
            key={decade.label}
            style={styles.decadeChip}
            onPress={() => handleDecadeSelect(decade.start, decade.end)}
            activeOpacity={0.7}
          >
            <Text style={styles.decadeEmoji}>{decade.emoji}</Text>
            <Text style={styles.decadeText}>{decade.label}</Text>
          </TouchableOpacity>
        ))}
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
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B9B4C8',
    marginBottom: 10,
    marginTop: 8,
  },
  yearDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,92,255,0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CFF',
  },
  separator: {
    fontSize: 18,
    color: '#6E6A80',
  },
  sliderContainer: {
    gap: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B9B4C8',
    width: 40,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  decadeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  decadeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  decadeEmoji: {
    fontSize: 14,
  },
  decadeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B9B4C8',
  },
});