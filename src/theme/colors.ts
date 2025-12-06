// src/theme/colors.ts - DARK MODE ONLY

export interface Colors {
  primary: string;
  primaryActive: string;
  primaryDark: string;
  primaryLight: string;
  primaryBorder: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  card: string;
  cardBorder: string;
  inputBackground: string;
  toggleContainer: string;
  toggleActivePill: string;
  toggleActivePillGradientStart: string;
  toggleActivePillGradientEnd: string;
  toggleGlow: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  icon: string;
  iconInactive: string;
  genreCardBg: string;
  genreGlows: {
    action: string;
    adventure: string;
    animation: string;
    comedy: string;
    crime: string;
    documentary: string;
    drama: string;
    family: string;
    fantasy: string;
    history: string;
    horror: string;
    music: string;
    mystery: string;
    romance: string;
    sciFi: string;
    thriller: string;
    war: string;
    western: string;
  };
  border: string;
  borderLight: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  overlay: string;
  overlayLight: string;
  fabGlow: string;
  fabHalo: string;
}

// Dark Theme - Premium Apple Style (ONLY THEME)
export const darkColors: Colors = {
  primary: '#8B5CFF',
  primaryActive: '#9F73FF',
  primaryDark: '#7A4FE8',
  primaryLight: '#A687FF',
  primaryBorder: 'rgba(94, 61, 184, 0.14)',
  secondary: '#5C9BFF',
  secondaryDark: '#4A89E8',
  secondaryLight: '#7AADFF',
  background: '#0D0B14',
  backgroundSecondary: '#16121F',
  backgroundTertiary: '#1B1727',
  card: '#16121F',
  cardBorder: 'rgba(94, 61, 184, 0.14)',
  inputBackground: '#1B1727',
  toggleContainer: '#1B1727',
  toggleActivePill: '#8B5CFF',
  toggleActivePillGradientStart: '#8B5CFF',
  toggleActivePillGradientEnd: '#9F73FF',
  toggleGlow: 'rgba(158, 115, 255, 0.28)',
  text: '#FFFFFF',
  textSecondary: '#B9B4C8',
  textTertiary: '#6E6A80',
  icon: '#9F73FF',
  iconInactive: '#6B6680',
  genreCardBg: '#181524',
  genreGlows: {
    action: 'rgba(255, 107, 107, 0.22)',
    adventure: 'rgba(92, 201, 255, 0.22)',
    animation: 'rgba(255, 197, 92, 0.22)',
    comedy: 'rgba(255, 184, 108, 0.22)',
    crime: 'rgba(255, 92, 139, 0.22)',
    documentary: 'rgba(94, 143, 255, 0.22)',
    drama: 'rgba(159, 115, 255, 0.22)',
    family: 'rgba(92, 255, 179, 0.22)',
    fantasy: 'rgba(124, 92, 255, 0.22)',
    history: 'rgba(255, 184, 108, 0.22)',
    horror: 'rgba(255, 92, 139, 0.22)',
    music: 'rgba(159, 115, 255, 0.22)',
    mystery: 'rgba(94, 143, 255, 0.22)',
    romance: 'rgba(255, 92, 139, 0.22)',
    sciFi: 'rgba(92, 201, 255, 0.22)',
    thriller: 'rgba(255, 92, 139, 0.22)',
    war: 'rgba(255, 184, 108, 0.22)',
    western: 'rgba(255, 184, 108, 0.22)',
  },
  border: '#252538',
  borderLight: '#1E1E23',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#5C9BFF',
  overlay: 'rgba(13, 11, 20, 0.9)',
  overlayLight: 'rgba(13, 11, 20, 0.7)',
  fabGlow: 'rgba(159, 115, 255, 0.36)',
  fabHalo: 'rgba(139, 92, 255, 0.18)',
};

// Export dark colors as the only theme
export const colors = darkColors;