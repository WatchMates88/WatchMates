// src/hooks/useAutoRefresh.ts
// Custom hook for automatic data refresh on screen focus + global events

import { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { refreshEventService } from '../services/refreshEvent.service';

interface UseAutoRefreshOptions {
  /**
   * Function to call when refresh is needed
   */
  onRefresh: () => void | Promise<void>;
  
  /**
   * Should refresh on screen focus? (default: true)
   */
  refreshOnFocus?: boolean;
  
  /**
   * Global events to listen to (optional)
   * Example: ['watchlist_updated', 'post_created']
   */
  refreshOnEvents?: string[];
  
  /**
   * Dependencies for the refresh function (like useEffect deps)
   */
  deps?: any[];
}

/**
 * Universal auto-refresh hook
 * 
 * Features:
 * - Refreshes when screen comes into focus
 * - Refreshes when global events are triggered
 * - Automatic cleanup
 * 
 * @example
 * ```typescript
 * useAutoRefresh({
 *   onRefresh: loadWatchlist,
 *   refreshOnEvents: ['watchlist_updated'],
 *   deps: [user],
 * });
 * ```
 */
export const useAutoRefresh = ({
  onRefresh,
  refreshOnFocus = true,
  refreshOnEvents = [],
  deps = [],
}: UseAutoRefreshOptions) => {
  
  // Memoize refresh function
  const memoizedRefresh = useCallback(() => {
    onRefresh();
  }, deps);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus) {
        memoizedRefresh();
      }
    }, [refreshOnFocus, memoizedRefresh])
  );

  // Refresh on global events
  useEffect(() => {
    if (refreshOnEvents.length === 0) return;

    const unsubscribers = refreshOnEvents.map((event) =>
      refreshEventService.subscribe(event, memoizedRefresh)
    );

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [refreshOnEvents, memoizedRefresh]);
};