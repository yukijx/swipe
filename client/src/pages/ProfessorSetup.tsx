import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ResponsiveScreen} from '../components/ResponsiveScreen';

interface ProfessorProfile {
    university: string;
    department: string;
    researchInterests: string;
    biography: string;
    publications: string;
    officeHours: string;
    contactInfo: string;
}

const ProfessorSetup = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const [profile, setProfile] = useState<ProfessorProfile>({
        university: '',
        department: '',
        researchInterests: '',
        biography: '',
        publications: '',
        officeHours: '',
        contactInfo: ''
    });

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post('http://localhost:5000/user/setup', 
                profile,
                { headers: { Authorization: token } }
            );
            
            Alert.alert('Success', 'Profile setup complete!');
            navigation.navigate('FacultyHome');
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: theme === 'light' ? '#893030' : '#fff' }]}>
                Complete Your Faculty Profile
            </Text>

            <View style={styles.formContainer}>
                {(Object.keys(profile) as Array<keyof ProfessorProfile>).map((field) => (
                    <TextInput
                        key={field}
                        style={[
                            styles.input,
                            ['biography', 'researchInterests', 'publications'].includes(field) && styles.multiline
                        ]}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        value={profile[field]}
                        onChangeText={(text) => setProfile({ ...profile, [field]: text })}
                        multiline={['biography', 'researchInterests', 'publications'].includes(field)}
                    />
                ))}

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
    multiline: {
        height: 100,
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

export default ProfessorSetup; 