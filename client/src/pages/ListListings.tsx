import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../components/NavBar';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

interface Listing {
    _id: string;
    title: string;
    description: string;
    requirements: string;
    duration: string;
    compensation: string;
    createdAt: string;
}

const ListListings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const [listings, setListings] = useState<Listing[]>([]);
    const textColor = theme === 'light' ? '#893030' : '#ffffff';

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/listings/faculty', {
                headers: { Authorization: token }
            });
            setListings(response.data);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to fetch listings');
        }
    };

    const handleDelete = async (listingId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`http://localhost:5000/listings/${listingId}`, {
                headers: { Authorization: token }
            });
            Alert.alert('Success', 'Listing deleted successfully');
            fetchListings(); // Refresh the list
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete listing');
        }
    };

    const handleEdit = (listing: Listing) => {
        navigation.navigate('CreateListing', { 
            isEditing: true,
            listing: listing
        });
    };

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: textColor }]}>My Listings</Text>
            
            <View style={styles.listContainer}>
                {listings.map((listing) => (
                    <View key={listing._id} style={styles.listingCard}>
                        <Text style={styles.listingTitle}>{listing.title}</Text>
                        <Text style={styles.listingDetail}>Duration: {listing.duration}</Text>
                        <Text style={styles.listingDetail}>Compensation: {listing.compensation}</Text>
                        <Text style={styles.listingDescription} numberOfLines={2}>
                            {listing.description}
                        </Text>
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, { backgroundColor: '#893030' }]}
                                onPress={() => handleEdit(listing)}
                            >
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, { backgroundColor: '#ff4444' }]}
                                onPress={() => {
                                    Alert.alert(
                                        'Confirm Delete',
                                        'Are you sure you want to delete this listing?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { 
                                                text: 'Delete', 
                                                onPress: () => handleDelete(listing._id),
                                                style: 'destructive'
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        minHeight: Platform.OS === 'web' ? '100%' : undefined,
    },
    container: {
        flex: 1,
        borderColor: "#2E1512",
        borderWidth: 10,
        borderRadius: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    listContainer: {
        padding: 10,
    },
    listingCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
        marginBottom: 5,
    },
    listingDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    listingDescription: {
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    button: {
        padding: 8,
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    }
});

export default ListListings;