// src/utils/providerUrls.ts
// Provider app deep links and store URLs with WORKING deep links

import { Platform } from 'react-native';

interface ProviderScheme {
  name: string;
  ios: {
    scheme: string;
    storeUrl: string;
  } | null;
  android: {
    scheme: string;
    storeUrl: string;
  } | null;
  buildUrl?: (tmdbId?: number, mediaType?: 'movie' | 'tv') => string;
}

export const PROVIDER_SCHEMES: Record<string, ProviderScheme> = {
  // ✅ Netflix - FIXED for both platforms
  'Netflix': {
    name: 'Netflix',
    ios: {
      scheme: 'nflx://',
      storeUrl: 'https://apps.apple.com/app/netflix/id363590051',
    },
    android: {
      // Android uses package intent instead of scheme
      scheme: 'intent:///#Intent;scheme=https;package=com.netflix.mediaclient;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.netflix.mediaclient',
    },
    buildUrl: (tmdbId) => {
      if (Platform.OS === 'ios') {
        return 'nflx://';
      } else {
        // Android: Open Netflix app via package
        return 'intent:///#Intent;scheme=https;package=com.netflix.mediaclient;end';
      }
    },
  },

  // ✅ Amazon Prime Video - FIXED
  'Amazon Prime Video': {
    name: 'Prime Video',
    ios: {
      scheme: 'aiv://aiv/resume',
      storeUrl: 'https://apps.apple.com/app/prime-video/id545519333',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.amazon.avod.thirdpartyclient;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.amazon.avod.thirdpartyclient',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'aiv://aiv/resume';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.amazon.avod.thirdpartyclient;end';
      }
    },
  },

  // ✅ Disney+ / Disney Plus
  'Disney Plus': {
    name: 'Disney+',
    ios: {
      scheme: 'disneyplus://',
      storeUrl: 'https://apps.apple.com/app/disney/id1446075923',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.disney.disneyplus;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.disney.disneyplus',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'disneyplus://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.disney.disneyplus;end';
      }
    },
  },

  'Disney+': {
    name: 'Disney+',
    ios: {
      scheme: 'disneyplus://',
      storeUrl: 'https://apps.apple.com/app/disney/id1446075923',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.disney.disneyplus;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.disney.disneyplus',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'disneyplus://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.disney.disneyplus;end';
      }
    },
  },

  // ✅ Disney+ Hotstar (India) - FIXED
  'Disney+ Hotstar': {
    name: 'Hotstar',
    ios: {
      scheme: 'hotstar://',
      storeUrl: 'https://apps.apple.com/app/hotstar/id934459219',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=in.startv.hotstar;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=in.startv.hotstar',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'hotstar://';
      } else {
        return 'intent:///#Intent;scheme=https;package=in.startv.hotstar;end';
      }
    },
  },

  'Hotstar': {
    name: 'Hotstar',
    ios: {
      scheme: 'hotstar://',
      storeUrl: 'https://apps.apple.com/app/hotstar/id934459219',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=in.startv.hotstar;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=in.startv.hotstar',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'hotstar://';
      } else {
        return 'intent:///#Intent;scheme=https;package=in.startv.hotstar;end';
      }
    },
  },

  // ✅ Apple TV / Apple TV+
  'Apple TV': {
    name: 'Apple TV',
    ios: {
      scheme: 'videos://',
      storeUrl: 'https://apps.apple.com/app/apple-tv/id1174078549',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.apple.atve.androidtv.appletv;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.apple.atve.androidtv.appletv',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'videos://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.apple.atve.androidtv.appletv;end';
      }
    },
  },

  'Apple TV Plus': {
    name: 'Apple TV+',
    ios: {
      scheme: 'videos://',
      storeUrl: 'https://apps.apple.com/app/apple-tv/id1174078549',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.apple.atve.androidtv.appletv;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.apple.atve.androidtv.appletv',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'videos://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.apple.atve.androidtv.appletv;end';
      }
    },
  },

  // ✅ HBO Max
  'HBO Max': {
    name: 'HBO Max',
    ios: {
      scheme: 'hbomax://',
      storeUrl: 'https://apps.apple.com/app/hbo-max/id971265422',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.hbo.hbonow;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.hbo.hbonow',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'hbomax://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.hbo.hbonow;end';
      }
    },
  },

  // ✅ Hulu
  'Hulu': {
    name: 'Hulu',
    ios: {
      scheme: 'hulu://',
      storeUrl: 'https://apps.apple.com/app/hulu/id376510438',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.hulu.plus;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.hulu.plus',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'hulu://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.hulu.plus;end';
      }
    },
  },

  // ✅ YouTube Premium
  'YouTube Premium': {
    name: 'YouTube',
    ios: {
      scheme: 'youtube://',
      storeUrl: 'https://apps.apple.com/app/youtube/id544007664',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.google.android.youtube;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.google.android.youtube',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'youtube://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.google.android.youtube;end';
      }
    },
  },

  // ✅ Indian Streaming Services
  'SonyLIV': {
    name: 'SonyLIV',
    ios: {
      scheme: 'sonyliv://',
      storeUrl: 'https://apps.apple.com/app/sonyliv/id1054427603',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.sony.liv;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.sony.liv',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'sonyliv://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.sony.liv;end';
      }
    },
  },

  'Zee5': {
    name: 'ZEE5',
    ios: {
      scheme: 'zee5://',
      storeUrl: 'https://apps.apple.com/app/zee5/id743691886',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.graymatrix.did;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.graymatrix.did',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'zee5://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.graymatrix.did;end';
      }
    },
  },

  'JioCinema': {
    name: 'JioCinema',
    ios: {
      scheme: 'jiocinema://',
      storeUrl: 'https://apps.apple.com/app/jiocinema/id1230683387',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.jio.media.ondemand;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.jio.media.ondemand',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'jiocinema://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.jio.media.ondemand;end';
      }
    },
  },

  'Voot': {
    name: 'Voot',
    ios: {
      scheme: 'voot://',
      storeUrl: 'https://apps.apple.com/app/voot/id1011359502',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.tv.v18.viola;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.tv.v18.viola',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'voot://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.tv.v18.viola;end';
      }
    },
  },

  'MX Player': {
    name: 'MX Player',
    ios: null,
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.mxtech.videoplayer.ad;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.mxtech.videoplayer.ad',
    },
    buildUrl: () => 'intent:///#Intent;scheme=https;package=com.mxtech.videoplayer.ad;end',
  },

  'Paramount Plus': {
    name: 'Paramount+',
    ios: {
      scheme: 'paramountplus://',
      storeUrl: 'https://apps.apple.com/app/paramount/id1045973701',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.cbs.app;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.cbs.app',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'paramountplus://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.cbs.app;end';
      }
    },
  },

  'Peacock': {
    name: 'Peacock',
    ios: {
      scheme: 'peacocktv://',
      storeUrl: 'https://apps.apple.com/app/peacock-tv/id1508186374',
    },
    android: {
      scheme: 'intent:///#Intent;scheme=https;package=com.peacocktv.peacockandroid;end',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.peacocktv.peacockandroid',
    },
    buildUrl: () => {
      if (Platform.OS === 'ios') {
        return 'peacocktv://';
      } else {
        return 'intent:///#Intent;scheme=https;package=com.peacocktv.peacockandroid;end';
      }
    },
  },
};

/**
 * Get provider scheme info with fallback matching
 */
export const getProviderScheme = (
  providerName: string,
  tmdbId?: number,
  mediaType?: 'movie' | 'tv'
): {
  app: string;
  ios: string | null;
  android: string | null;
} | null => {
  // Normalize provider name for matching
  const normalized = providerName
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/Disney\s*\+\s*Hotstar/i, 'Disney+ Hotstar')
    .replace(/Disney\s*Plus/i, 'Disney+')
    .replace(/Apple TV Plus/i, 'Apple TV Plus')
    .replace(/Prime Video/i, 'Amazon Prime Video');

  // Try exact match first
  let scheme = PROVIDER_SCHEMES[normalized];

  // Try case-insensitive match
  if (!scheme) {
    const key = Object.keys(PROVIDER_SCHEMES).find(
      k => k.toLowerCase() === normalized.toLowerCase()
    );
    if (key) {
      scheme = PROVIDER_SCHEMES[key];
    }
  }

  // Try partial match (for variations like "Netflix Basic")
  if (!scheme) {
    const key = Object.keys(PROVIDER_SCHEMES).find(
      k => normalized.toLowerCase().includes(k.toLowerCase()) ||
           k.toLowerCase().includes(normalized.toLowerCase())
    );
    if (key) {
      scheme = PROVIDER_SCHEMES[key];
    }
  }

  if (!scheme) {
    console.warn(`[Provider] No scheme found for: "${providerName}"`);
    return null;
  }

  const platformScheme = Platform.OS === 'ios' ? scheme.ios : scheme.android;
  
  if (!platformScheme) {
    console.warn(`[Provider] No ${Platform.OS} scheme for: "${providerName}"`);
    return null;
  }

  // Build the app URL
  const appUrl = scheme.buildUrl 
    ? scheme.buildUrl(tmdbId, mediaType)
    : platformScheme.scheme;

  return {
    app: appUrl,
    ios: scheme.ios?.storeUrl || null,
    android: scheme.android?.storeUrl || null,
  };
};

/**
 * Get user-friendly provider name
 */
export const getProviderDisplayName = (providerName: string): string => {
  const scheme = getProviderScheme(providerName);
  return scheme ? PROVIDER_SCHEMES[providerName]?.name || providerName : providerName;
};

/**
 * Get web URL for provider (Expo Go fallback)
 */
export const getProviderWebUrl = (providerName: string): string | null => {
  const webUrls: Record<string, string> = {
    'Netflix': 'https://www.netflix.com',
    'Amazon Prime Video': 'https://www.primevideo.com',
    'Disney Plus': 'https://www.disneyplus.com',
    'Disney+': 'https://www.disneyplus.com',
    'Disney+ Hotstar': 'https://www.hotstar.com',
    'Hotstar': 'https://www.hotstar.com',
    'Apple TV': 'https://tv.apple.com',
    'Apple TV Plus': 'https://tv.apple.com',
    'HBO Max': 'https://www.hbomax.com',
    'Hulu': 'https://www.hulu.com',
    'YouTube Premium': 'https://www.youtube.com/premium',
    'SonyLIV': 'https://www.sonyliv.com',
    'Zee5': 'https://www.zee5.com',
    'JioCinema': 'https://www.jiocinema.com',
    'Voot': 'https://www.voot.com',
    'MX Player': 'https://www.mxplayer.in',
    'Paramount Plus': 'https://www.paramountplus.com',
    'Peacock': 'https://www.peacocktv.com',
  };

  // Try exact match
  if (webUrls[providerName]) {
    return webUrls[providerName];
  }

  // Try case-insensitive match
  const key = Object.keys(webUrls).find(
    k => k.toLowerCase() === providerName.toLowerCase()
  );

  return key ? webUrls[key] : null;
};