import { useTheme } from '../context/ThemeContext'; // ✅ Import theme
import Colors from "../constants/Colors"; // ✅ Import global colors

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme(); // ✅ Get theme from context
  const currentTheme = theme as "light" | "dark"; // ✅ Explicitly cast theme

  return props[currentTheme] ?? Colors[currentTheme][colorName]; // ✅ Use global colors if no prop is provided
}
