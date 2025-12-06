// ========================================
// WATCHMATES DESIGN SYSTEM v2.0
// Threads-Inspired Premium Social App
// ========================================

export const designTokens = {
  // === COLORS ===
  colors: {
    background: {
      primary: '#000000',
      secondary: '#0A0A0A',
      tertiary: '#141414',
      elevated: '#1C1C1C',
    },
    
    surface: {
      base: '#1C1C1C',
      hover: '#252525',
      pressed: '#2C2C2C',
      border: 'rgba(255,255,255,0.08)',
    },
    
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      tertiary: '#6E6E6E',
      disabled: '#404040',
      inverse: '#000000',
    },
    
    accent: {
      primary: '#A78BFA',
      primaryHover: '#C4B5FD',
      primaryPressed: '#8B5CF6',
      subtle: 'rgba(167,139,250,0.12)',
      border: 'rgba(167,139,250,0.24)',
    },
    
    semantic: {
      error: '#EF4444',
      errorSubtle: 'rgba(239,68,68,0.12)',
      success: '#10B981',
      successSubtle: 'rgba(16,185,129,0.12)',
      warning: '#F59E0B',
      warningSubtle: 'rgba(245,158,11,0.12)',
    },
    
    interactive: {
      like: '#EF4444',
      likeSubtle: 'rgba(239,68,68,0.12)',
      comment: '#60A5FA',
      share: '#10B981',
      bookmark: '#F59E0B',
    },
    
    overlay: {
      light: 'rgba(0,0,0,0.4)',
      medium: 'rgba(0,0,0,0.6)',
      heavy: 'rgba(0,0,0,0.8)',
    },
  },
  
  // === TYPOGRAPHY ===
  typography: {
    fontFamily: {
      primary: 'SF Pro Display',
      android: 'Roboto',
      mono: 'SF Mono',
    },
    
    scale: {
      display: {
        fontSize: 34,
        lineHeight: 41,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
      },
      title1: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '700' as const,
        letterSpacing: -0.4,
      },
      title2: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600' as const,
        letterSpacing: -0.2,
      },
      title3: {
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '600' as const,
        letterSpacing: 0,
      },
      body: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400' as const,
        letterSpacing: -0.2,
      },
      bodySmall: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400' as const,
        letterSpacing: -0.1,
      },
      caption: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400' as const,
        letterSpacing: 0,
      },
      caption2: {
        fontSize: 11,
        lineHeight: 16,
        fontWeight: '500' as const,
        letterSpacing: 0.3,
      },
      button: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600' as const,
        letterSpacing: 0.2,
      },
      buttonSmall: {
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '600' as const,
        letterSpacing: 0.1,
      },
    },
  },
  
  // === SPACING ===
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },
  
  // === BORDER RADIUS ===
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  // === SHADOWS (iOS Style) ===
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  // === ICONS ===
  icons: {
    strokeWidth: 2,
    strokeWidthBold: 2.5,
    sizes: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
    },
  },
  
  // === TOUCH TARGETS ===
  touchTargets: {
    minimum: 44,
    comfortable: 48,
    button: 48,
    buttonSmall: 36,
    icon: 44,
    avatar: 40,
    avatarLarge: 80,
    fab: 56,
  },
  
  // === ANIMATION ===
  animation: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 400,
      slower: 600,
    },
    easing: {
      easeOut: [0.0, 0.0, 0.2, 1],
      easeIn: [0.4, 0.0, 1, 1],
      easeInOut: [0.4, 0.0, 0.2, 1],
    },
  },
  
  // === LAYOUT ===
  layout: {
    screenMargin: {
      mobile: 20,
      tablet: 24,
    },
    maxContentWidth: 600,
    navigationBar: {
      height: 80,
      iconSize: 28,
      tabWidth: 60,
    },
    fab: {
      size: 56,
      bottomOffset: 96,
      rightOffset: 20,
    },
    postCard: {
      padding: 20,
      avatarSize: 40,
      avatarToText: 12,
      textToMedia: 16,
      actionsGap: 24,
      actionIconSize: 24,
      borderRadius: 0,
      dividerHeight: 0.5,
    },
  },
} as const;

export type DesignTokens = typeof designTokens;