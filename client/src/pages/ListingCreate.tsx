import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Platform, ScrollView, Modal } from 'react-native';
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
    const modalBackgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)';
    const dropdownItemBgColor = theme === 'light' ? '#ffffff' : '#333333';
    const dropdownItemTextColor = theme === 'light' ? '#333333' : '#ffffff';
    const dropdownBorderColor = theme === 'light' ? '#dddddd' : '#555555';
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

    // Dropdown state
    const [showDurationDropdown, setShowDurationDropdown] = useState(false);
    const [showWageTypeDropdown, setShowWageTypeDropdown] = useState(false);

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
                        // Try the test endpoint with token in both query and header
                        const testResponse = await axios.post(
                            `${backendURL}/test/faculty-listings/create?token=${encodeURIComponent(token)}`,
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

    // Render the dropdown UI for duration unit
    const renderDurationDropdown = () => {
        return (
            <Modal
                transparent={true}
                visible={showDurationDropdown}
                animationType="fade"
                onRequestClose={() => setShowDurationDropdown(false)}
            >
                <TouchableOpacity 
                    style={styles.dropdownOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowDurationDropdown(false)}
                >
                    <View style={[
                        styles.dropdownContent, 
                        { backgroundColor: modalBackgroundColor, borderColor: dropdownBorderColor }
                    ]}>
                        <Text style={[styles.dropdownTitle, { color: textColor }]}>
                            Select Duration Unit
                        </Text>
                        
                        {durationOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.dropdownItem,
                                    listing.duration.unit === option && styles.dropdownItemSelected,
                                    { backgroundColor: dropdownItemBgColor }
                                ]}
                                onPress={() => {
                                    setListing({
                                        ...listing,
                                        duration: { ...listing.duration, unit: option }
                                    });
                                    setShowDurationDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownItemText, 
                                    { color: dropdownItemTextColor },
                                    listing.duration.unit === option && styles.dropdownItemTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    // Render the dropdown UI for wage type
    const renderWageTypeDropdown = () => {
        return (
            <Modal
                transparent={true}
                visible={showWageTypeDropdown}
                animationType="fade"
                onRequestClose={() => setShowWageTypeDropdown(false)}
            >
                <TouchableOpacity 
                    style={styles.dropdownOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowWageTypeDropdown(false)}
                >
                    <View style={[
                        styles.dropdownContent, 
                        { backgroundColor: modalBackgroundColor, borderColor: dropdownBorderColor }
                    ]}>
                        <Text style={[styles.dropdownTitle, { color: textColor }]}>
                            Select Wage Type
                        </Text>
                        
                        {wageTypeOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.dropdownItem,
                                    listing.wage.type === option && styles.dropdownItemSelected,
                                    { backgroundColor: dropdownItemBgColor }
                                ]}
                                onPress={() => {
                                    setListing({
                                        ...listing,
                                        wage: { ...listing.wage, type: option }
                                    });
                                    setShowWageTypeDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownItemText, 
                                    { color: dropdownItemTextColor },
                                    listing.wage.type === option && styles.dropdownItemTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
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
                    <TouchableOpacity 
                        style={[
                            styles.dropdownButton, 
                            { backgroundColor: inputBackground, borderColor }
                        ]}
                        onPress={() => setShowDurationDropdown(true)}
                    >
                        <Text style={{ color: inputTextColor }}>
                            {listing.duration.unit}
                        </Text>
                        <Text style={{ marginLeft: 5, color: inputTextColor }}>▼</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity 
                        style={[
                            styles.dropdownButton, 
                            { backgroundColor: inputBackground, borderColor }
                        ]}
                        onPress={() => setShowWageTypeDropdown(true)}
                    >
                        <Text style={{ color: inputTextColor }}>
                            {listing.wage.type}
                        </Text>
                        <Text style={{ marginLeft: 5, color: inputTextColor }}>▼</Text>
                    </TouchableOpacity>
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
            
            {/* Render dropdowns */}
            {renderDurationDropdown()}
            {renderWageTypeDropdown()}
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
    dropdownButton: {
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderWidth: 1,
        flexDirection: 'row',
        width: 120,
        marginRight: 10
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdownContent: {
        width: 250,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    dropdownItemSelected: {
        backgroundColor: 'rgba(137, 48, 48, 0.1)'
    },
    dropdownItemText: {
        fontSize: 16
    },
    dropdownItemTextSelected: {
        fontWeight: 'bold',
        color: '#893030'
    }
});

export default ListingCreate;
