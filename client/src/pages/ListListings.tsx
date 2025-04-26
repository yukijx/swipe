import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../components/NavBar';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { StackScreenProps } from '@react-navigation/stack';
import { StackParamList } from '../navigation/types';
import { getBackendURL } from '../utils/network';
import useAuth from '../hooks/useAuth';

interface Listing {
    _id: string;
    title: string;
    description: string;
    requirements: string;
    duration: {
        value: number;
        unit: string;
    };
    wage: {
        type: string;
        amount: number;
        isPaid: boolean;
    };
    facultyId?: any;
    createdAt: string;
}

type Props = StackScreenProps<StackParamList, 'ListListings'>;

const ListListings: React.FC<Props> = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);
    const textColor = theme === 'light' ? '#893030' : '#ffffff';

    useEffect(() => {
        // If we have filtered listings from the Filter component
        if (route.params?.filteredListings) {
            setListings(route.params.filteredListings);
            setIsFiltered(true);
            setLoading(false);
        } else {
            // Otherwise fetch all listings
            fetchListings();
        }
    }, [route.params]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                console.error('No token found in AsyncStorage');
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }
            
            // Log partial token for debugging (first 10 chars)
            const tokenPreview = token.substring(0, 10) + '...';
            console.log(`Token found (preview): ${tokenPreview}`);
            console.log(`Auth state: isFaculty = ${isFaculty}`);
            
            // Different endpoints for faculty vs students
            const endpoint = isFaculty 
                ? `${getBackendURL()}/listings/faculty` 
                : `${getBackendURL()}/listings`;
            
            console.log(`Fetching listings from: ${endpoint}, as ${isFaculty ? 'faculty' : 'student'}`);
            console.log(`Backend URL: ${getBackendURL()}`);
                
            const response = await axios.get(endpoint, {
                headers: { 
                    Authorization: `Bearer ${token}`  // Make sure to include Bearer prefix
                }
            });
            
            console.log("API Response:", response.status, response.statusText);
            
            if (response.data && Array.isArray(response.data)) {
                setListings(response.data);
                console.log("Retrieved listings:", response.data.length);
                
                // Debug: Log the first listing if available
                if (response.data.length > 0) {
                    console.log("Sample listing:", JSON.stringify(response.data[0], null, 2));
                } else {
                    console.log("No listings returned from the API");
                }
            } else {
                console.error("Invalid response format:", response.data);
                Alert.alert('Error', 'Invalid data format received from server');
            }
            
            setIsFiltered(false);
        } catch (error: any) {
            console.error('Error fetching listings:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("Error request:", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", error.message);
            }
            Alert.alert('Error', error.response?.data?.error || 'Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (listingId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }
            
            console.log(`Deleting listing: ${listingId}`);
            
            await axios.delete(`${getBackendURL()}/listings/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Listing deleted successfully');
            fetchListings(); // Refresh the list
        } catch (error: any) {
            console.error('Error deleting listing:', error);
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
            }
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete listing');
        }
    };

    const handleEdit = (listing: Listing) => {
        navigation.navigate('CreateListing', { 
            isEditing: true,
            listing: listing
        });
    };

    const handleFilter = () => {
        navigation.navigate('Filter', {
            filters: route.params?.filters // Pass any existing filters
        });
    };

    const handleViewListing = (listing: Listing) => {
        navigation.navigate('Listing', { listingId: listing._id });
    };

    const formatDuration = (duration: any) => {
        if (!duration) return 'Not specified';
        if (typeof duration === 'string') return duration;
        
        return `${duration.value} ${duration.unit}`;
    };

    const formatWage = (wage: any) => {
        if (!wage) return 'Not specified';
        if (typeof wage === 'string') return wage;
        
        if (!wage.isPaid) return 'Unpaid position';
        return `$${wage.amount} per ${wage.type}`;
    };

    const renderListingItem = (listing: Listing) => (
        <View key={listing._id} style={styles.listingCard}>
            <TouchableOpacity 
                style={styles.listingContent}
                onPress={() => handleViewListing(listing)}
            >
                <Text style={styles.listingTitle}>{listing.title}</Text>
                
                {!isFaculty && listing.facultyId && (
                    <Text style={styles.facultyName}>
                        By: {listing.facultyId.name || 'Faculty Member'}
                    </Text>
                )}
                
                <View style={styles.listingDetails}>
                    <Text style={styles.listingDetail}>
                        Duration: {formatDuration(listing.duration)}
                    </Text>
                    <Text style={styles.listingDetail}>
                        Compensation: {formatWage(listing.wage)}
                    </Text>
                </View>
                
                <Text style={styles.listingDescription} numberOfLines={2}>
                    {listing.description}
                </Text>
            </TouchableOpacity>
            
            {isFaculty && (
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
            )}
        </View>
    );

    return (
        <ResponsiveScreen 
            navigation={navigation}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>
                    {isFaculty ? 'My Listings' : 'Research Opportunities'}
                </Text>
                
                <TouchableOpacity 
                    style={styles.filterButton} 
                    onPress={handleFilter}
                >
                    <Text style={styles.filterButtonText}>
                        {isFiltered ? 'Modify Filters' : 'Filter'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {isFiltered && (
                <TouchableOpacity 
                    style={styles.clearFilterButton}
                    onPress={fetchListings}
                >
                    <Text style={styles.clearFilterText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#893030" />
                </View>
            ) : listings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {isFiltered 
                            ? 'No listings match your filters' 
                            : isFaculty 
                                ? "You haven't created any listings yet" 
                                : 'No research opportunities available'
                        }
                    </Text>
                    {isFaculty && (
                        <TouchableOpacity 
                            style={styles.createButton}
                            onPress={() => navigation.navigate('CreateListing', {})}
                        >
                            <Text style={styles.createButtonText}>Create New Listing</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ScrollView style={styles.listContainer}>
                    {listings.map(renderListingItem)}
                </ScrollView>
            )}
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        minHeight: Platform.OS === 'web' ? '100%' : undefined,
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
    },
    filterButton: {
        backgroundColor: '#893030',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    clearFilterButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginBottom: 10,
        marginLeft: 10,
    },
    clearFilterText: {
        color: '#555',
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#893030',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        flex: 1,
    },
    listingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    listingContent: {
        padding: 15,
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
        marginBottom: 5,
    },
    facultyName: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    listingDetails: {
        marginBottom: 8,
    },
    listingDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    listingDescription: {
        fontSize: 14,
        color: '#444',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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