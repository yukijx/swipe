//This page allows a user to change their password. 

// Import React and useState hook for state management
import React, { useState } from 'react';

// Import React Native core components
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';

// Custom context hook to get the current theme ("light" or "dark")
import { useTheme } from '../context/ThemeContext';

// Wrapper that ensures responsive design across devices
import { ResponsiveScreen } from '../components/ResponsiveScreen';

// Axios is imported but unused (could be used instead of fetch)
import axios from 'axios';

// Module to access secure local storage (used for the auth token)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utility to get the backend server URL
import { getBackendURL } from '../utils/network';

// Define the main component and expect a navigation prop for screen transitions
const AuthChangePassword = ({ navigation }: { navigation: any }) => {
    // Access current theme (light/dark)
    const { theme } = useTheme();

    // Dynamically determine text and background colors based on theme
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const backgroundColor = theme === 'light' ? '#ffffff' : '#333';

    // Local state for password fields
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Handle the submit action when user presses "Change Password"
    const handleSubmit = async () => {
        try {
            // Validate that new password and confirmation match
            if (passwords.newPassword !== passwords.confirmPassword) {
                Alert.alert('Error', 'New passwords do not match');
                return;
            }

            // Get the authentication token from AsyncStorage
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                return;
            }

            // Make a POST request to the change-password API route
            const response = await fetch(
                `${getBackendURL()}/user/change-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // Include auth token in header
                    },
                    body: JSON.stringify({
                        currentPassword: passwords.currentPassword,
                        newPassword: passwords.newPassword
                    })
                }
            );

            // If request was successful
            if (response.ok) {
                Alert.alert('Success', 'Password changed successfully');
                navigation.goBack(); // Navigate back to the previous screen
            } else {
                Alert.alert('Error', 'Failed to change password');
            }
        } catch (error: any) {
            // Handle any other error (e.g., network or server issues)
            Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
        }
    };

    // JSX layout for the screen
    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                {/* Header */}
                <Text style={[styles.title, { color: textColor }]}>Change Password</Text>

                {/* Form Box */}
                <View style={[styles.formContainer, { backgroundColor }]}>
                    
                    {/* Current Password Input */}
                    <TextInput
                        style={[styles.input, { backgroundColor: theme === 'light' ? '#f5f5f5' : '#444' }]}
                        placeholder="Current Password"
                        placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
                        secureTextEntry
                        value={passwords.currentPassword}
                        onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                    />

                    {/* New Password Input */}
                    <TextInput
                        style={[styles.input, { backgroundColor: theme === 'light' ? '#f5f5f5' : '#444' }]}
                        placeholder="New Password"
                        placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
                        secureTextEntry
                        value={passwords.newPassword}
                        onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                    />

                    {/* Confirm Password Input */}
                    <TextInput
                        style={[styles.input, { backgroundColor: theme === 'light' ? '#f5f5f5' : '#444' }]}
                        placeholder="Confirm New Password"
                        placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
                        secureTextEntry
                        value={passwords.confirmPassword}
                        onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Change Password</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ResponsiveScreen>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        padding: 20,
        borderRadius: 10,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        } : {
            elevation: 2
        })
    },
    input: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        ...(Platform.OS === 'web' ? {
            outlineWidth: 0,
            outlineStyle: 'none',
        } : {})
    },
    submitButton: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default AuthChangePassword; 