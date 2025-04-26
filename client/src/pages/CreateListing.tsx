import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedView from "../components/ThemedView";
import { ResponsiveContainer } from "../components/ResponsiveContainer";
import NavBar from "../components/NavBar";
import { webStyles } from "../utils/webStyles";
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { getBackendURL } from "../utils/network";

const CreateListing = ({ navigation, route }: { navigation: any, route: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const isEditing = route.params?.isEditing || false;
    const existingListing = route.params?.listing;

    const [listing, setListing] = useState({
        title: existingListing?.title || '',
        description: existingListing?.description || '',
        requirements: existingListing?.requirements || '',
        duration: {
            value: existingListing?.duration?.value || '',
            unit: existingListing?.duration?.unit || 'months'
        },
        wage: {
            type: existingListing?.wage?.type || 'hourly',
            amount: existingListing?.wage?.amount || '',
            isPaid: existingListing?.wage?.isPaid ?? true
        }
    });

    const handleSubmit = async () => {
        try {
            if (!isFaculty) {
                Alert.alert('Error', 'Only faculty can create listings');
                return;
            }

            // Validate form data
            if (!listing.title || !listing.description || !listing.requirements) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            // Convert duration value to number
            const formData = {
                ...listing,
                duration: {
                    ...listing.duration,
                    value: Number(listing.duration.value)
                },
                wage: {
                    ...listing.wage,
                    amount: Number(listing.wage.amount)
                }
            };

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }
            
            console.log(`Creating/updating listing with token: ${token.substring(0, 10)}...`);
            console.log('Form data:', JSON.stringify(formData, null, 2));
            
            if (isEditing) {
                console.log(`Updating listing ${existingListing._id}`);
                await axios.put(
                    `${getBackendURL()}/listings/${existingListing._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Alert.alert(
                    'Success', 
                    'Listing updated successfully',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => navigation.navigate('ListListings')
                        }
                    ]
                );
            } else {
                console.log('Creating new listing');
                console.log('Authorization header:', `Bearer ${token}`);
                
                try {
                    const response = await axios.post(
                        `${getBackendURL()}/listings/create`,
                        formData,
                        { 
                            headers: { 
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    console.log('Server response:', response.status, response.statusText);
                    console.log('Response data:', JSON.stringify(response.data, null, 2));
                    
                    Alert.alert(
                        'Success', 
                        'Listing created successfully',
                        [
                            { 
                                text: 'OK', 
                                onPress: () => navigation.navigate('ListListings')
                            }
                        ]
                    );
                } catch (error: any) {
                    console.error('Error creating listing:', error);
                    if (error.response) {
                        console.error('Response status:', error.response.status);
                        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
                    } else if (error.request) {
                        console.error('No response received:', error.request);
                    } else {
                        console.error('Error message:', error.message);
                    }
                    throw error; // Re-throw to be caught by the outer catch block
                }
            }
        } catch (error: any) {
            console.error('Error saving listing:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
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
            
            <View style={styles.durationContainer}>
                <TextInput
                    style={[styles.input, styles.durationInput, webInputStyle]}
                    placeholder="Duration Value"
                    placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                    keyboardType="numeric"
                    value={listing.duration.value.toString()}
                    onChangeText={(text) => setListing({
                        ...listing,
                        duration: { ...listing.duration, value: text }
                    })}
                />
                <TextInput
                    style={[styles.input, styles.durationInput, webInputStyle]}
                    placeholder="Duration Unit (days/weeks/months/years)"
                    value={listing.duration.unit}
                    onChangeText={(text) => setListing({
                        ...listing,
                        duration: { ...listing.duration, unit: text }
                    })}
                />
            </View>
            
            <View style={styles.wageContainer}>
                <TextInput
                    style={[styles.input, styles.wageInput, webInputStyle]}
                    placeholder="Wage Amount"
                    keyboardType="numeric"
                    value={listing.wage.amount.toString()}
                    onChangeText={(text) => setListing({
                        ...listing,
                        wage: { ...listing.wage, amount: text }
                    })}
                />
                <TextInput
                    style={[styles.input, styles.wageInput, webInputStyle]}
                    placeholder="Wage Type (hourly/monthly/total)"
                    value={listing.wage.type}
                    onChangeText={(text) => setListing({
                        ...listing,
                        wage: { ...listing.wage, type: text }
                    })}
                />
                <TouchableOpacity
                    style={[styles.isPaidButton, { backgroundColor: listing.wage.isPaid ? '#4CAF50' : '#f44336' }]}
                    onPress={() => setListing({
                        ...listing,
                        wage: { ...listing.wage, isPaid: !listing.wage.isPaid }
                    })}
                >
                    <Text style={styles.isPaidButtonText}>
                        {listing.wage.isPaid ? 'Paid' : 'Unpaid'}
                    </Text>
                </TouchableOpacity>
            </View>

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
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 500,
        marginBottom: 15,
    },
    durationInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    wageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 500,
        marginBottom: 15,
    },
    wageInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    isPaidButton: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    isPaidButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
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

