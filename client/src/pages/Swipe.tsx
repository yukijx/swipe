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

    useEffect(() => {
        if (isFaculty) {
            Alert.alert('Error', 'Only Students can view Research Opportunities');
            navigation.goBack();
            return;
        }
        
        console.log('Swipe component mounted, auth state:', { isFaculty });
        fetchListings();
    }, []);   

    const fetchListings = async () => {
        setLoading(true); 
        try {  
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.log('No token found');
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                setLoading(false);
                return;
            }
            
            console.log('Fetching listings from debug endpoint...');
            
            // Use the debug endpoint that we know works
            const debugResponse = await axios.get(`${getBackendURL()}/debug/all-listings`);
            
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
                // Fallback to a direct database endpoint
                console.log('Debug endpoint failed, trying /listings endpoint...');
                
                try {
                    const response = await axios.get(`${getBackendURL()}/listings`, {
                        headers: {
                            Authorization: `Bearer ${token}`, 
                        },
                        timeout: 10000, 
                    });
                    
                    console.log("API Response:", response.status, response.statusText);
                    
                    if (response.data && Array.isArray(response.data)) {
                        console.log("Retrieved listings:", response.data.length);
                        setListings(response.data);
                        
                        // Debug: Log the first listing if available
                        if (response.data.length > 0) {
                            console.log("Sample listing:", JSON.stringify(response.data[0], null, 2));
                        }
                    } else {
                        console.error("Invalid response format:", response.data);
                        Alert.alert('Error', 'Invalid data format received from server');
                        setListings([]);
                    }
                } catch (standardError: any) {
                    console.error("Standard endpoint also failed:", standardError);
                    Alert.alert('Error', 'Could not retrieve listings. Please try again later.');
                    setListings([]);
                }
            }
        } catch (error: any) {
            console.error("Error fetching listings:", error);
            Alert.alert('Error', 'Failed to fetch listings. Please try again.');
            setListings([]);
        } finally { 
            setLoading(false); 
        }
    };

    const handleSwipe = async (direction: 'left' | 'right', listingId: string) => {
        if (swipingInProgress) return;
        
        setSwipingInProgress(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }
            
            const interested = direction === 'right';
            const response = await axios.post(`${getBackendURL()}/swipe`, 
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
            
            // If it's a match, add to matches list and show a notification
            if (interested && response.data.isMatch) {
                setMatches(prev => [...prev, listingId]);
                Alert.alert(
                    'Match!', 
                    'You matched with this listing. Check your matches page!',
                    [
                        { text: 'View Matches', onPress: () => navigation.navigate('Matches') },
                        { text: 'Continue Browsing', style: 'cancel' }
                    ]
                );
            }
            
        } catch (error: any) {
            console.error('Error recording swipe:', error);
            
            // Show alert for specific errors
            if (error.response?.status === 400 && error.response?.data?.error?.includes('already swiped')) {
                Alert.alert('Already Swiped', 'You have already expressed interest in this listing');
            }
        } finally {
            setSwipingInProgress(false);
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
        return (
            <ScrollView style={styles.scrollView}>
                {listings.map((listing) => (
                    <View key={listing._id} style={[styles.listingCard, { backgroundColor: cardColor }]}>
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
                                >
                                    <Text style={styles.swipeButtonText}>Not Interested</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.swipeRightButton}
                                    onPress={() => handleSwipe('right', listing._id)}
                                >
                                    <Text style={styles.swipeButtonText}>Interested</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
                
                {listings.length === 0 && (
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
        if (listings.length === 0) {
            return (
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
            );
        }
        
        return (
            <View style={styles.swiperContainer}>
                <Swiper
                    cards={listings}
                    renderCard={(listing) => (
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
                        </View>
                    )}
                    onSwiped={(cardIndex) => {
                        setIndex(cardIndex + 1);
                    }}
                    onSwipedLeft={(cardIndex) => {
                        const listing = listings[cardIndex];
                        handleSwipe('left', listing._id);
                    }}
                    onSwipedRight={(cardIndex) => {
                        const listing = listings[cardIndex];
                        handleSwipe('right', listing._id);
                    }}
                    onSwipedAll={() => setIndex(listings.length)}
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
                />
            </View>
        );
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
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    card: {
        width: '100%',
        maxWidth: 350,
        height: 500,
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
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    facultyName: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    listingDetails: {
        marginBottom: 10,
    },
    listingDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#893030',
        marginTop: 10,
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
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
});

export default Swipe;
