import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';


const NavBar = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#893030' : '#333';
  const textColor = theme === 'light' ? '#ffffff' : '#fff7d5';

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor }}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={{ color: textColor }}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={{ color: textColor }}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NavBar;