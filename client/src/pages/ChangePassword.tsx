import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';

const ChangePassword = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const backgroundColor = theme === 'light' ? '#ffffff' : '#333';

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

            const response = await fetch(
                `${getBackendURL()}/user/change-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword: passwords.currentPassword,
                        newPassword: passwords.newPassword
                    })
                }
            );

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
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>Change Password</Text>

                <View style={[styles.formContainer, { backgroundColor }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme === 'light' ? '#f5f5f5' : '#444' }]}
                        placeholder="Current Password"
                        placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
                        secureTextEntry
                        value={passwords.currentPassword}
                        onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                    />

                    <TextInput
                        style={[styles.input, { backgroundColor: theme === 'light' ? '#f5f5f5' : '#444' }]}
                        placeholder="New Password"
                        placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
                        secureTextEntry
                        value={passwords.newPassword}
                        onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                    />

                    <TextInput
                        style={[styles.input, { backgroundColor: theme === 'light' ? '#f5f5f5' : '#444' }]}
                        placeholder="Confirm New Password"
                        placeholderTextColor={theme === 'light' ? '#666' : '#aaa'}
                        secureTextEntry
                        value={passwords.confirmPassword}
                        onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                    />

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
            outline: 'none',
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

export default ChangePassword; 