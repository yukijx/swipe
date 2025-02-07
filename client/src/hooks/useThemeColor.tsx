import { useTheme } from '../context/ThemeContext';

const defaultColors = {
  background: {
    light: '#fff7d5',
    dark: '#222',
  },
  text: {
    light: '#893030',
    dark: '#ffffff',
  },
};

export function useThemeColor(
  colors: { light: string | undefined; dark: string | undefined },
  colorName: keyof typeof defaultColors
) {
  const { theme } = useTheme();

  return colors[theme] ?? defaultColors[colorName][theme];
}
