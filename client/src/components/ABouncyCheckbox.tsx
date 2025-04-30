import React from 'react';
import { View, StyleSheet } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTheme } from "../context/ThemeContext"; //Import ThemeContext

interface CheckboxProps {
  text: string;
  isChecked: boolean;
  onPress: (checked: boolean) => void;
}

export default function ABouncyCheckbox({ text, isChecked, onPress }: CheckboxProps) {
  const { theme } = useTheme(); //Get current theme

  //Dynamic Colors Based on Theme
  const fillColor = theme === "dark" ? "#fff7d5" : "#4d231f";
  const borderColor = theme === "dark" ? "#2E1512" : "#fff7d5";
  const textColor = theme === "dark" ? "#fff7d5" : "#4d231f";

  return (
    <View style={styles.checkboxContainer}>
      <BouncyCheckbox
        size={25} 
        fillColor={fillColor} //Updates fill color
        unFillColor="transparent" //Transparent for unselected state
        iconStyle={{ borderColor: borderColor, borderWidth: 4 }} //Dynamic border color
        innerIconStyle={{ borderWidth: 2 }}
        text={text}  
        textStyle={[styles.text, { color: textColor }]} //Dynamic text color
        isChecked={isChecked}  
        onPress={onPress}  
      />
    </View>  
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: "#2E1512",
    marginBottom: 16,
    paddingLeft: 20, //Adjusted alignment
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

