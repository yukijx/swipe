import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";
import GenericButton from "../components/GenericButton";
import Icon from "react-native-vector-icons/FontAwesome5";  

const { width } = Dimensions.get("window");


const NavBar = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = "#4d231f";
  const iconColor = theme === "light" ? "#fff7d5" : "#fff7d5";
  const iconSize = width * 0.08; // ✅ Make icon size responsive

  return (
    <View style={[styles.navContainer, { backgroundColor }]}>
      {/* ✅ Home Icon - Aligned Left */}
      <GenericButton onPress={() => navigation.navigate("Home")}>
        <Icon name="home" size={iconSize} color={iconColor} />
      </GenericButton>

      {/* Empty View for spacing */}
      <View style={{ flex: 1 }} />

      {/* ✅ Settings Icon - Aligned Right */}
      <GenericButton onPress={() => navigation.navigate("Settings")}>
        <Icon name="bars" size={iconSize} color={iconColor} />  
      </GenericButton>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    alignItems: "center",

    borderColor: "#2E1512",
    borderBottomWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    flexDirection: "row",
    justifyContent: "space-around", 
    width: "100%", 
  },
});

export default NavBar;
