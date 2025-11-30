import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import type { ProviderAvailability } from '../../services/justwatch/justwatch.service';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface WatchProvidersProps {
  providers: ProviderAvailability[];
  mediaType?: 'movie' | 'tv';
  tmdbId?: number;
}

interface ProviderItemProps {
  provider: ProviderAvailability;
  onPress: () => void;
}

// ============================================
// PROVIDER ITEM COMPONENT
// ============================================

const ProviderItem: React.FC<ProviderItemProps> = ({ provider, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.providerItem}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {/* Icon Container with Glow */}
        <View style={styles.iconWrapper}>
          <View style={styles.glowEffect} />
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: provider.logo }}
              style={styles.providerIcon}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Region Badge */}
        <View style={styles.regionBadge}>
          <Text style={styles.regionText}>{provider.region}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================
// MAIN WATCH PROVIDERS COMPONENT
// ============================================

export const WatchProviders: React.FC<WatchProvidersProps> = ({ providers }) => {
  const handlePress = (provider: ProviderAvailability) => {
    if (provider.link) {
      Linking.openURL(provider.link).catch(() => {
        fallbackSearch(provider);
      });
    } else {
      fallbackSearch(provider);
    }
  };

  const fallbackSearch = (provider: ProviderAvailability) => {
    const query = `Watch ${provider.provider} ${provider.region}`;
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
  };

  // Empty state
  if (!providers || providers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Where to Watch</Text>
        
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Text style={styles.emptyIcon}>📺</Text>
          </View>
          <Text style={styles.emptyTitle}>Not available yet</Text>
          <Text style={styles.emptySubtitle}>
            This title isn't streaming anywhere right now.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Where to Watch</Text>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={72}
        snapToAlignment="start"
        bounces={true}
        style={styles.scrollView}
      >
        {providers.map((provider, index) => (
          <ProviderItem
            key={`${provider.provider}-${provider.region}-${index}`}
            provider={provider}
            onPress={() => handlePress(provider)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================
// PREMIUM STYLES - HORIZONTAL LAYOUT
// ============================================

const styles = StyleSheet.create({
  // Container
  container: {
    marginVertical: 20,
  },

  // Section Title
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F5F5F7',
    letterSpacing: -0.4,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  // ScrollView
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 16,
  },

  // Provider Item
  providerItem: {
    alignItems: 'center',
    marginRight: 16,
  },

  // Icon Wrapper (for glow)
  iconWrapper: {
    position: 'relative',
    marginBottom: 6,
  },

  // Subtle Glow Effect
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    backgroundColor: 'rgba(123, 97, 255, 0.12)',
    opacity: 0.6,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Icon Container (56×56)
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#121016',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  providerIcon: {
    width: '100%',
    height: '100%',
  },

  // Region Badge
  regionBadge: {
    alignSelf: 'center',
    height: 20,
    backgroundColor: 'rgba(11, 10, 15, 0.85)',
    borderWidth: 1,
    borderColor: '#7B61FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  regionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    backgroundColor: '#0B0A0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9E9BA8',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5D5A6B',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
});