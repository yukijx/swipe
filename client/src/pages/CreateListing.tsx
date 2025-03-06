import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from "../components/ThemedView";
import { ResponsiveContainer } from "../components/ResponsiveContainer";
import NavBar from "../components/NavBar";
import { webStyles } from "../utils/webStyles";
import { ResponsiveScreen } from '../components/ResponsiveScreen';

const CreateListing = ({ navigation, route }: { navigation: any, route: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const isEditing = route.params?.isEditing || false;
    const existingListing = route.params?.listing;

    const [listing, setListing] = useState({
        title: existingListing?.title || '',
        description: existingListing?.description || '',
        requirements: existingListing?.requirements || '',
        duration: existingListing?.duration || '',
        compensation: existingListing?.compensation || ''
    });

    const handleSubmit = async () => {
        try {
            if (!isFaculty) {
                Alert.alert('Error', 'Only faculty can create listings');
                return;
            }

            const token = await AsyncStorage.getItem('token');
            
            if (isEditing) {
                await axios.put(
                    `http://localhost:5000/listings/${existingListing._id}`,
                    listing,
                    { headers: { Authorization: token } }
                );
                Alert.alert('Success', 'Listing updated successfully');
            } else {
                await axios.post(
                    'http://localhost:5000/listings/create',
                    listing,
                    { headers: { Authorization: token } }
                );
                Alert.alert('Success', 'Listing created successfully');
            }
            
            navigation.navigate('FacultyHome');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to save listing');
        }
    };

    const webInputStyle = Platform.OS === 'web' ? {
        borderColor: '#893030',
        borderWidth: 1,
        outline: 'none'
    } : {};

    const webButtonStyle = Platform.OS === 'web' ? {
        cursor: 'pointer' as const,
        WebkitTransition: 'all 0.2s ease',
        MozTransition: 'all 0.2s ease',
        OTransition: 'all 0.2s ease',
        msTransition: 'all 0.2s ease'
    } : {};

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: theme === 'light' ? '#893030' : '#fff' }]}>
                {isEditing ? "Edit Listing" : "Create Listing"}
            </Text>

            <TextInput
                style={[styles.input, webInputStyle]}
                placeholder="Research Title"
                placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                value={listing.title}
                onChangeText={(text) => setListing({...listing, title: text})}
            />
            
            <TextInput
                style={[styles.input, styles.multiline, webInputStyle]}
                placeholder="Description"
                placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                multiline
                numberOfLines={4}
                value={listing.description}
                onChangeText={(text) => setListing({...listing, description: text})}
            />
            
            <TextInput
                style={[styles.input, styles.multiline, webInputStyle]}
                placeholder="Requirements"
                placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                multiline
                numberOfLines={4}
                value={listing.requirements}
                onChangeText={(text) => setListing({...listing, requirements: text})}
            />
            
            <TextInput
                style={[styles.input, webInputStyle]}
                placeholder="Duration (e.g., '3 months')"
                placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                value={listing.duration}
                onChangeText={(text) => setListing({...listing, duration: text})}
            />
            
            <TextInput
                style={[styles.input, webInputStyle]}
                placeholder="Compensation"
                placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                value={listing.compensation}
                onChangeText={(text) => setListing({...listing, compensation: text})}
            />

            <TouchableOpacity 
                style={[
                    styles.button,
                    webButtonStyle
                ]}
                onPress={handleSubmit}
            >
                <Text style={styles.buttonText}>
                    {isEditing ? "Update Listing" : "Create Listing"}
                </Text>
            </TouchableOpacity>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: 'center',
        minHeight: Platform.OS === 'web' ? '100%' : undefined,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        padding: 20,
        alignItems: 'center' as const,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        marginBottom: 20,
        textAlign: 'center' as const,
    },
    input: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        maxWidth: 500,
        fontSize: 16,
    },
    multiline: {
        height: 120,
        textAlignVertical: 'top' as const,
    },
    button: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        maxWidth: 500,
        alignItems: 'center' as const,
        marginTop: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold' as const,
    }
});

export default CreateListing;

