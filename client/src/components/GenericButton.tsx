import React from "react";
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from "react-native";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  children?: React.ReactNode; 
}

const GenericButton: React.FC<ButtonProps> = ({ title, onPress, children }) => {
  const theme = useColorScheme(); 
  const backgroundColor = theme === "dark" ? "#4d231f" : "#fff7d5";
  const textColor = theme === "dark" ? "#fff7d5" : "#893030";  

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      {children ? children : <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    
    alignItems: "center",
    borderColor: "#2E1512",
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    margin:5,
    padding:5,
    
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default GenericButton;
