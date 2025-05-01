import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedView from "../components/ThemedView";
import { ResponsiveContainer } from "../components/ResponsiveContainer";
import { webStyles } from "../utils/webStyles";
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { getBackendURL } from "../utils/network";
import { Picker } from '@react-native-picker/picker';

const ListingCreate = ({ navigation, route }: { navigation: any, route: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
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

    const durationOptions = ['days', 'weeks', 'months', 'years'];
    const wageTypeOptions = ['hourly', 'weekly', 'monthly', 'total'];

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
                navigation.navigate('AuthLogin');
                return;
            }
            
            // Verify token before proceeding
            try {
                console.log('Verifying token before creating listing...');
                const backendURL = await getBackendURL();
                const verifyResponse = await axios.get(
                    `${backendURL}/test/verify-token`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (!verifyResponse.data.valid) {
                    console.error('Token verification failed');
                    Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
                    navigation.navigate('AuthLogin');
                    return;
                }
                
                console.log('Token verified successfully. User role:', 
                    verifyResponse.data.isFaculty ? 'Faculty' : 'Student');
            } catch (verifyError) {
                console.warn('Token verification endpoint not available, proceeding anyway');
            }
            
            console.log(`Creating/updating listing with token: ${token.substring(0, 10)}...`);
            console.log('Form data:', JSON.stringify(formData, null, 2));
            
            if (isEditing) {
                console.log(`Updating listing ${existingListing._id}`);
                // Properly await the getBackendURL call
                const backendURL = await getBackendURL();
                await axios.put(
                    `${backendURL}/listings/${existingListing._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Navigate immediately to ListListings
                navigation.navigate('ListingManagement');
                
                // Then show the success alert
                Alert.alert(
                    'Success', 
                    'Listing updated successfully'
                );
            } else {
                console.log('Creating new listing');
                console.log('Authorization header:', `Bearer ${token}`);
                
                try {
                    // Properly await the getBackendURL call
                    const backendURL = await getBackendURL();
                    console.log(`Attempting to create listing at: ${backendURL}/listings/create`);
                    console.log('Request payload:', JSON.stringify(formData));
                    
                    try {
                        // First try the /listings/create endpoint
                        const response = await axios.post(
                            `${backendURL}/listings/create`,
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
                        
                        // Navigate immediately to ListingManagement
                        navigation.navigate('ListingManagement');
                        
                        // Then show the success alert
                        Alert.alert(
                            'Success', 
                            'Listing created successfully'
                        );
                    } catch (error: any) {
                        // If primary endpoint fails, try the test endpoint
                        console.log('Primary endpoint failed, trying test endpoint');
                        
                        const testResponse = await axios.post(
                            `${backendURL}/test/faculty-listings/create`,
                            formData,
                            { 
                                headers: { 
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        
                        console.log('Test endpoint response:', testResponse.status, testResponse.statusText);
                        console.log('Test response data:', JSON.stringify(testResponse.data, null, 2));
                        
                        // Navigate immediately to ListingManagement
                        navigation.navigate('ListingManagement');
                        
                        // Then show the success alert
                        Alert.alert(
                            'Success', 
                            'Listing created successfully (using test endpoint)'
                        );
                    }
                } catch (error: any) {
                    console.error('Error creating listing:', error);
                    if (error.response) {
                        console.error('Response status:', error.response.status);
                        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
                        
                        // Show specific error message from the server if available
                        Alert.alert(
                            'Error', 
                            error.response.data?.error || error.response.data?.message || 'Failed to create listing'
                        );
                    } else if (error.request) {
                        console.error('No response received:', error.request);
                        Alert.alert('Network Error', 'No response received from server. Please check your connection.');
                    } else {
                        console.error('Error message:', error.message);
                        Alert.alert('Error', error.message || 'Failed to create listing');
                    }
                }
            }
        } catch (error: any) {
            console.error('Error saving listing:', error);
            Alert.alert('Error', 'Failed to save listing. Please try again.');
        }
    };

    const webInputStyle = Platform.OS === 'web' ? {
        borderColor: '#893030',
        borderWidth: 1,
        outlineWidth: 0,
        outlineStyle: 'none'
    } : {};

    const webButtonStyle = Platform.OS === 'web' ? {
        cursor: 'pointer' as const,
        WebkitTransition: 'all 0.2s ease',
        MozTransition: 'all 0.2s ease',
        OTransition: 'all 0.2s ease',
        msTransition: 'all 0.2s ease'
    } : {};
    
    const pickerBackgroundColor = theme === 'light' ? '#fff' : '#333';
    const pickerTextColor = theme === 'light' ? '#000' : '#fff';

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
            
            <Text style={styles.sectionLabel}>Duration</Text>
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
                <View style={[styles.pickerContainer, { backgroundColor: pickerBackgroundColor }]}>
                    {Platform.OS === 'web' ? (
                        <select
                            value={listing.duration.unit}
                            onChange={(e) => setListing({
                                ...listing,
                                duration: { ...listing.duration, unit: e.target.value }
                            })}
                            style={{
                                height: 50,
                                width: '100%',
                                padding: 10,
                                borderColor: '#893030',
                                borderWidth: 1,
                                backgroundColor: pickerBackgroundColor,
                                color: pickerTextColor
                            }}
                        >
                            {durationOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    ) : (
                        <Picker
                            selectedValue={listing.duration.unit}
                            onValueChange={(itemValue: string) => setListing({
                                ...listing,
                                duration: { ...listing.duration, unit: itemValue }
                            })}
                            style={{ height: 50, width: '100%', color: pickerTextColor }}
                        >
                            {durationOptions.map(option => (
                                <Picker.Item key={option} label={option} value={option} />
                            ))}
                        </Picker>
                    )}
                </View>
            </View>
            
            <Text style={styles.sectionLabel}>Compensation</Text>
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
                <View style={[styles.pickerContainer, { backgroundColor: pickerBackgroundColor }]}>
                    {Platform.OS === 'web' ? (
                        <select
                            value={listing.wage.type}
                            onChange={(e) => setListing({
                                ...listing,
                                wage: { ...listing.wage, type: e.target.value }
                            })}
                            style={{
                                height: 50,
                                width: '100%',
                                padding: 10,
                                borderColor: '#893030',
                                borderWidth: 1,
                                backgroundColor: pickerBackgroundColor,
                                color: pickerTextColor
                            }}
                        >
                            {wageTypeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    ) : (
                        <Picker
                            selectedValue={listing.wage.type}
                            onValueChange={(itemValue: string) => setListing({
                                ...listing,
                                wage: { ...listing.wage, type: itemValue }
                            })}
                            style={{ height: 50, width: '100%', color: pickerTextColor }}
                        >
                            {wageTypeOptions.map(option => (
                                <Picker.Item key={option} label={option} value={option} />
                            ))}
                        </Picker>
                    )}
                </View>
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
        padding: 20,
        flex: 1
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        height: 50,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        color: '#000',
        ...(Platform.OS === 'android' ? { elevation: 1 } : {})
    },
    multiline: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 10
    },
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    durationInput: {
        flex: 1,
        marginRight: 10
    },
    wageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        flexWrap: 'wrap'
    },
    wageInput: {
        flex: 1,
        marginRight: 10
    },
    isPaidButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        paddingHorizontal: 15,
        height: 50
    },
    isPaidButtonText: {
        color: '#ffffff',
        fontWeight: 'bold'
    },
    button: {
        backgroundColor: '#893030',
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 5
    },
    pickerContainer: {
        flex: 1.5,
        borderRadius: 5,
        height: 50,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        ...(Platform.OS === 'android' ? { elevation: 1 } : {})
    }
});

export default ListingCreate;

