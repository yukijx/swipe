// Keep the imports as-is
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { getBackendURL } from '../utils/network';

interface ProfileField {
    key: string;
    label: string;
    multiline?: boolean;
}

const studentFields: ProfileField[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
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
    { key: 'email', label: 'Email' },
    { key: 'university', label: 'University' },
    { key: 'department', label: 'Department' },
    { key: 'researchInterests', label: 'Research Interests', multiline: true },
    { key: 'biography', label: 'Biography', multiline: true },
    { key: 'publications', label: 'Publications', multiline: true },
    { key: 'officeHours', label: 'Office Hours' },
    { key: 'contactInfo', label: 'Contact Information' }
];

const ProfileView = ({ navigation, route }: { navigation: any, route: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [profileData, setProfileData] = useState<Record<string, string>>({});
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Check if we're viewing another student's profile or own profile
    const viewingStudentId = route.params?.studentId;
    const viewingOtherProfile = viewingStudentId && isFaculty;
    const profileTitle = viewingOtherProfile ? 'Student Profile' : (isFaculty ? 'Faculty Profile' : 'Student Profile');

    useEffect(() => {
        fetchProfile();
    }, [viewingStudentId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('AuthLogin');
                return;
            }
            
            // First get the backend URL
            const backendURL = await getBackendURL();
            
            // If faculty is viewing a student profile, fetch that specific student
            const endpoint = viewingOtherProfile 
                ? `${backendURL}/user/${viewingStudentId}` 
                : `${backendURL}/user/profile`;
                
            console.log('Fetching profile from:', endpoint);
            
            const response = await axios.get(
                endpoint,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Profile data received, fields:', Object.keys(response.data));
            
            // For debugging purposes
            if (!viewingOtherProfile && !isFaculty) {
                // Check if student fields exist
                const missingFields = studentFields
                    .filter(field => !response.data[field.key] && field.key !== 'resumeText')
                    .map(field => field.label);
                
                if (missingFields.length > 0) {
                    console.warn('Missing student profile fields:', missingFields.join(', '));
                }
            }
            
            setProfileData(response.data);
            if (response.data.profileImage?.data && response.data.profileImage?.contentType) {
                setProfileImage(`data:${response.data.profileImage.contentType};base64,${response.data.profileImage.data}`);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            const errorMessage = error.response?.data?.error || 'Failed to fetch profile';
            Alert.alert('Error', errorMessage);
            
            // If we get a 404 or 401, redirect to setup
            if (error.response?.status === 404 || error.response?.status === 401) {
                if (!isFaculty && !viewingOtherProfile) {
                    Alert.alert(
                        'Profile Incomplete', 
                        'Your profile is incomplete. Would you like to set it up now?',
                        [
                            { 
                                text: 'Yes', 
                                onPress: () => navigation.navigate('ProfileSetupStudent')
                            },
                            { 
                                text: 'No', 
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } finally {
            setLoading(false);
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

    // Determine which fields to show based on whose profile we're viewing
    const fields = viewingOtherProfile ? studentFields : (isFaculty ? professorFields : studentFields);

    const contactStudent = () => {
        if (profileData.email) {
            Linking.openURL(`mailto:${profileData.email}?subject=Research Opportunity Interest`);
        } else {
            Alert.alert('Error', 'No email address available for this student.');
        }
    };

    if (loading) {
        return (
            <ResponsiveScreen navigation={navigation}>
                <View style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={textColor} />
                </View>
            </ResponsiveScreen>
        );
    }

    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>
                    {profileTitle}
                </Text>
                {renderProfileImage()}
                <View style={styles.formContainer}>
                    {fields.map(renderField)}
                </View>
                
                {/* Add contact button only when faculty is viewing student profile */}
                {viewingOtherProfile && isFaculty && (
                    <View style={styles.contactButtonContainer}>
                        <TouchableOpacity 
                            style={styles.contactButton}
                            onPress={contactStudent}
                        >
                            <Text style={styles.contactButtonText}>Contact Student</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    contactButtonContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    contactButton: {
        backgroundColor: '#893030',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '60%',
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ProfileView;
