import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../hooks/useAuth';

interface PrivacySettings {
    name: boolean;
    university: boolean;
    major: boolean;
    experience: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
    profileImage: boolean;
    resumeText: boolean;
}

const PrivacySettings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const backgroundColor = theme === 'light' ? '#ffffff' : '#333';
    
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        name: true,
        university: true,
        major: true,
        experience: true,
        skills: true,
        projects: true,
        certifications: true,
        profileImage: true,
        resumeText: false
    });

    useEffect(() => {
        fetchPrivacySettings();
    }, []);

    const fetchPrivacySettings = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/user/privacy-settings',
                { headers: { Authorization: token } }
            );
            setPrivacySettings(response.data.privacySettings);
        } catch (error) {
            console.error('Failed to fetch privacy settings:', error);
        }
    };

    const handleToggle = async (key: keyof PrivacySettings) => {
        try {
            const newSettings = {
                ...privacySettings,
                [key]: !privacySettings[key]
            };
            
            const token = await AsyncStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/user/privacy-settings',
                { privacySettings: newSettings },
                { headers: { Authorization: token } }
            );
            
            setPrivacySettings(newSettings);
        } catch (error) {
            console.error('Failed to update privacy settings:', error);
        }
    };

    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>Privacy Settings</Text>
                
                <View style={[styles.section, { backgroundColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Profile Visibility
                    </Text>
                    <Text style={[styles.description, { color: textColor }]}>
                        Control what information is visible to other users
                    </Text>

                    {Object.entries(privacySettings).map(([key, value]) => (
                        <View 
                            key={key} 
                            style={[
                                styles.settingRow,
                                { borderBottomColor: theme === 'light' ? '#eee' : '#444' }
                            ]}
                        >
                            <View style={styles.settingInfo}>
                                <Text style={[styles.settingLabel, { color: textColor }]}>
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </Text>
                                <Text style={[
                                    styles.settingDescription,
                                    { color: theme === 'light' ? '#666' : '#aaa' }
                                ]}>
                                    {value ? 'Visible to others' : 'Private'}
                                </Text>
                            </View>
                            <Switch
                                value={value}
                                onValueChange={() => handleToggle(key as keyof PrivacySettings)}
                                trackColor={{ 
                                    false: theme === 'light' ? '#ddd' : '#444',
                                    true: '#893030'
                                }}
                                thumbColor={theme === 'light' ? '#fff' : '#f4f3f4'}
                                ios_backgroundColor={theme === 'light' ? '#ddd' : '#444'}
                            />
                        </View>
                    ))}
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
    section: {
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        } : {
            elevation: 2
        })
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
        opacity: 0.8,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    settingInfo: {
        flex: 1,
        marginRight: 20,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    }
});

export default PrivacySettings; 