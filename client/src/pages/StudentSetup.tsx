import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import * as DocumentPicker from 'expo-document-picker';

interface StudentProfile {
    university: string;
    major: string;
    experience: string;
    skills: string;
    projects: string;
    certifications: string;
    resumeText: string;
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

    const handleResumeUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
                multiple: false
            });
    
            // Check if user canceled the selection or if assets is null
            if (!result.assets || result.assets.length === 0) {
                Alert.alert('Notice', 'No file was selected.');
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
                const response = await axios.post(
                    'http://localhost:5001/parse-resume',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': token
                        }
                    }
                );
    
                // Update profile with extracted text
                setProfile(prev => ({
                    ...prev,
                    resumeText: response.data.text
                }));
                setPdfFileName(file.name);
                Alert.alert('Success', 'Resume uploaded and parsed successfully');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload resume');
            console.error(error);
        }
    };
    

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            // Log the profile data before sending
            console.log('Submitting profile:', profile);
            
            const response = await axios.post(
                'http://localhost:5000/user/setup', 
                profile,
                { headers: { Authorization: token } }
            );

            console.log('Server response:', response.data);
            Alert.alert('Success', 'Profile setup complete!');
            navigation.navigate('Home');
        } catch (error: any) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to save profile');
        }
    };

    const handleTextChange = (field: keyof StudentProfile, value: string) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: theme === 'light' ? '#893030' : '#fff' }]}>
                Complete Your Profile
            </Text>

            {/* Regular profile fields */}
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="University"
                    value={profile.university}
                    onChangeText={(text) => handleTextChange('university', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Major"
                    value={profile.major}
                    onChangeText={(text) => handleTextChange('major', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Experience"
                    value={profile.experience}
                    onChangeText={(text) => handleTextChange('experience', text)}
                    multiline
                />
                <TextInput
                    style={styles.input}
                    placeholder="Skills"
                    value={profile.skills}
                    onChangeText={(text) => handleTextChange('skills', text)}
                    multiline
                />
                <TextInput
                    style={styles.input}
                    placeholder="Projects"
                    value={profile.projects}
                    onChangeText={(text) => handleTextChange('projects', text)}
                    multiline
                />
                <TextInput
                    style={styles.input}
                    placeholder="Certifications"
                    value={profile.certifications}
                    onChangeText={(text) => handleTextChange('certifications', text)}
                    multiline
                />

                {/* Resume section */}
                <View style={styles.resumeSection}>
                    <Text style={styles.sectionTitle}>Resume</Text>
                    
                    {/* PDF Upload */}
                    <TouchableOpacity 
                        style={styles.uploadButton}
                        onPress={handleResumeUpload}
                    >
                        <Text style={styles.uploadButtonText}>
                            {pdfFileName || 'Upload PDF Resume'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>OR</Text>

                    {/* Resume Text Input */}
                    <TextInput
                        style={[styles.input, styles.resumeInput]}
                        placeholder="Paste your resume text here"
                        multiline
                        value={profile.resumeText}
                        onChangeText={(text) => handleTextChange('resumeText', text)}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Complete Setup</Text>
                </TouchableOpacity>
            </View>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        minHeight: Platform.OS === 'web' ? '100%' : undefined,
    },
    formContainer: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#ffffff',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resumeSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    uploadButton: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    orText: {
        textAlign: 'center',
        marginVertical: 15,
        fontSize: 16,
    },
    resumeInput: {
        height: 200,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default StudentSetup; 