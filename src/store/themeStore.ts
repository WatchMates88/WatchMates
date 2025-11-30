import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@watchmates_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isDark: false,
  
  setTheme: async (mode) => {
    set({ 
      mode, 
      isDark: mode === 'dark',
    });
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },
  
  toggleTheme: async () => {
    const currentMode = get().mode;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    get().setTheme(newMode);
  },
  
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ 
          mode: savedTheme, 
          isDark: savedTheme === 'dark',
        });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },
}));