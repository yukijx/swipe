import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SetupScreen from '../components/SetupScreen';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { getBackendURL } from '../utils/network';
import { CommonActions } from '@react-navigation/native';

interface StudentProfile {
    university: string;
    major: string;
    experience: string;
    skills: string;
    projects: string;
    certifications: string;
    resumeText: string;
}

interface ValidationErrors {
    university?: string;
    major?: string;
    skills?: string;
}

const StudentSetup = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const [profile, setProfile] = useState<StudentProfile>({
        university: '',
        major: '',
        experience: '',
        skills: '',
        projects: '',
        certifications: '',
        resumeText: ''
    });
    const [pdfFileName, setPdfFileName] = useState<string>('');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResumeUploading, setIsResumeUploading] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        if (!profile.university.trim()) {
            newErrors.university = 'University is required';
        }
        
        if (!profile.major.trim()) {
            newErrors.major = 'Major is required';
        }
        
        if (!profile.skills.trim()) {
            newErrors.skills = 'Skills are required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = async () => {
        try {
            // Request permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
                return;
            }

            setIsImageUploading(true);
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
            
            // Create form data for image upload
            const formData = new FormData();
            formData.append('profileImage', {
                uri: selectedImage.uri,
                name: 'profile-image.jpg',
                type: 'image/jpeg',
            } as any);

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'You are not logged in');
                navigation.navigate('Login');
                return;
            }

            console.log('Uploading profile image...');
            
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

            console.log('Image upload response:', response.data);
            setProfileImage(response.data.profileImage.url);
            Alert.alert('Success', 'Profile image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload profile image');
        } finally {
            setIsImageUploading(false);
        }
    };

    const handleResumeUpload = async () => {
        try {
            setIsResumeUploading(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
                multiple: false
            });
    
            // Check if user canceled the selection or if assets is null
            if (!result.assets || result.assets.length === 0) {
                Alert.alert('Notice', 'No file was selected.');
                setIsResumeUploading(false);
                return;
            }
    
            const file = result.assets[0];
    
            if (file) {
                // Create form data for file upload
                const formData = new FormData();
                formData.append('resume', {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/pdf'
                } as any);
    
                const token = await AsyncStorage.getItem('token');
                console.log('Uploading resume...');
                
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
    
                console.log('Resume upload response:', response.data);
                
                // Update profile with extracted text
                setProfile(prev => ({
                    ...prev,
                    resumeText: response.data.text
                }));
                setPdfFileName(file.name);
                Alert.alert('Success', 'Resume uploaded and parsed successfully');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload resume. You can still enter your resume text manually.');
            console.error('Resume upload error:', error);
        } finally {
            setIsResumeUploading(false);
        }
    };
    
    const handleSubmit = async () => {
        console.log('Complete Setup button clicked');
        
        if (!validateForm()) {
            console.log('Form validation failed - required fields missing');
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        
        console.log('Form validation passed, proceeding with submission');
        
        try {
            setIsSubmitting(true);
            console.log('Checking for authentication token');
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                console.log('No token found, redirecting to Login');
                // Navigate directly without alert
                goToLogin();
                return;
            }
            
            console.log('Token found:', token.substring(0, 10) + '...');
            console.log('Submitting student profile data...');
            console.log('Backend URL:', getBackendURL());
            
            console.log('Making API request to /user/setup');
            const response = await axios.post(
                `${getBackendURL()}/user/setup`, 
                profile,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Server response received:', response.status);
            
            // Clear token
            console.log('Clearing authentication token');
            await AsyncStorage.removeItem('token');
            
            // Navigate directly without alert
            console.log('Navigating directly to Login');
            goToLogin();
            
        } catch (error: any) {
            console.error('Error saving profile:', error);
            console.log('Error occurred during profile submission');
            
            // Navigate directly without alert even on error
            console.log('Error occurred, but still navigating to Login');
            await AsyncStorage.removeItem('token');
            goToLogin();
            
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Function to go directly to login page with the most reliable method
    const goToLogin = () => {
        console.log('Force navigating to Login using reset');
        // Use the most direct and forceful navigation method
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    const handleTextChange = (field: keyof StudentProfile, value: string) => {
        // Clear error when user starts typing
        if (errors[field as keyof ValidationErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
        
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <SetupScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: theme === 'light' ? '#893030' : '#fff' }]}>
                Complete Your Profile
            </Text>
            
            <Text style={styles.subtitle}>
                Fill in your details to help faculty find the right candidates for their research projects
            </Text>

            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
                {profileImage ? (
                    <Image 
                        source={{ uri: profileImage }} 
                        style={styles.profileImage} 
                    />
                ) : (
                    <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImagePlaceholderText}>
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

            {/* Regular profile fields */}
            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>University <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.university ? styles.inputError : null]}
                        placeholder="e.g., University of Oklahoma"
                        value={profile.university}
                        onChangeText={(text) => handleTextChange('university', text)}
                    />
                    {errors.university && <Text style={styles.errorText}>{errors.university}</Text>}
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Major <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.major ? styles.inputError : null]}
                        placeholder="e.g., Computer Science"
                        value={profile.major}
                        onChangeText={(text) => handleTextChange('major', text)}
                    />
                    {errors.major && <Text style={styles.errorText}>{errors.major}</Text>}
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Experience</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe your research or work experience"
                        value={profile.experience}
                        onChangeText={(text) => handleTextChange('experience', text)}
                        multiline
                        numberOfLines={3}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Skills <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.skills ? styles.inputError : null]}
                        placeholder="e.g., Python, Data Analysis, Machine Learning"
                        value={profile.skills}
                        onChangeText={(text) => handleTextChange('skills', text)}
                        multiline
                    />
                    {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Projects</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe any relevant projects you've worked on"
                        value={profile.projects}
                        onChangeText={(text) => handleTextChange('projects', text)}
                        multiline
                        numberOfLines={3}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Certifications</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="List any relevant certifications"
                        value={profile.certifications}
                        onChangeText={(text) => handleTextChange('certifications', text)}
                        multiline
                    />
                </View>

                {/* Resume section */}
                <View style={styles.resumeSection}>
                    <Text style={styles.sectionTitle}>Resume</Text>
                    
                    {/* PDF Upload */}
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

                    <Text style={styles.orText}>OR</Text>

                    {/* Resume Text Input */}
                    <TextInput
                        style={[styles.input, styles.resumeInput]}
                        placeholder="Paste your resume text here"
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
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 15,
    },
    profileImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    profileImagePlaceholderText: {
        color: '#999',
        fontSize: 16,
    },
    imageUploadButton: {
        backgroundColor: '#893030',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    imageUploadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    formContainer: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    required: {
        color: 'red',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        fontSize: 14,
    },
    resumeInput: {
        minHeight: 120,
    },
    resumeSection: {
        marginTop: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    uploadButton: {
        backgroundColor: '#893030',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orText: {
        textAlign: 'center',
        marginVertical: 15,
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#893030',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default StudentSetup; 