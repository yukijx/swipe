import React, { useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext"; //Import theme context

interface InputDescriptionBoxProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: object;
}

const InputDescriptionBox: React.FC<InputDescriptionBoxProps> = ({ placeholder, value, onChangeText, style }) => {
  const { theme } = useTheme(); //Get current theme

  return (
    <TextInput
      style={[
        styles.input, 
        {
          backgroundColor: theme === "dark" ? "#4d231f" : "#fff",
          color: theme === "dark" ? "#fff7d5" : "#4d231f",
        },
        style
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme === "dark" ? "#fff7d5" : "#4d231f"}
      multiline={true} //Enables multi-line input
      numberOfLines={6} //Makes the box larger
      value={value}
      onChangeText={onChangeText}
      textAlignVertical="top" //Ensures text starts from the top
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: "90%",
    height: 125,
    borderColor: "#2E1512",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 8,
    margin: 10,
  },
});

export default InputDescriptionBox;
