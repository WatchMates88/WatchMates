import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface WatchProvidersProps {
  providers: any;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
}

// Deep link URL schemes for streaming apps
const PROVIDER_DEEP_LINKS: { [key: number]: { ios: string; android: string; name: string } } = {
  8: { ios: 'netflix://', android: 'netflix://', name: 'Netflix' },
  119: { ios: 'aiv://', android: 'com.amazon.avod.thirdpartyclient://', name: 'Prime Video' },
  337: { ios: 'disneyplus://', android: 'https://www.disneyplus.com', name: 'Disney+' },
  350: { ios: 'videos://', android: 'https://tv.apple.com', name: 'Apple TV+' },
  384: { ios: 'max://', android: 'https://play.max.com', name: 'HBO Max' },
  2: { ios: 'videos://', android: 'https://tv.apple.com', name: 'Apple TV' },
};

export const WatchProviders: React.FC<WatchProvidersProps> = ({ providers, mediaType, tmdbId }) => {
  const regionData = providers?.results?.IN || providers?.results?.US;
  const streamProviders = regionData?.flatrate || [];
  const rentProviders = regionData?.rent || [];
  const buyProviders = regionData?.buy || [];

  const allProviders = [...streamProviders, ...rentProviders, ...buyProviders].filter(
    (provider, index, self) => 
      index === self.findIndex((p) => p.provider_id === provider.provider_id)
  );

  if (allProviders.length === 0) return null;

  const handleProviderPress = async (provider: any) => {
    const deepLink = PROVIDER_DEEP_LINKS[provider.provider_id];
    
    if (deepLink) {
      const url = Platform.OS === 'ios' ? deepLink.ios : deepLink.android;
      
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          // App not installed, search on Google
          const searchQuery = `${provider.provider_name} ${mediaType === 'movie' ? 'movie' : 'show'}`;
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          await Linking.openURL(googleUrl);
        }
      } catch (error) {
        console.error('Error opening provider:', error);
        // Fallback to Google search
        const searchQuery = `Watch on ${provider.provider_name}`;
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        await Linking.openURL(googleUrl);
      }
    } else {
      // No deep link, search on Google
      const searchQuery = `Watch on ${provider.provider_name}`;
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      await Linking.openURL(googleUrl);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where to Watch</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allProviders.map((provider: any) => (
          <TouchableOpacity
            key={provider.provider_id}
            style={styles.providerItem}
            onPress={() => handleProviderPress(provider)}
            activeOpacity={0.7}
          >
            <View style={styles.providerLogoContainer}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/original${provider.logo_path}` }}
                style={styles.providerLogo}
              />
              <View style={styles.clickIndicator}>
                <Text style={styles.clickIcon}>▶</Text>
              </View>
            </View>
            <Text style={styles.providerName} numberOfLines={1}>
              {provider.provider_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  providerItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 80,
  },
  providerLogoContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  providerLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
  },
  clickIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  clickIcon: {
    fontSize: 8,
    color: '#FFF',
  },
  providerName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});