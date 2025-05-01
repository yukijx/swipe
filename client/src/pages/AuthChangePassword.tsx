import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';

const AuthChangePassword = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();

  // Themed styling variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
  const placeholderTextColor = theme === 'light' ? '#666' : '#bbb';
  const borderColor = theme === 'light' ? '#ddd' : '#000';
  const buttonColor ='#893030';
  const buttonTextColor = '#ffffff';

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async () => {
    try {
      if (passwords.newPassword !== passwords.confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }

      const response = await fetch(`${getBackendURL()}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to change password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <ResponsiveScreen navigation={navigation} contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Change Password</Text>

      <View style={[styles.formContainer, { backgroundColor: inputBackground }]}>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
          placeholder="Current Password"
          placeholderTextColor={placeholderTextColor}
          secureTextEntry
          value={passwords.currentPassword}
          onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
        />
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
          placeholder="New Password"
          placeholderTextColor={placeholderTextColor}
          secureTextEntry
          value={passwords.newPassword}
          onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
        />
        <TextInput
          style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
          placeholder="Confirm New Password"
          placeholderTextColor={placeholderTextColor}
          secureTextEntry
          value={passwords.confirmPassword}
          onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
        />
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: buttonColor }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { color: buttonTextColor }]}>Change Password</Text>
        </TouchableOpacity>
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
  formContainer: {
    padding: 20,
    borderRadius: 10,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
      : { elevation: 2 }),
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? {
          outlineWidth: 0,
          outlineStyle: 'none',
        }
      : {})
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default AuthChangePassword;
