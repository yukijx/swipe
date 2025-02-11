import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { useTheme } from "../context/ThemeContext"; // ✅ Import ThemeContext

interface CustomTextProps {
  text: string;
  style?: TextStyle; // ✅ Ensure the style prop is properly typed
}

const CustomText: React.FC<CustomTextProps> = ({ text, style }) => {
  const { theme } = useTheme(); // ✅ Get theme from context

  return (
    <Text 
      style={[
        styles.text, 
        { color: theme === "dark" ? "#fff7d5" : "#4d231f" }, // ✅ Dynamic text color
        style // ✅ Merge additional styles
      ]}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default CustomText;
