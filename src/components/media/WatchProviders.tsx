// src/components/media/WatchProviders.tsx
// Smart Provider Opening with Expo Go detection

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
  Platform,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';
import type { ProviderAvailability } from '../../services/justwatch/justwatch.service';
import { getProviderScheme, getProviderWebUrl } from '../../utils/providerUrls';

interface WatchProvidersProps {
  providers: ProviderAvailability[];
  mediaType?: 'movie' | 'tv';
  tmdbId?: number;
}

interface GroupedProvider {
  provider: string;
  logo: string;
  regions: string[];
  link?: string;
}

interface ProviderItemProps {
  groupedProvider: GroupedProvider;
  onPress: () => void;
}

const ProviderItem: React.FC<ProviderItemProps> = ({ groupedProvider, onPress }) => {
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
        <View style={styles.iconWrapper}>
          <View style={styles.glowEffect} />
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: groupedProvider.logo }}
              style={styles.providerIcon}
              resizeMode="cover"
            />
          </View>
        </View>

        <Text style={styles.regionsText}>
          {groupedProvider.regions.join(', ')}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const WatchProviders: React.FC<WatchProvidersProps> = ({ 
  providers, 
  mediaType = 'movie',
  tmdbId 
}) => {
  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  const groupedProviders = React.useMemo(() => {
    const groups = new Map<string, GroupedProvider>();

    providers.forEach((provider) => {
      if (groups.has(provider.provider)) {
        const existing = groups.get(provider.provider)!;
        if (!existing.regions.includes(provider.region)) {
          existing.regions.push(provider.region);
        }
      } else {
        groups.set(provider.provider, {
          provider: provider.provider,
          logo: provider.logo,
          regions: [provider.region],
          link: provider.link,
        });
      }
    });

    return Array.from(groups.values());
  }, [providers]);

  const handlePress = async (groupedProvider: GroupedProvider) => {
    console.log(`[Provider] Opening ${groupedProvider.provider}...`);
    console.log(`[Provider] Expo Go mode: ${isExpoGo}`);

    // If in Expo Go, always use web URLs (deep links don't work)
    if (isExpoGo) {
      console.log(`[Provider] Using web fallback (Expo Go limitation)`);
      const webUrl = getProviderWebUrl(groupedProvider.provider);
      
      if (webUrl) {
        try {
          await Linking.openURL(webUrl);
          console.log(`[Provider] ✅ Opened ${groupedProvider.provider} website`);
        } catch (error) {
          console.error('[Provider] Failed to open web URL:', error);
          Alert.alert('Error', 'Could not open provider website');
        }
      } else {
        fallbackSearch(groupedProvider);
      }
      return;
    }

    // For standalone builds, try deep links
    const scheme = getProviderScheme(groupedProvider.provider, tmdbId, mediaType);

    if (scheme) {
      try {
        const appUrl = scheme.app;
        
        console.log(`[Provider] Trying app deep link: ${appUrl}`);
        
        // Check if the URL can be opened (app is installed)
        const canOpen = await Linking.canOpenURL(appUrl);
        
        if (canOpen) {
          await Linking.openURL(appUrl);
          console.log(`[Provider] ✅ Opened ${groupedProvider.provider} app`);
        } else {
          throw new Error('App not installed');
        }
      } catch (error) {
        // App not installed - show install prompt
        console.log(`[Provider] ${groupedProvider.provider} not installed`);
        
        Alert.alert(
          `Get ${groupedProvider.provider}`,
          `Install ${groupedProvider.provider} to watch this content`,
          [
            { 
              text: 'Open Website', 
              onPress: async () => {
                const webUrl = getProviderWebUrl(groupedProvider.provider);
                if (webUrl) {
                  await Linking.openURL(webUrl);
                }
              }
            },
            {
              text: 'Install App',
              onPress: async () => {
                const storeUrl = Platform.OS === 'ios' ? scheme.ios : scheme.android;
                if (storeUrl) {
                  try {
                    await Linking.openURL(storeUrl);
                  } catch (err) {
                    console.error('Failed to open store:', err);
                    Alert.alert('Error', 'Could not open app store');
                  }
                }
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } else {
      // No scheme available - fallback to web
      console.warn(`[Provider] No scheme for ${groupedProvider.provider}, using web fallback`);
      const webUrl = getProviderWebUrl(groupedProvider.provider);
      
      if (webUrl) {
        await Linking.openURL(webUrl);
      } else {
        fallbackSearch(groupedProvider);
      }
    }
  };

  const fallbackSearch = (groupedProvider: GroupedProvider) => {
    const query = `Watch on ${groupedProvider.provider}`;
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
  };

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
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Where to Watch</Text>
        {isExpoGo && (
          <Text style={styles.expoGoNotice}>Opens in browser (Expo Go)</Text>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={80}
        snapToAlignment="start"
        bounces={true}
        style={styles.scrollView}
      >
        {groupedProviders.map((groupedProvider, index) => (
          <ProviderItem
            key={`${groupedProvider.provider}-${index}`}
            groupedProvider={groupedProvider}
            onPress={() => handlePress(groupedProvider)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F5F5F7',
    letterSpacing: -0.4,
  },
  expoGoNotice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CFF',
    backgroundColor: 'rgba(139, 92, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 20,
  },
  providerItem: {
    alignItems: 'center',
    width: 70,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
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
  regionsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9BA8',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
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