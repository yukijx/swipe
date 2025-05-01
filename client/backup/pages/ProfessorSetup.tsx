import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SetupScreen from '../components/SetupScreen';
import { getBackendURL } from '../utils/network';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';

interface ProfessorProfile {
    university: string;
    department: string;
    researchInterests: string;
    biography: string;
    publications: string;
    officeHours: string;
    contactInfo: string;
}

interface ValidationErrors {
    university?: string;
    department?: string;
}

const ProfessorSetup = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [profile, setProfile] = useState<ProfessorProfile>({
        university: '',
        department: '',
        researchInterests: '',
        biography: '',
        publications: '',
        officeHours: '',
        contactInfo: ''
    });

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
            console.log('Submitting professor profile data...');
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

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        if (!profile.university.trim()) {
            newErrors.university = 'University is required';
        }
        
        if (!profile.department.trim()) {
            newErrors.department = 'Department is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleTextChange = (field: keyof ProfessorProfile, value: string) => {
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
                Complete Your Faculty Profile
            </Text>
            
            <Text style={styles.subtitle}>
                Fill in your details to share with potential research assistants
            </Text>
            
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
                    <Text style={styles.label}>Department <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.department ? styles.inputError : null]}
                        placeholder="e.g., Computer Science"
                        value={profile.department}
                        onChangeText={(text) => handleTextChange('department', text)}
                    />
                    {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Research Interests</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="e.g., Machine Learning, Artificial Intelligence"
                        value={profile.researchInterests}
                        onChangeText={(text) => handleTextChange('researchInterests', text)}
                        multiline
                        numberOfLines={3}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Biography</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Briefly describe your academic background and research"
                        value={profile.biography}
                        onChangeText={(text) => handleTextChange('biography', text)}
                        multiline
                        numberOfLines={5}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Publications</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="List your key publications or research work"
                        value={profile.publications}
                        onChangeText={(text) => handleTextChange('publications', text)}
                        multiline
                        numberOfLines={4}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Office Hours</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Mon, Wed 1-3 PM"
                        value={profile.officeHours}
                        onChangeText={(text) => handleTextChange('officeHours', text)}
                    />
                </View>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contact Information</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Office: Room 123, Devon Hall"
                        value={profile.contactInfo}
                        onChangeText={(text) => handleTextChange('contactInfo', text)}
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
        minHeight: Platform.OS === 'web' ? '100%' : undefined,
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
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    multilineInput: {
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
    disabledButton: {
        backgroundColor: '#999',
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        fontSize: 14,
    },
});

export default ProfessorSetup; 