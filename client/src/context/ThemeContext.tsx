import React, { createContext, useState, useEffect, useContext } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || "light");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        console.log("[ThemeContext] Loaded theme from storage:", storedTheme);
        if (storedTheme === "light" || storedTheme === "dark") {
          setTheme(storedTheme as "light" | "dark");
          console.log("[ThemeContext] Set theme to:", storedTheme);
        } else {
          console.log("[ThemeContext] No valid theme found, using default:", theme);
        }
      } catch (error) {
        console.error("[ThemeContext] Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);
  

  const toggleTheme = async () => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      console.log("[ThemeContext] Toggling theme from", theme, "to", newTheme);
      setTheme(newTheme);
      await AsyncStorage.setItem("theme", newTheme);
      console.log("[ThemeContext] Theme saved to storage:", newTheme);
    } catch (error) {
      console.error("[ThemeContext] Error toggling theme:", error);
    }
  };

  // Add a listener for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log("[ThemeContext] System theme changed to:", colorScheme);
    });

    return () => subscription.remove();
  }, []);

  console.log("[ThemeContext] Rendering with theme:", theme);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
