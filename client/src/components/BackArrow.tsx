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
    paddingVertical: 5,
    paddingHorizontal: 10,
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 40,
    left: 10,
    zIndex: 999,
  },
  arrow: {
    fontSize: 40,
    fontWeight: '200',
  },
});

export default BackArrow;
