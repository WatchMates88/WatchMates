/**
 * Streaming Provider Service - Using TMDB Watch Providers API
 * TMDB partners with JustWatch for provider data - reliable & fast
 * Single API call per movie/show - much better than JustWatch GraphQL
 */

interface ProviderAvailability {
  provider: string;
  region: string;
  logo: string;
  link?: string;
  providerId?: number;
}

class StreamingProviderService {
  private cache: Map<string, ProviderAvailability[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 3600000; // 1 hour
  private readonly TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  /**
   * Get streaming providers using TMDB API (powered by JustWatch data)
   * Fast, reliable, single API call
   */
  async getProviders(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    regions: string[] = ['IN', 'US']
  ): Promise<ProviderAvailability[]> {
    const cacheKey = `${mediaType}-${tmdbId}-${regions.join(',')}`;

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log(`[Streaming] ✓ Returning cached data for ${mediaType} ${tmdbId}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log(`[Streaming] Fetching providers for ${mediaType} ${tmdbId}...`);
      
      // Fetch TMDB watch providers (includes JustWatch data)
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers?api_key=${this.TMDB_API_KEY}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`[Streaming] TMDB API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const results = data.results || {};

      // Collect providers from all requested regions
      const providers: ProviderAvailability[] = [];

      for (const region of regions) {
        const regionData = results[region];
        
        if (!regionData) {
          console.log(`[Streaming] No data available for ${region}`);
          continue;
        }

        // Only get streaming providers (flatrate = subscription streaming)
        const streamProviders = regionData.flatrate || [];
        const regionLink = regionData.link; // JustWatch link for this region

        for (const provider of streamProviders) {
          providers.push({
            provider: provider.provider_name,
            region: region,
            logo: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
            link: regionLink,
            providerId: provider.provider_id,
          });
        }

        console.log(`[Streaming] ${region}: ${streamProviders.length} providers found`);
      }

      // Remove duplicates (same provider in multiple regions)
      const uniqueProviders = this.deduplicateProviders(providers);
      
      console.log(`[Streaming] ✓ Total: ${uniqueProviders.length} providers across ${regions.join(', ')}`);

      // Cache results
      this.setCache(cacheKey, uniqueProviders);

      return uniqueProviders;

    } catch (error) {
      console.error('[Streaming] Error fetching providers:', error);
      return [];
    }
  }

  /**
   * Get all available providers (streaming + rent + buy)
   * Useful if you want to show rental options in the future
   */
  async getAllProviders(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    regions: string[] = ['IN', 'US']
  ): Promise<{
    streaming: ProviderAvailability[];
    rent: ProviderAvailability[];
    buy: ProviderAvailability[];
  }> {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers?api_key=${this.TMDB_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        return { streaming: [], rent: [], buy: [] };
      }

      const data = await response.json();
      const results = data.results || {};

      const streaming: ProviderAvailability[] = [];
      const rent: ProviderAvailability[] = [];
      const buy: ProviderAvailability[] = [];

      for (const region of regions) {
        const regionData = results[region];
        if (!regionData) continue;

        const regionLink = regionData.link;

        // Streaming (subscription)
        (regionData.flatrate || []).forEach((p: any) => {
          streaming.push({
            provider: p.provider_name,
            region,
            logo: `https://image.tmdb.org/t/p/original${p.logo_path}`,
            link: regionLink,
            providerId: p.provider_id,
          });
        });

        // Rent
        (regionData.rent || []).forEach((p: any) => {
          rent.push({
            provider: p.provider_name,
            region,
            logo: `https://image.tmdb.org/t/p/original${p.logo_path}`,
            link: regionLink,
            providerId: p.provider_id,
          });
        });

        // Buy
        (regionData.buy || []).forEach((p: any) => {
          buy.push({
            provider: p.provider_name,
            region,
            logo: `https://image.tmdb.org/t/p/original${p.logo_path}`,
            link: regionLink,
            providerId: p.provider_id,
          });
        });
      }

      return {
        streaming: this.deduplicateProviders(streaming),
        rent: this.deduplicateProviders(rent),
        buy: this.deduplicateProviders(buy),
      };

    } catch (error) {
      console.error('[Streaming] Error fetching all providers:', error);
      return { streaming: [], rent: [], buy: [] };
    }
  }

  /**
   * Remove duplicate providers (keep unique provider+region combinations)
   */
  private deduplicateProviders(providers: ProviderAvailability[]): ProviderAvailability[] {
    const seen = new Map<string, ProviderAvailability>();

    for (const provider of providers) {
      const key = `${provider.provider}-${provider.region}`;
      if (!seen.has(key)) {
        seen.set(key, provider);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key)) return false;

    const expiry = this.cacheExpiry.get(key);
    if (!expiry) return false;

    return Date.now() < expiry;
  }

  /**
   * Save data to cache with expiry timestamp
   */
  private setCache(key: string, data: ProviderAvailability[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear all cached data (useful for debugging or forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('[Streaming] Cache cleared');
  }

  /**
   * Get cache stats (for debugging)
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const streamingService = new StreamingProviderService();

// Keep old name for backward compatibility
export const justwatchService = streamingService;

// Export types
export type { ProviderAvailability };