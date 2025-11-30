// Light Theme - Your Current Pastel Colors
export const lightColors = {
  // Primary colors
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  
  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
};

// Dark Theme - Premium Apple Style
export const darkColors = {
  // Primary purple system
  primary: '#8B5CFF',
  primaryActive: '#9F73FF',
  primaryDark: '#7A4FE8',
  primaryLight: '#A687FF',
  primaryBorder: 'rgba(94, 61, 184, 0.14)',
  
  // Secondary accent
  secondary: '#5C9BFF',
  secondaryDark: '#4A89E8',
  secondaryLight: '#7AADFF',
  
  // Backgrounds - Premium dark
  background: '#0D0B14',
  backgroundSecondary: '#16121F',
  backgroundTertiary: '#1B1727',
  
  // Card system
  card: '#16121F',
  cardBorder: 'rgba(94, 61, 184, 0.14)',
  inputBackground: '#1B1727',
  
  // Toggle/Capsule
  toggleContainer: '#1B1727',
  toggleActivePill: '#8B5CFF',
  toggleActivePillGradientStart: '#8B5CFF',
  toggleActivePillGradientEnd: '#9F73FF',
  toggleGlow: 'rgba(158, 115, 255, 0.28)',
  
  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: '#B9B4C8',
  textTertiary: '#6E6A80',
  
  // Icons
  icon: '#9F73FF',
  iconInactive: '#6B6680',
  
  // Genre card colors (unified background with tinted glows)
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
  
  // Border colors
  border: '#252538',
  borderLight: '#1E1E23',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#5C9BFF',
  
  // Overlay
  overlay: 'rgba(13, 11, 20, 0.9)',
  overlayLight: 'rgba(13, 11, 20, 0.7)',
  
  // FAB (Floating Action Button)
  fabGlow: 'rgba(159, 115, 255, 0.36)',
  fabHalo: 'rgba(139, 92, 255, 0.18)',
};

// Export type based on darkColors (has all properties)
export type Colors = typeof darkColors;

// Default export (will be replaced by hook)
export const colors = lightColors;