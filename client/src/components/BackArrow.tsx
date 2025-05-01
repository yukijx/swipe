import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const BackArrow = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const color = theme === 'dark' ? '#ffffff' : '#893030'; // white in dark, red in light

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.container}>
      <Text style={[styles.arrow, { color }]}>‹</Text>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {

    paddingVertical: Platform.OS === 'web' ? 10 : 5,
    position: 'absolute',
    top: Platform.OS === 'web' ? 10 : 110,
    left: 10,
    zIndex: 10,
  },
  arrow: {
    fontSize: 50,
    fontWeight: '100',
  },
});

export default BackArrow;
