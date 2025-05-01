import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

const SettingsSecurity = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();

  // Themed styling variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const buttonColor = theme === 'light' ? '#893030' : '#333';
  const buttonTextColor = '#ffffff';

  const securityOptions = [
    {
      title: 'Change Password',
      description: 'Update your account password',
      onPress: () => navigation.navigate('AuthChangePassword'),
      icon: '🔑'
    },
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security',
      onPress: () => console.log('2FA Settings'),
      icon: '🔐'
    },
    {
      title: 'Login History',
      description: 'View your recent login activity',
      onPress: () => console.log('Login History'),
      icon: '📱'
    },
    {
      title: 'Connected Accounts',
      description: 'Manage linked accounts and services',
      onPress: () => console.log('Connected Accounts'),
      icon: '🔗'
    },
    {
      title: 'Data & Storage',
      description: 'Manage your data and storage settings',
      onPress: () => console.log('Data Settings'),
      icon: '💾'
    }
  ];

  return (
    <ResponsiveScreen navigation={navigation} contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Security Settings</Text>

      <View style={styles.optionsContainer}>
        {securityOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, { backgroundColor: buttonColor }]}
            onPress={option.onPress}
          >
            <Text style={[styles.optionIcon, { color: buttonTextColor }]}>{option.icon}</Text>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: buttonTextColor }]}>
                {option.title}
              </Text>
              <Text style={[styles.optionDescription, { color: buttonTextColor }]}>
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ResponsiveScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  optionsContainer: {
    padding: 20,
    gap: 15,
    ...(Platform.OS === 'web'
      ? {
          display: 'grid' as any,
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        }
      : {
          display: 'flex',
        }),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer' as any,
    } : {}),
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
});

export default SettingsSecurity;
