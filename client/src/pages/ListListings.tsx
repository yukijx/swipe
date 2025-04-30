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
import { useAuthContext } from '../context/AuthContext';

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
    expanded?: boolean;
    applying?: boolean;
}

type Props = StackScreenProps<StackParamList, 'ListListings'>;

const ListListings: React.FC<Props> = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
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
            fetchListingsWithFallback();
        }
    }, [route.params]);

    // New function that will try the regular endpoint first, then fall back to the test endpoint
    const fetchListingsWithFallback = async () => {
        try {
            // Try the regular endpoint first
            await fetchListings();
        } catch (error) {
            console.warn('Standard endpoint failed, trying fallback approach...');
            
            // If that fails, try the test endpoint that we know works
            try {
                await fetchListingsViaTestEndpoint();
            } catch (testError) {
                console.error('Both standard and test approaches failed:', testError);
                Alert.alert('Error', 'Failed to load listings. Please try again later.');
                setLoading(false);
            }
        }
    };
    
    // Function to fetch listings via the test endpoint that we know works
    const fetchListingsViaTestEndpoint = async () => {
        try {
            setLoading(true);
            
            // Get token directly
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }
            
            console.log('Fetching via test endpoint as fallback');
            const response = await axios.get(
                `${getBackendURL()}/test/faculty-listings?token=${token}`
            );
            
            console.log('Test endpoint response:', response.status, response.statusText);
            
            if (response.data && Array.isArray(response.data)) {
                setListings(response.data);
                console.log("Retrieved listings via test endpoint:", response.data.length);
                
                // Debug log if successful
                console.log("Fallback approach successful - using test endpoint results");
            } else {
                console.error("Invalid response format from test endpoint:", response.data);
                throw new Error('Invalid data format from test endpoint');
            }
            
            setIsFiltered(false);
        } catch (error: any) {
            console.error('Error in test endpoint fallback:', error);
            throw error; // Rethrow to handle in the parent function
        } finally {
            setLoading(false);
        }
    };

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
            
            // Enhanced token debugging
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    // Use a more reliable Base64 decoding method
                    const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        [...atob(base64)]
                            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );
                    
                    const payload = JSON.parse(jsonPayload);
                    console.log('Token payload:', payload);
                    console.log('Token isFaculty value:', payload.isFaculty);
                    console.log('Token user ID:', payload.id);
                    
                    // Save userId to AsyncStorage for use in other components
                    await AsyncStorage.setItem('userId', payload.id);
                }
            } catch (e) {
                console.error('Error parsing token:', e);
            }
            
            // Different endpoints for faculty vs students - use the test endpoint for faculty that we know works
            let endpoint;
            if (isFaculty) {
                // Use the test endpoint that we know works for faculty
                endpoint = `${getBackendURL()}/test/faculty-listings?token=${token}`;
                console.log(`Using test endpoint that works: ${endpoint}`);
                
                // Simple GET request with the token as a query parameter
                const response = await axios.get(endpoint);
                console.log("API Response:", response.status, response.statusText);
                
                if (response.data && Array.isArray(response.data)) {
                    setListings(response.data);
                    console.log("Retrieved listings:", response.data.length);
                } else {
                    console.error("Invalid response format:", response.data);
                    Alert.alert('Error', 'Invalid data format received from server');
                }
            } else {
                // For students, use the regular endpoint with Bearer token
                endpoint = `${getBackendURL()}/listings`;
                console.log(`Fetching listings from: ${endpoint}, as student`);
                
                const response = await axios.get(endpoint, {
                    headers: { 
                        Authorization: `Bearer ${token}`
                    }
                });
                
                console.log("API Response:", response.status, response.statusText);
                
                if (response.data && Array.isArray(response.data)) {
                    setListings(response.data);
                    console.log("Retrieved listings:", response.data.length);
                } else {
                    console.error("Invalid response format:", response.data);
                    Alert.alert('Error', 'Invalid data format received from server');
                }
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
            
            Alert.alert('Error', 'Failed to load listings. Please try again later.');
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

    const toggleExpanded = (listingId: string) => {
        setListings(prevListings => 
            prevListings.map(listing => 
                listing._id === listingId 
                    ? { ...listing, expanded: !listing.expanded } 
                    : listing
            )
        );
    };

    const handleViewListing = (listing: Listing) => {
        toggleExpanded(listing._id);
    };

    const viewDetails = (listingId: string) => {
        const listing = listings.find(l => l._id === listingId);
        if (listing) {
            toggleExpanded(listingId);
        }
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
    };

    const handleApply = async (listingId: string) => {
        try {
            // Update applying state for this listing
            setListings(prevListings => 
                prevListings.map(listing => 
                    listing._id === listingId 
                        ? { ...listing, applying: true } 
                        : listing
                )
            );
            
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }
            
            // Record the user's interest by making a swipe right via the API
            const response = await axios.post(
                `${getBackendURL()}/swipe`,
                { 
                    listingId: listingId, 
                    interested: true 
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            console.log('Swipe response:', response.data);
            
            // Reset applying state
            setListings(prevListings => 
                prevListings.map(listing => 
                    listing._id === listingId 
                        ? { ...listing, applying: false } 
                        : listing
                )
            );
            
            if (response.data.isMatch) {
                Alert.alert(
                    'Match!', 
                    'You matched with this listing! You can view it in your matches page.',
                    [
                        { text: 'View Matches', onPress: () => navigation.navigate('Matches') },
                        { text: 'Stay Here', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Success', 'Your interest has been recorded');
            }
            
        } catch (error: any) {
            // Reset applying state
            setListings(prevListings => 
                prevListings.map(listing => 
                    listing._id === listingId 
                        ? { ...listing, applying: false } 
                        : listing
                )
            );
            
            console.error('Error applying for listing:', error);
            
            // Check for specific error types
            if (error.response?.status === 400 && error.response?.data?.error?.includes('already swiped')) {
                Alert.alert('Already Applied', 'You have already expressed interest in this listing');
            } else {
                Alert.alert('Error', 'Failed to submit application. Please try again.');
            }
        }
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
                
                <Text style={styles.listingDescription} numberOfLines={listing.expanded ? undefined : 2}>
                    {listing.description}
                </Text>
                
                {/* Expanded content */}
                {listing.expanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.expandedText}>{listing.description}</Text>
                        
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        <Text style={styles.expandedText}>{listing.requirements}</Text>
                        
                        {!isFaculty && listing.facultyId && (
                            <>
                                <Text style={styles.sectionTitle}>Faculty Information</Text>
                                <Text style={styles.expandedText}>
                                    <Text style={{fontWeight: 'bold'}}>Name:</Text> {listing.facultyId.name || 'Not specified'}{'\n'}
                                    <Text style={{fontWeight: 'bold'}}>Department:</Text> {listing.facultyId.department || 'Not specified'}{'\n'}
                                    <Text style={{fontWeight: 'bold'}}>University:</Text> {listing.facultyId.university || 'Not specified'}
                                </Text>
                            </>
                        )}
                        
                        <Text style={styles.sectionTitle}>Duration</Text>
                        <Text style={styles.expandedText}>{formatDuration(listing.duration)}</Text>
                        
                        <Text style={styles.sectionTitle}>Compensation</Text>
                        <Text style={styles.expandedText}>{formatWage(listing.wage)}</Text>
                        
                        <Text style={styles.sectionTitle}>Posted</Text>
                        <Text style={styles.expandedText}>{formatDate(listing.createdAt)}</Text>
                        
                        {/* Express Interest button for students */}
                        {!isFaculty && (
                            <TouchableOpacity 
                                style={styles.applyButton}
                                onPress={() => handleApply(listing._id)}
                                disabled={listing.applying}
                            >
                                {listing.applying ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.applyButtonText}>Express Interest</Text>
                                )}
                            </TouchableOpacity>
                        )}
                        
                        <View style={styles.divider} />
                        
                        <Text style={styles.collapseText}>
                            Tap to collapse
                        </Text>
                    </View>
                )}
                
                {!listing.expanded && (
                    <Text style={styles.expandPrompt}>
                        Tap to see more details
                    </Text>
                )}
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
                        <View style={{alignItems: 'center'}}>
                            <TouchableOpacity 
                                style={styles.createButton}
                                onPress={() => navigation.navigate('CreateListing', {})}
                            >
                                <Text style={styles.createButtonText}>Create New Listing</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.createButton, {marginTop: 10, backgroundColor: '#555'}]}
                                onPress={async () => {
                                    try {
                                        // Get user ID from token or AsyncStorage
                                        const userId = await AsyncStorage.getItem('userId');
                                        if (!userId) {
                                            console.error('No user ID found');
                                            return;
                                        }
                                        
                                        console.log('Checking debug endpoint for user ID:', userId);
                                        const response = await axios.get(
                                            `${getBackendURL()}/debug/faculty-listings/${userId}`
                                        );
                                        
                                        console.log('Debug endpoint response:', response.data);
                                        if (response.data && Array.isArray(response.data)) {
                                            if (response.data.length > 0) {
                                                Alert.alert('Debug Info', `Found ${response.data.length} listings in database for your ID`);
                                                // Use these listings directly
                                                setListings(response.data);
                                            } else {
                                                Alert.alert('Debug Info', 'No listings found for your ID in database');
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Error in debug check:', error);
                                        Alert.alert('Debug Error', 'Failed to check listings in database');
                                    }
                                }}
                            >
                                <Text style={styles.createButtonText}>Debug: Check My Listings</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.createButton, {marginTop: 10, backgroundColor: '#2c6694'}]}
                                onPress={async () => {
                                    try {
                                        // Get token directly
                                        const token = await AsyncStorage.getItem('token');
                                        if (!token) {
                                            console.error('No token found');
                                            Alert.alert('Debug Error', 'No token found in storage');
                                            return;
                                        }
                                        
                                        console.log('Testing alternative endpoint with token');
                                        const response = await axios.get(
                                            `${getBackendURL()}/test/faculty-listings?token=${token}`
                                        );
                                        
                                        console.log('Test endpoint response:', response.data);
                                        if (response.data && Array.isArray(response.data)) {
                                            if (response.data.length > 0) {
                                                Alert.alert('Test Endpoint', `Found ${response.data.length} listings with test endpoint`);
                                                // Use these listings directly
                                                setListings(response.data);
                                            } else {
                                                Alert.alert('Test Endpoint', 'No listings found with test endpoint');
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Error in test endpoint:', error);
                                        Alert.alert('Test Error', 'Failed to retrieve listings from test endpoint');
                                    }
                                }}
                            >
                                <Text style={styles.createButtonText}>Test Alt Endpoint</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.createButton, {marginTop: 10, backgroundColor: '#28a745'}]}
                                onPress={async () => {
                                    try {
                                        // Get token directly
                                        const token = await AsyncStorage.getItem('token');
                                        if (!token) {
                                            console.error('No token found');
                                            Alert.alert('Token Error', 'No token found in storage');
                                            return;
                                        }
                                        
                                        // Validate the token
                                        console.log('Validating token...');
                                        const validateResponse = await axios.get(
                                            `${getBackendURL()}/debug/validate-token?token=${token}`
                                        );
                                        
                                        console.log('Token validation response:', validateResponse.data);
                                        
                                        if (validateResponse.data.valid) {
                                            Alert.alert('Token Valid', 'Your token is valid, isFaculty=' + validateResponse.data.decoded.isFaculty);
                                        } else {
                                            // Attempt to refresh the token
                                            Alert.alert(
                                                'Invalid Token', 
                                                'Your token is invalid. Would you like to refresh it?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { 
                                                        text: 'Refresh', 
                                                        onPress: async () => {
                                                            try {
                                                                // Get user data from the decoded payload or elsewhere
                                                                const decodedPayload = validateResponse.data.decodedPayload;
                                                                if (!decodedPayload || !decodedPayload.id || !decodedPayload.email) {
                                                                    Alert.alert('Error', 'Cannot refresh token: missing user data');
                                                                    return;
                                                                }
                                                                
                                                                // Call the refresh endpoint
                                                                const refreshResponse = await axios.post(
                                                                    `${getBackendURL()}/refresh-token`,
                                                                    {
                                                                        userId: decodedPayload.id,
                                                                        email: decodedPayload.email,
                                                                        isFaculty: decodedPayload.isFaculty
                                                                    }
                                                                );
                                                                
                                                                if (refreshResponse.data.token) {
                                                                    // Save the new token
                                                                    await AsyncStorage.setItem('token', refreshResponse.data.token);
                                                                    Alert.alert('Success', 'Token refreshed successfully. Please try viewing listings again.');
                                                                    
                                                                    // Reload listings
                                                                    fetchListingsWithFallback();
                                                                } else {
                                                                    Alert.alert('Error', 'Failed to refresh token');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error refreshing token:', error);
                                                                Alert.alert('Error', 'Failed to refresh token');
                                                            }
                                                        } 
                                                    }
                                                ]
                                            );
                                        }
                                    } catch (error) {
                                        console.error('Error validating token:', error);
                                        Alert.alert('Error', 'Failed to validate token');
                                    }
                                }}
                            >
                                <Text style={styles.createButtonText}>Validate/Fix Token</Text>
                            </TouchableOpacity>
                        </View>
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
            }
        }),
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
    },
    expandedContent: {
        padding: 15,
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        marginTop: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
    },
    expandedText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
        marginBottom: 10,
    },
    expandPrompt: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 5,
        textAlign: 'center',
    },
    collapseText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 13,
        marginTop: 10,
    },
    applyButton: {
        backgroundColor: '#4e9af1',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ListListings;