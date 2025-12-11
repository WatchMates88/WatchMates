// src/hooks/useSmartRefresh.ts
// Hybrid refresh system: Auto-refresh + Pull-to-refresh
// Best of both worlds!

import { useState, useCallback } from 'react';
import { useAutoRefresh } from './useAutoRefresh';

interface UseSmartRefreshOptions {
  /**
   * Function to call when refresh is needed
   */
  onRefresh: () => Promise<void> | void;
  
  /**
   * Auto-refresh on screen focus? (default: true)
   */
  autoRefreshOnFocus?: boolean;
  
  /**
   * Global events to listen to
   */
  refreshOnEvents?: string[];
  
  /**
   * Dependencies for the refresh function
   */
  deps?: any[];
  
  /**
   * Debounce time in ms (prevent multiple refreshes)
   */
  debounceTime?: number;
}

/**
 * Smart refresh hook with automatic + manual refresh
 * 
 * Features:
 * - Auto-refreshes on screen focus
 * - Auto-refreshes on global events
 * - Manual pull-to-refresh
 * - Debouncing to prevent spam
 * - Loading states
 * 
 * @example
 * ```typescript
 * const { refreshing, onRefresh } = useSmartRefresh({
 *   onRefresh: loadWatchlist,
 *   refreshOnEvents: ['watchlist_updated'],
 *   deps: [user],
 * });
 * 
 * <FlatList
 *   refreshControl={
 *     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 *   }
 * />
 * ```
 */
export const useSmartRefresh = ({
  onRefresh,
  autoRefreshOnFocus = true,
  refreshOnEvents = [],
  deps = [],
  debounceTime = 1000,
}: UseSmartRefreshOptions) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Debounced refresh function
  const debouncedRefresh = useCallback(async () => {
    const now = Date.now();
    
    // Prevent refresh spam (within debounce time)
    if (now - lastRefreshTime < debounceTime) {
      console.log('[SmartRefresh] Debounced - too soon');
      return;
    }

    try {
      setRefreshing(true);
      setLastRefreshTime(now);
      await onRefresh();
    } catch (error) {
      console.error('[SmartRefresh] Error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, lastRefreshTime, debounceTime]);

  // Silent refresh (no loading indicator)
  const silentRefresh = useCallback(async () => {
    const now = Date.now();
    
    if (now - lastRefreshTime < debounceTime) {
      return;
    }

    try {
      setLastRefreshTime(now);
      await onRefresh();
    } catch (error) {
      console.error('[SmartRefresh] Silent error:', error);
    }
  }, [onRefresh, lastRefreshTime, debounceTime]);

  // Auto-refresh system (silent, no loading indicator)
  useAutoRefresh({
    onRefresh: silentRefresh,
    refreshOnFocus: autoRefreshOnFocus,
    refreshOnEvents,
    deps,
  });

  // Manual refresh (with loading indicator)
  const manualRefresh = useCallback(() => {
    debouncedRefresh();
  }, [debouncedRefresh]);

  return {
    refreshing,
    onRefresh: manualRefresh,
  };
};
