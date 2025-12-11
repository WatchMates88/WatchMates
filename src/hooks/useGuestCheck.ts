// src/hooks/useGuestCheck.ts
// Helper hook to check if user is guest before actions

import { useState } from 'react';
import { useAuthStore } from '../store';

type GuestAction = 'save' | 'like' | 'review' | 'follow' | 'collect';

export const useGuestCheck = () => {
  const { user } = useAuthStore();
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptAction, setPromptAction] = useState<GuestAction>('save');

  /**
   * Check if user is guest before performing action
   * Returns true if user can proceed, false if guest
   */
  const checkGuest = (action: GuestAction): boolean => {
    if (user?.isGuest) {
      setPromptAction(action);
      setPromptVisible(true);
      return false;
    }
    return true;
  };

  const closePrompt = () => {
    setPromptVisible(false);
  };

  return {
    isGuest: user?.isGuest || false,
    promptVisible,
    promptAction,
    checkGuest,
    closePrompt,
  };
};