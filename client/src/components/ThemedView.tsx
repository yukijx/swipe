import React from "react";
import { View, StyleSheet, Platform, ViewProps } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
  lightColor?: string;
  darkColor?: string;
}

const ThemedView: React.FC<ThemedViewProps> = ({ children, style, lightColor, darkColor, ...props }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === "light" ? lightColor || "#fff7d5" : darkColor || "#222";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        Platform.OS === "web"
          ? { minHeight: "100%", flex: 1, width: "100%" } // ✅ Fix for Web
          : {},
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedView;
