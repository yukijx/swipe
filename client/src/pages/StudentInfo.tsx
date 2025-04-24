// Keep the imports as-is
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Image } from 'react-native';
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

const StudentInfo = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [profileData, setProfileData] = useState<Record<string, string>>({});
    const [profileImage, setProfileImage] = useState<string | null>(null);

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
            if (response.data.profileImage?.url) {
                setProfileImage(response.data.profileImage.url);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile');
        }
    };

    const renderProfileImage = () => (
        <View style={styles.imageContainer}>
            {profileImage ? (
                <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No Photo</Text>
                </View>
            )}
        </View>
    );

    const renderField = ({ key, label }: ProfileField) => (
        <View key={key} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            <Text style={[styles.value, { color: theme === 'light' ? '#333' : '#ccc' }]}>
                {profileData[key] || '—'}
            </Text>
        </View>
    );

    const fields = isFaculty ? professorFields : studentFields;

    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>
                    {isFaculty ? 'Faculty Profile' : 'Student Profile'}
                </Text>
                {renderProfileImage()}
                <View style={styles.formContainer}>
                    {fields.map(renderField)}
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
        padding: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    formContainer: {
        gap: 15,
    },
    fieldContainer: {
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 15,
        paddingVertical: 4,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#666',
        fontSize: 14,
    }
});

export default StudentInfo;
