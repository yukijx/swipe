//This is the page the student views when creating their profile
// 
// // Import necessary React and React Native components/hooks
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
    Alert, Platform, ActivityIndicator, Image
} from 'react-native';

// Theme context for accessing light/dark mode styling
import { useTheme } from '../context/ThemeContext';

// HTTP client for interacting with backend API
import axios from 'axios';

// Local storage for saving/retrieving the user's auth token
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom component for shared layout styling
import SetupScreen from '../components/SetupScreen';

// Modules for handling file selection
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

// Function to get appropriate backend URL depending on environment
import { getBackendURL } from '../utils/network';

// React Navigation for resetting navigation stack
import { CommonActions } from '@react-navigation/native';

// SafeAreaView ensures content doesn’t get cut off by notches/status bar
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface that defines the structure of the student's profile
interface StudentProfile {
    university: string;
    major: string;
    experience: string;
    skills: string;
    projects: string;
    certifications: string;
    resumeText: string;
}

// Interface for holding validation errors on required fields
interface ValidationErrors {
    university?: string;
    major?: string;
    skills?: string;
}

// Main component to render the student profile setup screen
const ProfileSetupStudent = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme(); // Access current theme

    // Define dynamic styling based on theme mode
    const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const inputBackground = theme === 'light' ? '#ffffff' : '#333';
    const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
    const placeholderTextColor = theme === 'light' ? '#666' : '#bbb';
    const borderColor = theme === 'light' ? '#ddd' : '#000';

    // State to hold student profile fields
    const [profile, setProfile] = useState<StudentProfile>({
        university: '',
        major: '',
        experience: '',
        skills: '',
        projects: '',
        certifications: '',
        resumeText: ''
    });

    // File name of the uploaded resume
    const [pdfFileName, setPdfFileName] = useState<string>('');

    // Track form validation errors
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Boolean states for UI spinners and disable flags
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResumeUploading, setIsResumeUploading] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);

    // Holds the uploaded profile image URL (from server)
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Validate required form fields and collect error messages
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        if (!profile.university.trim()) newErrors.university = 'University is required';
        if (!profile.major.trim()) newErrors.major = 'Major is required';
        if (!profile.skills.trim()) newErrors.skills = 'Skills are required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Open image picker, upload selected image, and set to state
    const handleImageUpload = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
                return;
            }

            setIsImageUploading(true); // Show loading spinner

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                setIsImageUploading(false);
                return;
            }

            const selectedImage = result.assets[0];
            const formData = new FormData();
            formData.append('profileImage', {
                uri: selectedImage.uri,
                name: 'profile-image.jpg',
                type: 'image/jpeg',
            } as any);

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'You are not logged in');
                navigation.navigate('AuthLogin');
                return;
            }

            const response = await axios.post(
                `${getBackendURL()}/user/profile/image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setProfileImage(response.data.profileImage.url);
            Alert.alert('Success', 'Profile image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload profile image');
        } finally {
            setIsImageUploading(false);
        }
    };

    // Upload resume PDF and extract text using backend parsing
    const handleResumeUpload = async () => {
        try {
            setIsResumeUploading(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
                multiple: false
            });

            if (!result.assets || result.assets.length === 0) {
                Alert.alert('Notice', 'No file was selected.');
                setIsResumeUploading(false);
                return;
            }

            const file = result.assets[0];

            const formData = new FormData();
            formData.append('resume', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf'
            } as any);

            const token = await AsyncStorage.getItem('token');

            const response = await axios.post(
                `${getBackendURL()}/parse-resume`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Save extracted resume text
            setProfile(prev => ({ ...prev, resumeText: response.data.text }));
            setPdfFileName(file.name);
            Alert.alert('Success', 'Resume uploaded and parsed successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to upload resume. You can still enter your resume text manually.');
            console.error('Resume upload error:', error);
        } finally {
            setIsResumeUploading(false);
        }
    };

    // Submit student profile to backend and navigate back to login
    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                goToLogin();
                return;
            }

            await axios.post(
                `${getBackendURL()}/user/setup`,
                profile,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await AsyncStorage.removeItem('token');
            goToLogin();
        } catch (error: any) {
            await AsyncStorage.removeItem('token');
            goToLogin();
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear navigation stack and send user to login
    const goToLogin = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'AuthLogin' }],
            })
        );
    };

    // Handle text input updates and remove validation errors as needed
    const handleTextChange = (field: keyof StudentProfile, value: string) => {
        if (errors[field as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}> 
            <SetupScreen
                navigation={navigation}
                contentContainerStyle={[styles.contentContainer, { backgroundColor }]}
            >
                <Text style={[styles.title, { color: textColor }]}>
                    Create Profile
                </Text>

                <Text style={[styles.subtitle, { color: placeholderTextColor }]}>
                    Fill in the details below
                </Text>

                <View style={styles.profileImageContainer}>
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={[styles.profileImagePlaceholder, { 
                            backgroundColor: inputBackground, 
                            borderColor: borderColor,
                            borderWidth: 1,
                            }]}>
                            <Text style={{ color: placeholderTextColor, fontSize: 16 }}>
                                Add Photo
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.imageUploadButton}
                        onPress={handleImageUpload}
                        disabled={isImageUploading}
                    >
                        {isImageUploading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.imageUploadButtonText}>
                                {profileImage ? 'Change Profile Picture' : 'Upload Profile Picture'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    {[
                        { key: 'university', label: 'University', required: true },
                        { key: 'major', label: 'Major', required: true },
                        { key: 'experience', label: 'Experience', required: false },
                        { key: 'skills', label: 'Skills', required: true },
                        { key: 'projects', label: 'Projects', required: false },
                        { key: 'certifications', label: 'Certifications', required: false }
                    ].map(field => (
                        <View style={styles.inputGroup} key={field.key}>
                            <Text style={[styles.label, { color: textColor }]}>
                                {field.label} {field.required && <Text style={styles.required}>*</Text>}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: inputBackground, color: inputTextColor },
                                    errors[field.key as keyof ValidationErrors] ? styles.inputError : null
                                ]}
                                placeholder={`e.g., ${field.label === 'University' ? 'University of Oklahoma' :
                                    field.label === 'Major' ? 'Computer Science' :
                                        field.label === 'Skills' ? 'Python, ML, Data Analysis' :
                                            ''}`}
                                placeholderTextColor={placeholderTextColor}
                                multiline={['experience', 'projects', 'certifications'].includes(field.key)}
                                numberOfLines={['experience', 'projects', 'certifications'].includes(field.key) ? 3 : 1}
                                value={profile[field.key as keyof StudentProfile]}
                                onChangeText={(text) => handleTextChange(field.key as keyof StudentProfile, text)}
                            />
                            {errors[field.key as keyof ValidationErrors] && (
                                <Text style={styles.errorText}>{errors[field.key as keyof ValidationErrors]}</Text>
                            )}
                        </View>
                    ))}

                    <View style={styles.resumeSection}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Resume</Text>

                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleResumeUpload}
                            disabled={isResumeUploading}
                        >
                            {isResumeUploading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.uploadButtonText}>
                                    {pdfFileName || 'Upload PDF Resume'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.orText, { color: textColor }]}>OR</Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.resumeInput,
                                { 
                                    backgroundColor: inputBackground, 
                                    color: inputTextColor,
                                    borderColor: borderColor,
                                }
                            ]}
                            placeholder="Paste your resume text here"
                            placeholderTextColor={placeholderTextColor}
                            multiline
                            numberOfLines={6}
                            value={profile.resumeText}
                            onChangeText={(text) => handleTextChange('resumeText', text)}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting ? styles.disabledButton : null]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Complete Setup</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SetupScreen>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    contentContainer: { padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 0, },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
    profileImageContainer: { alignItems: 'center', marginBottom: 30 },
    profileImage: { width: 150, height: 150, borderRadius: 75, marginBottom: 15 },
    profileImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd', // dynamically set via inline now
        padding: 12,
    },
    imageUploadButton: {
        backgroundColor: '#893030',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    imageUploadButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    formContainer: { width: '100%', maxWidth: 600, alignSelf: 'center' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    required: { color: 'red' },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', marginTop: 5, fontSize: 14 },
    resumeInput: { minHeight: 120 },
    resumeSection: { marginTop: 20, marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    uploadButton: {
        backgroundColor: '#893030',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    orText: { textAlign: 'center', marginVertical: 15, fontSize: 16, fontWeight: 'bold' },
    submitButton: {
        backgroundColor: '#893030',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default ProfileSetupStudent;