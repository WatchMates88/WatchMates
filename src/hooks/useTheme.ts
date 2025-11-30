import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, Colors } from '../theme/colors';

export const useTheme = () => {
  const { mode, isDark, setTheme, toggleTheme } = useThemeStore();
  
  const colors: Colors = isDark ? darkColors : lightColors;
  
  return {
    colors,
    mode,
    isDark,
    setTheme,
    toggleTheme,
  };
};