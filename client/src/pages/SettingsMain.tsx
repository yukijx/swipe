import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

const SettingsMain = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuthContext();

  // Themed styling variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const buttonColor = theme === 'light' ?'#893030': '#333';
  const buttonTextColor = '#ffffff';

  const settingsOptions = [
    {
      title: 'Profile Settings',
      onPress: () => navigation.navigate('SettingsPrivacy'),
      icon: '👤'
    },
    {
      title: 'App Settings',
      onPress: () => navigation.navigate('SettingsApplication'),
      icon: '⚙️'
    },
    {
      title: 'Security Settings',
      onPress: () => navigation.navigate('SettingsSecurity'),
      icon: '🔒'
    },
    ...(
      isFaculty
        ? [{
            title: 'Listing Settings',
            onPress: () => navigation.navigate('ListingSettings'),
            icon: '📋',
          }]
        : []
    )
  ];

  return (
    <ResponsiveScreen
      navigation={navigation}
      contentContainerStyle={[styles.container, { backgroundColor }]}
    >
      <Text style={[styles.title, { color: textColor }]}>Settings</Text>

      <View style={styles.optionsContainer}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, { backgroundColor: buttonColor }]}
            onPress={option.onPress}
          >
            <Text style={[styles.optionIcon, { color: buttonTextColor }]}>{option.icon}</Text>
            <Text style={[styles.optionText, { color: buttonTextColor }]}>
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ResponsiveScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer' as any,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease'
    } : {}),
  },
  optionIcon: {
    marginRight: 15,
    fontSize: 20,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default SettingsMain;
