import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { getBackendURL } from "../utils/network";

const ListingCreate = ({ navigation, route }: { navigation: any, route: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const isEditing = route.params?.isEditing || false;
    const existingListing = route.params?.listing;

    // Themed variables
    const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const inputBackground = theme === 'light' ? '#ffffff' : '#333';
    const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
    const placeholderTextColor = theme === 'light' ? '#666' : '#bbb';
    const borderColor = theme === 'light' ? '#ddd' : '#000';
    const buttonColor = '#893030';
    const buttonTextColor = '#ffffff';

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

            if (!listing.title || !listing.description || !listing.requirements) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

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
            
            const backendURL = await getBackendURL();
            console.log('Form data:', JSON.stringify(formData, null, 2));

            if (isEditing) {
                await axios.put(
                    `${backendURL}/listings/${existingListing._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigation.navigate('ListingManagement');
                Alert.alert('Success', 'Listing updated successfully');
            } else {
                console.log('Creating new listing');
                
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
                    
                    console.log('Server response:', response.status);
                    navigation.navigate('ListingManagement');
                    Alert.alert('Success', 'Listing created successfully');
                } catch (error: any) {
                    // If primary endpoint fails, try the test endpoint
                    console.log('Primary endpoint failed, trying test endpoint');
                    
                    try {
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
                        
                        console.log('Test endpoint response:', testResponse.status);
                        navigation.navigate('ListingManagement');
                        Alert.alert('Success', 'Listing created successfully');
                    } catch (finalError: any) {
                        console.error('Error creating listing:', finalError);
                        if (finalError.response) {
                            Alert.alert(
                                'Error', 
                                finalError.response.data?.error || 'Failed to create listing'
                            );
                        } else {
                            Alert.alert('Network Error', 'Please check your connection and try again.');
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Error saving listing:', error);
            Alert.alert('Error', 'Failed to save listing. Please try again.');
        }
    };

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={[styles.contentContainer, { backgroundColor }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: textColor }]}> 
                    {isEditing ? "Edit Listing" : "Create Listing"}
                </Text>

                <Text style={[styles.sectionLabel, { color: textColor }]}>Title</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
                    placeholder="Research Title"
                    placeholderTextColor={placeholderTextColor}
                    value={listing.title}
                    onChangeText={(text) => setListing({...listing, title: text})}
                />

                <Text style={[styles.sectionLabel, { color: textColor }]}>Description</Text>
                <TextInput
                    style={[styles.input, styles.multiline, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
                    placeholder="Description"
                    placeholderTextColor={placeholderTextColor}
                    multiline
                    numberOfLines={4}
                    value={listing.description}
                    onChangeText={(text) => setListing({...listing, description: text})}
                />

                <Text style={[styles.sectionLabel, { color: textColor }]}>Requirements</Text>
                <TextInput
                    style={[styles.input, styles.multiline, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
                    placeholder="Requirements"
                    placeholderTextColor={placeholderTextColor}
                    multiline
                    numberOfLines={4}
                    value={listing.requirements}
                    onChangeText={(text) => setListing({...listing, requirements: text})}
                />

                <Text style={[styles.sectionLabel, { color: textColor }]}>Duration</Text>
                <View style={styles.durationContainer}>
                    <TextInput
                        style={[styles.input, styles.durationInput, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
                        placeholder="Duration Value"
                        placeholderTextColor={placeholderTextColor}
                        keyboardType="numeric"
                        value={listing.duration.value.toString()}
                        onChangeText={(text) => setListing({
                            ...listing,
                            duration: { ...listing.duration, value: text }
                        })}
                    />
                    <View style={[styles.pickerContainer, { backgroundColor: inputBackground, borderColor, width: 120 }]}> 
                        <TextInput
                            style={{
                                height: 50,
                                paddingHorizontal: 10,
                                color: inputTextColor,
                                borderWidth: 0,
                                width: '100%',
                                textAlignVertical: 'center',
                                includeFontPadding: false,
                            }}
                            value={listing.duration.unit}
                            onFocus={() =>
                                Alert.alert('Select Duration Unit', '', [
                                    ...durationOptions.map(option => ({
                                        text: option,
                                        onPress: () =>
                                            setListing({
                                                ...listing,
                                                duration: { ...listing.duration, unit: option },
                                            }),
                                    })),
                                    { text: 'Cancel', style: 'cancel' },
                                ])
                            }
                        />
                    </View>
                </View>

                <Text style={[styles.sectionLabel, { color: textColor }]}>Compensation</Text>
                <View style={styles.wageContainer}>
                    <TextInput
                        style={[styles.input, styles.wageInput, { backgroundColor: inputBackground, color: inputTextColor, borderColor }]}
                        placeholder="Wage Amount"
                        placeholderTextColor={placeholderTextColor}
                        keyboardType="numeric"
                        value={listing.wage.amount.toString()}
                        onChangeText={(text) => setListing({
                            ...listing,
                            wage: { ...listing.wage, amount: text }
                        })}
                    />
                    <View style={[styles.pickerContainer, { backgroundColor: inputBackground, borderColor, width: 120 }]}> 
                        <TextInput
                            style={{
                                height: 50,
                                paddingHorizontal: 10,
                                color: inputTextColor,
                                borderWidth: 0,
                                width: '100%',
                                textAlignVertical: 'center',
                                includeFontPadding: false,
                            }}
                            value={listing.wage.type}
                            onFocus={() => Alert.alert('Select Wage Type', '', [
                                ...wageTypeOptions.map(option => ({
                                    text: option,
                                    onPress: () => setListing({
                                        ...listing,
                                        wage: { ...listing.wage, type: option }
                                    })
                                })),
                                { text: 'Cancel', style: 'cancel' }
                            ])}
                        />
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
                    style={[styles.button, { backgroundColor: buttonColor }]}
                    onPress={handleSubmit}
                >
                    <Text style={[styles.buttonText, { color: buttonTextColor }]}> 
                        {isEditing ? "Update Listing" : "Create Listing"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
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
        textAlign: 'center',
        margin: 15,
    },
    input: {
        height: 50,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 1
    },
    multiline: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 10
    },
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        width: 250,
    },
    durationInput: {
        flex: 1,
        marginRight: 10
    },
    wageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        flexWrap: 'wrap',
        width: 312,
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
        fontWeight: 'bold'
    },
    button: {
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    buttonText: {
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
        borderRadius: 5,
        height: 50,
        justifyContent: 'center',
        borderWidth: 1,
        overflow: 'hidden',
        marginRight: 10,
        width: 250,
    }
});

export default ListingCreate;
