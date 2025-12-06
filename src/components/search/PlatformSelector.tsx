import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchFilterStore, PLATFORM_OPTIONS } from '../../store/searchFilterStore';

export const PlatformSelector: React.FC = () => {
  const { platforms, togglePlatform, platformMode, setPlatformMode } = useSearchFilterStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Streaming On</Text>
        {platforms.length > 0 && (
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, platformMode === 'any' && styles.modeButtonActive]}
              onPress={() => setPlatformMode('any')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeText, platformMode === 'any' && styles.modeTextActive]}>
                ANY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, platformMode === 'all' && styles.modeButtonActive]}
              onPress={() => setPlatformMode('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeText, platformMode === 'all' && styles.modeTextActive]}>
                ALL
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        {PLATFORM_OPTIONS.map((platform) => {
          const isSelected = platforms.includes(platform.id);
          return (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformCard, 
                isSelected && {
                  ...styles.platformCardSelected,
                  borderColor: platform.color,
                  shadowColor: platform.color,
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }
              ]}
              onPress={() => togglePlatform(platform.id)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: platform.logo }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.platformName, isSelected && styles.platformNameSelected]}>
                {platform.name}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={22} color={platform.color} />
                </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5FF',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(139,92,255,0.2)',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E6A80',
  },
  modeTextActive: {
    color: '#8B5CFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  platformCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  platformCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    // borderColor and shadowColor are dynamically set in the component
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B9B4C8',
    textAlign: 'center',
  },
  platformNameSelected: {
    color: '#F5F5FF',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});