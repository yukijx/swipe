import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Platform, ScrollView } from "react-native";
import axios from "axios";
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useTheme } from '../context/ThemeContext';
import { getBackendURL } from "../utils/network";
import { ResponsiveScreen } from '../components/ResponsiveScreen';

type Listing = {
    _id: string;
    facultyId: any;
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
    active: boolean;
    createdAt: string;
};

const Swipe = ({ navigation }: { navigation: any }) => {
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);
    const [index, setIndex] = useState(0);
    const [swipingInProgress, setSwipingInProgress] = useState(false);
    const [matches, setMatches] = useState<string[]>([]);
    const [currentView, setCurrentView] = useState<'swipe' | 'list'>('swipe');
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const backgroundColor = theme === 'light' ? '#f9f9f9' : '#333';
    const cardColor = theme === 'light' ? '#fff7d5' : '#444';
    const [swipingListings, setSwipingListings] = useState<{[key: string]: boolean}>({});
    const [swipedListings, setSwipedListings] = useState<{[key: string]: 'left' | 'right'}>({});

    useEffect(() => {
        if (isFaculty) {
            console.error('Error: Only Students can view Research Opportunities');
            navigation.goBack();
            return;
        }
        
        console.log('Swipe component mounted, auth state:', { isFaculty });
        fetchListings();
        fetchSwipeHistory();
    }, []);   

    const fetchListings = async () => {
        setLoading(true); 
        try {  
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.log('No token found');
                console.error('Authentication Error: Please log in again');
                navigation.navigate('Login');
                setLoading(false);
                return;
            }
            
            console.log('Fetching listings...');
            
            try {
                // Use the listings endpoint with proper authentication
                const backendURL = await getBackendURL();
                const response = await axios.get(`${backendURL}/listings`, {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                    timeout: 10000, 
                });

                console.log("API Response:", response.status, response.statusText);
                
                if (response.data && Array.isArray(response.data)) {
                    console.log(`Retrieved ${response.data.length} listings`);
                    setListings(response.data);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.log("Standard endpoint failed, trying debug endpoint...");
            }
            
            // Fallback to debug endpoint with proper token
            try {
                const backendURL = await getBackendURL();
                const debugResponse = await axios.get(`${backendURL}/debug/all-listings`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (debugResponse.data && Array.isArray(debugResponse.data)) {
                    console.log(`Debug endpoint found ${debugResponse.data.length} listings`);
                    
                    // Filter to only show active listings
                    const activeListings = debugResponse.data.filter((listing: any) => listing.active !== false);
                    console.log(`Found ${activeListings.length} active listings`);
                    
                    if (activeListings.length > 0) {
                        // Since debug endpoint returns minimal information, enhance the listings
                        const enhancedListings = activeListings.map((listing: any) => ({
                            ...listing,
                            description: listing.description || "Detailed description will be available soon.",
                            requirements: listing.requirements || "Requirements will be available soon.",
                            duration: listing.duration || { value: 3, unit: "months" },
                            wage: listing.wage || { type: "hourly", amount: 15, isPaid: true }
                        }));
                        
                        setListings(enhancedListings);
                        console.log("Set listings from debug endpoint");
                    } else {
                        setListings([]);
                        console.log("No active listings found");
                    }
                } else {
                    console.error("Invalid response format from debug endpoint");
                    setListings([]);
                }
            } catch (debugError: any) {
                console.error("Debug endpoint failed:", debugError.message);
                setListings([]);
                Alert.alert(
                    "Error",
                    "Failed to fetch listings. Please try again later.",
                    [{ text: "OK" }]
                );
            }
        } catch (error: any) {
            console.error("Error fetching listings:", error.message);
            setListings([]);
            Alert.alert(
                "Error",
                "Failed to fetch listings. Please try again later.",
                [{ text: "OK" }]
            );
        } finally { 
            setLoading(false); 
        }
    };

    const fetchSwipeHistory = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.log('No token found for swipe history');
                return;
            }
            
            console.log('Fetching user swipe history...');
            
            // Properly await the async getBackendURL call
            const backendURL = await getBackendURL();
            const response = await axios.get(`${backendURL}/swipes/history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data && Array.isArray(response.data)) {
                console.log(`Retrieved ${response.data.length} previous swipes`);
                
                // Update the swipedListings state with the user's history
                const swipedHistory: {[key: string]: 'left' | 'right'} = {};
                
                response.data.forEach((swipe: any) => {
                    swipedHistory[swipe.listingId] = swipe.interested ? 'right' : 'left';
                });
                
                setSwipedListings(swipedHistory);
                
                // Also update matches if any of the swipes resulted in a match
                const matchIds = response.data
                    .filter((swipe: any) => swipe.isMatch)
                    .map((swipe: any) => swipe.listingId);
                    
                if (matchIds.length > 0) {
                    console.log(`Found ${matchIds.length} previous matches`);
                    setMatches(matchIds);
                }
            }
        } catch (error) {
            console.error('Error fetching swipe history:', error);
            // Non-critical error, so just log it
        }
    };

    const handleSwipe = async (direction: 'left' | 'right', listingId: string) => {
        // Validate inputs
        if (!listingId) {
            console.error('Invalid listing ID for swipe');
            return;
        }
        
        // Prevent multiple swipes on the same listing
        if (swipingListings[listingId] || swipedListings[listingId]) {
            console.log(`Listing ${listingId} already swiped or in progress`);
            return;
        }
        
        // Update swiping state for this listing
        setSwipingListings(prev => ({ ...prev, [listingId]: true }));
        
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('Authentication Error: Please log in again');
                Alert.alert(
                    "Authentication Error",
                    "Please log in again to continue",
                    [{ text: "OK", onPress: () => navigation.navigate('Login') }]
                );
                return;
            }
            
            const interested = direction === 'right';
            console.log(`Swiping ${interested ? 'right (interested)' : 'left (not interested)'} on listing ${listingId}`);
            
            // Immediately remove the listing from the UI
            setListings(prev => prev.filter(listing => listing._id !== listingId));
            
            // Properly await the async getBackendURL call
            const backendURL = await getBackendURL();
            const response = await axios.post(`${backendURL}/swipe`, 
                { 
                    listingId,
                    interested 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            console.log('Swipe response:', response.data);
            
            // Record this listing as swiped
            setSwipedListings(prev => ({ ...prev, [listingId]: direction }));
            
            // If it's a match, add to matches list and show a notification
            if (interested && response.data.isMatch) {
                setMatches(prev => [...prev, listingId]);
                console.log('Match found! Listing added to matches');
                
                // Consider showing a match alert or notification here
            } else if (interested) {
                // If interested but not a match yet
                console.log('Interest recorded');
            } else {
                // If not interested, show a subtle confirmation
                console.log('Not interested recorded');
            }
            
        } catch (error: any) {
            console.error('Error recording swipe:', error);
            
            // Show alert for specific errors
            if (error.response?.status === 400 && error.response?.data?.error?.includes('already swiped')) {
                console.log('Already swiped on this listing');
                // Record this listing as already swiped (we don't know the direction)
                setSwipedListings(prev => ({ ...prev, [listingId]: direction }));
            } else if (error.response?.status === 401) {
                // Token expired or invalid
                Alert.alert(
                    "Authentication Error",
                    "Your session has expired. Please log in again.",
                    [{ text: "OK", onPress: () => navigation.navigate('Login') }]
                );
            } else {
                Alert.alert(
                    "Error",
                    "Failed to record your choice. Please try again.",
                    [{ text: "OK" }]
                );
            }
        } finally {
            // Reset swiping state for this listing
            setSwipingListings(prev => {
                const newState = {...prev};
                delete newState[listingId];
                return newState;
            });
        }
    };

    const handleViewMatches = () => {
        navigation.navigate('Matches');
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
    
    const renderListView = () => {
        // Filter out listings that have already been swiped on
        const availableListings = listings.filter(listing => !swipedListings[listing._id]);
        
        return (
            <ScrollView style={styles.scrollView}>
                {availableListings.length > 0 ? (
                    availableListings.map((listing) => (
                        <View key={listing._id} style={[
                            styles.listingCard, 
                            { backgroundColor: cardColor }
                        ]}>
                            <View style={styles.listingContent}>
                                <Text style={[styles.listingTitle, { color: textColor }]}>{listing.title}</Text>
                                
                                {listing.facultyId && (
                                    <Text style={styles.facultyName}>
                                        {typeof listing.facultyId === 'object' && listing.facultyId?.name 
                                            ? `By: ${listing.facultyId.name}` 
                                            : 'By: Faculty Member'}
                                    </Text>
                                )}
                                
                                <View style={styles.listingDetails}>
                                    <Text style={styles.listingDetail}>
                                        Duration: {formatDuration(listing.duration)}
                                    </Text>
                                    <Text style={styles.listingDetail}>
                                        Compensation: {formatWage(listing.wage)}
                                    </Text>
                                    <Text style={styles.listingDetail}>
                                        Posted: {formatDate(listing.createdAt)}
                                    </Text>
                                </View>
                                
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.listingDescription}>{listing.description}</Text>
                                
                                <Text style={styles.sectionTitle}>Requirements</Text>
                                <Text style={styles.listingDescription}>{listing.requirements}</Text>
                                
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity 
                                        style={styles.swipeLeftButton}
                                        onPress={() => handleSwipe('left', listing._id)}
                                        disabled={swipingListings[listing._id]}
                                    >
                                        <Text style={styles.swipeButtonText}>
                                            {swipingListings[listing._id] ? 'Processing...' : 'Not Interested'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.swipeRightButton}
                                        onPress={() => handleSwipe('right', listing._id)}
                                        disabled={swipingListings[listing._id]}
                                    >
                                        <Text style={styles.swipeButtonText}>
                                            {swipingListings[listing._id] ? 'Processing...' : 'Interested'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.noListingsContainer}>
                        <Text style={[styles.noListings, { color: textColor }]}>
                            No research opportunities available
                        </Text>
                        <TouchableOpacity 
                            style={styles.refreshButton} 
                            onPress={fetchListings}
                        >
                            <Text style={styles.refreshButtonText}>Refresh Listings</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        );
    };
    
    const renderSwipeView = () => {
        // Filter out listings that have already been swiped
        const availableListings = listings.filter(listing => !swipedListings[listing._id]);
        
        // Check if there are any listings at all
        if (!availableListings || availableListings.length === 0) {
            return (
                <View style={styles.noListingsContainer}>
                    <Text style={[styles.noListings, { color: textColor }]}>
                        {listings.length === 0 ? 
                            "No research opportunities available" : 
                            "You've swiped through all available listings"}
                    </Text>
                    <TouchableOpacity 
                        style={styles.refreshButton} 
                        onPress={fetchListings}
                    >
                        <Text style={styles.refreshButtonText}>Refresh Listings</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        
        // Log the first card to help with debugging
        if (availableListings.length > 0) {
            console.log("First available card:", availableListings[0].title);
        }

        // Continue with Swiper implementation using availableListings
        try {
            return (
                <View style={styles.swiperContainer}>
                    <Swiper
                        cards={availableListings}
                        renderCard={(listing) => {
                            // Check if listing is valid
                            if (!listing || !listing._id || !listing.title) {
                                return (
                                    <View style={[styles.card, { backgroundColor: cardColor }]}>
                                        <Text style={[styles.title, { color: textColor }]}>
                                            Invalid listing
                                        </Text>
                                        <Text style={styles.description}>
                                            This listing appears to be invalid or incomplete. Please swipe left to continue.
                                        </Text>
                                    </View>
                                );
                            }
                            
                            return (
                                <View key={listing._id} style={[styles.card, { backgroundColor: cardColor }]}>
                                    <Text style={[styles.title, { color: textColor }]}>{listing.title}</Text>
                                    
                                    {listing.facultyId && (
                                        <Text style={styles.facultyName}>
                                            {typeof listing.facultyId === 'object' && listing.facultyId?.name 
                                                ? `By: ${listing.facultyId.name}` 
                                                : 'By: Faculty Member'}
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
                                    
                                    <Text style={styles.sectionTitle}>Description</Text>
                                    <Text style={styles.description}>{listing.description}</Text>
                                    
                                    <Text style={styles.sectionTitle}>Requirements</Text>
                                    <Text style={styles.description}>{listing.requirements}</Text>
                                    
                                    <View style={styles.swipeInstructions}>
                                        <Text style={styles.swipeInstructionText}>
                                            Swipe right if interested, left if not interested
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                        onSwiped={(cardIndex) => {
                            setIndex(cardIndex + 1);
                        }}
                        onSwipedLeft={(cardIndex) => {
                            try {
                                if (cardIndex < 0 || cardIndex >= availableListings.length) {
                                    console.error("Invalid card index:", cardIndex);
                                    return;
                                }
                                
                                const listing = availableListings[cardIndex];
                                if (!listing || !listing._id || !listing.title) {
                                    console.error("Error: Undefined or invalid listing at index", cardIndex);
                                    return;
                                }
                                console.log("Swiped LEFT (not interested) on:", listing.title);
                                handleSwipe('left', listing._id);
                            } catch (error) {
                                console.error("Error in onSwipedLeft:", error);
                            }
                        }}
                        onSwipedRight={(cardIndex) => {
                            try {
                                if (cardIndex < 0 || cardIndex >= availableListings.length) {
                                    console.error("Invalid card index:", cardIndex);
                                    return;
                                }
                                
                                const listing = availableListings[cardIndex];
                                if (!listing || !listing._id || !listing.title) {
                                    console.error("Error: Undefined or invalid listing at index", cardIndex);
                                    return;
                                }
                                console.log("Swiped RIGHT (interested) on:", listing.title);
                                handleSwipe('right', listing._id);
                            } catch (error) {
                                console.error("Error in onSwipedRight:", error);
                            }
                        }}
                        onSwipedAll={() => {
                            console.log("Swiped through all cards!");
                        }}
                    backgroundColor="transparent"
                    stackSize={3}
                    cardIndex={index}
                    infinite={false}
                    animateOverlayLabelsOpacity
                    overlayLabels={{
                        left: {
                                title: "Not Interested",
                            style: {
                                wrapper: styles.overlayWrapperLeft,
                                    label: styles.overlayLabelLeft
                            }
                        },
                        right: {
                            title: "Interested",
                            style: {
                                wrapper: styles.overlayWrapperRight,
                                    label: styles.overlayLabelRight
                                }
                            }
                        }}
                        cardVerticalMargin={Platform.OS === 'web' ? 20 : 10}
                        useViewOverflow={Platform.OS === 'web'}
                    />
                </View>
            );
        } catch (error) {
            console.error("Error rendering Swiper:", error);
            return (
                <View style={styles.noListingsContainer}>
                    <Text style={[styles.noListings, { color: textColor }]}>
                        Error loading research opportunities
                    </Text>
                    <TouchableOpacity 
                        style={styles.refreshButton} 
                        onPress={fetchListings}
                    >
                        <Text style={styles.refreshButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    if (loading) { 
        return (
            <ResponsiveScreen navigation={navigation}>
                <View style={styles.contentContainer}>
                    <ActivityIndicator size="large" color="#893030" />
                    <Text style={{ color: textColor, marginTop: 20 }}>Loading research opportunities...</Text>
                </View>
            </ResponsiveScreen>
        );
    }
    
    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                    Research Opportunities
                </Text>
                
                <View style={styles.viewToggle}>
                    <TouchableOpacity 
                        style={[
                            styles.toggleButton, 
                            currentView === 'swipe' && styles.activeToggle
                        ]} 
                        onPress={() => setCurrentView('swipe')}
                    >
                        <Text style={styles.toggleButtonText}>Swipe View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.toggleButton, 
                            currentView === 'list' && styles.activeToggle
                        ]} 
                        onPress={() => setCurrentView('list')}
                    >
                        <Text style={styles.toggleButtonText}>List View</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {currentView === 'swipe' ? renderSwipeView() : renderListView()}
            
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity 
                    style={styles.matchesButton} 
                    onPress={handleViewMatches}
                >
                    <Text style={styles.matchesButtonText}>View Matches</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={fetchListings}
                >
                    <Text style={styles.refreshButtonText}>Refresh Listings</Text>
                </TouchableOpacity>
            </View>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        padding: 15,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    viewToggle: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
    },
    activeToggle: {
        backgroundColor: '#893030',
    },
    toggleButtonText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    swiperContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
        paddingHorizontal: 10,
    },
    card: {
        width: '100%',
        maxWidth: 350,
        height: 450,
        padding: 20,
        borderRadius: 15,
        ...Platform.select({
            ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
            },
            android: {
        elevation: 8,
            },
            web: {
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
            }
        }),
    },
    listingCard: {
        marginBottom: 15,
        borderRadius: 10,
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
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 12,
        color: '#893030',
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    facultyName: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    listingDetails: {
        marginBottom: 10,
    },
    listingDetail: {
        fontSize: 15,
        color: '#444',
        marginBottom: 3,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
        marginTop: 12,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(137, 48, 48, 0.2)',
        paddingBottom: 4,
    },
    description: {
        fontSize: 16,
        color: '#222',
        marginBottom: 10,
        lineHeight: 22,
    },
    listingDescription: {
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    swipeLeftButton: {
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    swipeRightButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    swipeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noListingsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    noListings: {
        textAlign: "center",
        fontSize: 18,
        marginBottom: 20,
    },
    overlayLabelLeft: {
        backgroundColor: '#ff4444',
        color: 'white',
        fontSize: 24,
        padding: 10,
        borderRadius: 10,
    },
    overlayLabelRight: {
        backgroundColor: '#28a745',
            color: 'white',
            fontSize: 24,
            padding: 10,
        borderRadius: 10,
        },
    overlayWrapperLeft: {
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingRight: 20,
    },
    overlayWrapperRight: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingLeft: 20,
    },
    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        zIndex: 1000,
    },
    matchesButton: {
        backgroundColor: '#893030',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    matchesButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    refreshButton: {
        backgroundColor: '#555',
        padding: 12,
        borderRadius: 8,
        flex: 1, 
        marginLeft: 5,
        alignItems: 'center',
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardSwipedRight: {
        borderLeftWidth: 5,
        borderLeftColor: '#28a745',
    },
    cardSwipedLeft: {
        borderLeftWidth: 5,
        borderLeftColor: '#ff4444',
    },
    swipedStatusContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        alignItems: 'center'
    },
    swipedStatusText: {
        color: '#555',
        fontStyle: 'italic'
    },
    swipeInstructions: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        alignItems: 'center'
    },
    swipeInstructionText: {
        color: '#555',
        fontStyle: 'italic'
    }
});

export default Swipe;
