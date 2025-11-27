class JustWatchService {
  // JustWatch doesn't have a public API
  // We'll use TMDB's watch provider data which is comprehensive enough
  // This service is here for future expansion if you get JustWatch API access
  
  async getEnhancedProviders(tmdbProviders: any, mediaType: 'movie' | 'tv'): Promise<any> {
    // For now, just return TMDB providers
    // In future, you could add additional provider data here
    return tmdbProviders;
  }

  // Helper to get all unique providers from TMDB data
  getUniqueProviders(providers: any): any[] {
    const regionData = providers?.results?.IN || providers?.results?.US;
    
    if (!regionData) return [];

    const streamProviders = regionData?.flatrate || [];
    const rentProviders = regionData?.rent || [];
    const buyProviders = regionData?.buy || [];

    // Combine all and remove duplicates
    const allProviders = [...streamProviders, ...rentProviders, ...buyProviders];
    
    return allProviders.filter(
      (provider, index, self) => 
        index === self.findIndex((p) => p.provider_id === provider.provider_id)
    );
  }

  // Deep link configuration for streaming apps
  getProviderDeepLink(providerId: number): { ios: string; android: string } | null {
    const deepLinks: { [key: number]: { ios: string; android: string } } = {
      8: { ios: 'netflix://', android: 'netflix://' },
      119: { ios: 'aiv://', android: 'com.amazon.avod.thirdpartyclient://' },
      337: { ios: 'hotstar://', android: 'hotstar://' },
      546: { ios: 'jiocinema://', android: 'jiocinema://' },
      1796: { ios: 'sonyliv://', android: 'sonyliv://' },
      2049: { ios: 'zee5://', android: 'zee5://' },
      350: { ios: 'videos://', android: 'https://tv.apple.com' },
      1955: { ios: 'videos://', android: 'https://tv.apple.com' },
      1899: { ios: 'max://', android: 'https://play.max.com' },
      384: { ios: 'max://', android: 'https://play.max.com' },
    };

    return deepLinks[providerId] || null;
  }
}

export const justwatchService = new JustWatchService();