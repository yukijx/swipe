import React from "react";
import { useTheme } from "../context/ThemeContext"; // ✅ Import Theme Context
import { useWindowDimensions, Text, StyleSheet } from "react-native";

interface SubheadingProps {
  text: string;
}

const Subheading: React.FC<SubheadingProps> = ({ text }) => {
  const { theme } = useTheme(); // ✅ Get theme from context
  const { width } = useWindowDimensions();
  const dynamicFontSize = width * 0.06; // ✅ Scale text size

  return (
    <Text style={[
      styles.subheading, 
      { 
        color: theme === "dark" ? "#fff7d5" : "#893030", 
        fontSize: dynamicFontSize 
      }
    ]}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  subheading: {
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default Subheading;
