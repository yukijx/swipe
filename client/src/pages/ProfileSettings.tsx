import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../hooks/useAuth';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

interface ProfileField {
    key: string;
    label: string;
    multiline?: boolean;
}

const studentFields: ProfileField[] = [
    { key: 'name', label: 'Name' },
    { key: 'university', label: 'University' },
    { key: 'major', label: 'Major' },
    { key: 'experience', label: 'Experience', multiline: true },
    { key: 'skills', label: 'Skills', multiline: true },
    { key: 'projects', label: 'Projects', multiline: true },
    { key: 'certifications', label: 'Certifications', multiline: true },
    { key: 'resumeText', label: 'Resume Text', multiline: true }
];

const professorFields: ProfileField[] = [
    { key: 'name', label: 'Name' },
    { key: 'university', label: 'University' },
    { key: 'department', label: 'Department' },
    { key: 'researchInterests', label: 'Research Interests', multiline: true },
    { key: 'biography', label: 'Biography', multiline: true },
    { key: 'publications', label: 'Publications', multiline: true },
    { key: 'officeHours', label: 'Office Hours' },
    { key: 'contactInfo', label: 'Contact Information' }
];

const ProfileSettings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [profileData, setProfileData] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/user/profile',
                { headers: { Authorization: token } }
            );
            setProfileData(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile');
        }
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/user/profile',
                profileData,
                { headers: { Authorization: token } }
            );
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleChange = (key: string, value: string) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const renderField = ({ key, label, multiline }: ProfileField) => (
        <View key={key} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {Platform.OS === 'web' ? (
                <textarea
                    style={{
                        ...styles.input,
                        ...(multiline && styles.multiline),
                        backgroundColor: theme === 'light' ? '#ffffff' : '#333',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        width: '100%',
                        fontFamily: 'inherit',
                    }}
                    value={profileData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    rows={multiline ? 4 : 1}
                />
            ) : (
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        { backgroundColor: theme === 'light' ? '#ffffff' : '#333' }
                    ]}
                    value={profileData[key] || ''}
                    onChangeText={(text) => handleChange(key, text)}
                    multiline={multiline}
                    placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}
        </View>
    );

    const fields = isFaculty ? professorFields : studentFields;

    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>
                    {isFaculty ? 'Faculty Profile' : 'Student Profile'}
                </Text>

                <View style={styles.formContainer}>
                    {fields.map(renderField)}

                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Save Changes</Text>
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
        maxWidth: 800,
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
        gap: 20,
    },
    fieldContainer: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    input: Platform.OS === 'web' ? {} : {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default ProfileSettings;
