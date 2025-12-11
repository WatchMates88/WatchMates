// src/services/refreshEvent.service.ts
// Global event system for triggering refreshes across the app

type EventCallback = () => void;

class RefreshEventService {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to refresh events
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Trigger refresh event
   */
  emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * Clear all listeners (useful for cleanup)
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const refreshEventService = new RefreshEventService();

// Event types (type-safe)
export const RefreshEvents = {
  WATCHLIST_UPDATED: 'watchlist_updated',
  COLLECTION_UPDATED: 'collection_updated',
  POST_CREATED: 'post_created',
  POST_DELETED: 'post_deleted',
  PROFILE_UPDATED: 'profile_updated',
  FOLLOW_UPDATED: 'follow_updated',
} as const;