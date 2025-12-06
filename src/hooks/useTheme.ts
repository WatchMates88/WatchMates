// src/hooks/useTheme.ts - DARK MODE ONLY

import { darkColors } from '../theme/colors';

export const useTheme = () => {
  return {
    colors: darkColors,
    mode: 'dark' as const,
    isDark: true,
  };
};