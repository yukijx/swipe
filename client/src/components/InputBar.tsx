import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext"; //Import ThemeContext

interface InputBarProps {
  placeholder: string;
  secureTextEntry?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ placeholder, secureTextEntry }) => {
  const { theme } = useTheme(); //Get theme from context
  const backgroundColor = theme === "dark" ? "#4d231f" : "#fff";
  const textColor = theme === "dark" ? "#fff7d5" : "#4d231f";

  return (
    <TextInput
      style={[styles.input, { backgroundColor, color: textColor }]}
      placeholder={placeholder}
      placeholderTextColor={theme === "dark" ? "#fff7d5" : "#4d231f"}
      secureTextEntry={secureTextEntry}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: "#2E1512",
    borderWidth: 2,
    borderRadius: 10,
    height: 50,
    margin: 5,
    padding:10,
    width: "90%",
  },
});

export default InputBar;
