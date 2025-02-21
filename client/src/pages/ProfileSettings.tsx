import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../hooks/useAuth';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

interface StudentProfile {
    name: string;
    university: string;
    major: string;
    experience: string;
    skills: string;
    projects: string;
    certifications: string;
    resumeText: string;
}

interface ProfessorProfile {
    name: string;
    university: string;
    department: string;
    researchInterests: string;
    biography: string;
    publications: string;
    officeHours: string;
    contactInfo: string;
}

const ProfileSettings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    
    const [studentProfile, setStudentProfile] = useState<StudentProfile>({
        name: '',
        university: '',
        major: '',
        experience: '',
        skills: '',
        projects: '',
        certifications: '',
        resumeText: ''
    });

    const [professorProfile, setProfessorProfile] = useState<ProfessorProfile>({
        name: '',
        university: '',
        department: '',
        researchInterests: '',
        biography: '',
        publications: '',
        officeHours: '',
        contactInfo: ''
    });

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
            
            if (isFaculty) {
                setProfessorProfile(response.data);
            } else {
                setStudentProfile(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile');
        }
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const profileData = isFaculty ? professorProfile : studentProfile;
            
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

    const handleTextChange = (field: string, value: string, isStudent: boolean) => {
        if (isStudent) {
            setStudentProfile(prev => ({
                ...prev,
                [field]: value
            }));
        } else {
            setProfessorProfile(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const renderStudentFields = () => (
        <>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={studentProfile.name}
                onChangeText={(text) => handleTextChange('name', text, true)}
            />
            <TextInput
                style={styles.input}
                placeholder="University"
                value={studentProfile.university}
                onChangeText={(text) => handleTextChange('university', text, true)}
            />
            <TextInput
                style={styles.input}
                placeholder="Major"
                value={studentProfile.major}
                onChangeText={(text) => handleTextChange('major', text, true)}
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Experience"
                value={studentProfile.experience}
                onChangeText={(text) => handleTextChange('experience', text, true)}
                multiline
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Skills"
                value={studentProfile.skills}
                onChangeText={(text) => handleTextChange('skills', text, true)}
                multiline
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Projects"
                value={studentProfile.projects}
                onChangeText={(text) => handleTextChange('projects', text, true)}
                multiline
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Certifications"
                value={studentProfile.certifications}
                onChangeText={(text) => handleTextChange('certifications', text, true)}
                multiline
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Resume Text"
                value={studentProfile.resumeText}
                onChangeText={(text) => handleTextChange('resumeText', text, true)}
                multiline
            />
        </>
    );

    const renderProfessorFields = () => (
        <>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={professorProfile.name}
                onChangeText={(text) => handleTextChange('name', text, false)}
            />
            <TextInput
                style={styles.input}
                placeholder="University"
                value={professorProfile.university}
                onChangeText={(text) => handleTextChange('university', text, false)}
            />
            <TextInput
                style={styles.input}
                placeholder="Department"
                value={professorProfile.department}
                onChangeText={(text) => handleTextChange('department', text, false)}
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Research Interests"
                value={professorProfile.researchInterests}
                onChangeText={(text) => handleTextChange('researchInterests', text, false)}
                multiline
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Biography"
                value={professorProfile.biography}
                onChangeText={(text) => handleTextChange('biography', text, false)}
                multiline
            />
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Publications"
                value={professorProfile.publications}
                onChangeText={(text) => handleTextChange('publications', text, false)}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Office Hours"
                value={professorProfile.officeHours}
                onChangeText={(text) => handleTextChange('officeHours', text, false)}
            />
            <TextInput
                style={styles.input}
                placeholder="Contact Information"
                value={professorProfile.contactInfo}
                onChangeText={(text) => handleTextChange('contactInfo', text, false)}
            />
        </>
    );

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: textColor }]}>
                {isFaculty ? 'Faculty Profile Settings' : 'Student Profile Settings'}
            </Text>

            <View style={styles.formContainer}>
                {isFaculty ? renderProfessorFields() : renderStudentFields()}

                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Save Changes</Text>
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    input: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    multiline: {
        height: 120,
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
