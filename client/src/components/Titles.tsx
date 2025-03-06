import React from "react";
import { useColorScheme, useWindowDimensions, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext"; //Use ThemeContext

interface TitleProps {
  title: string;
}

const Titles: React.FC<TitleProps> = ({ title }) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme(); //Get theme from context
  const dynamicFontSize = width * 0.08;

  return (
    <Text style={[
      styles.title, 
      { 
        color: theme === "dark" ? "#fff7d5" : "#4d231f", 
        fontSize: dynamicFontSize 
      }
    ]}>
      {title}  
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: "3%",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Titles;
