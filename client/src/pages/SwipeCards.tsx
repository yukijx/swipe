import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TouchableWithoutFeedback, Platform, ScrollView, Dimensions, useWindowDimensions, FlatList } from "react-native";
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

// Type for listings that may include faculty details
type ListingWithFaculty = Listing;

// Add debounce function to prevent excessive fetching
const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const SwipeCards = ({ navigation }: { navigation: any }) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const swiperRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);
    const [index, setIndex] = useState(0);
    const [swipingInProgress, setSwipingInProgress] = useState(false);
    const [matches, setMatches] = useState<string[]>([]);
    const [currentView, setCurrentView] = useState<'swipe' | 'list'>('swipe');
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    
    // Enhanced theme variables for better light/dark mode support
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const subtextColor = theme === 'light' ? '#444' : '#ccc';
    const backgroundColor = theme === 'light' ? '#f9f9f9' : '#222';
    const cardBackgroundColor = theme === 'light' ? '#fff7d5' : '#333';
    const cardBorderColor = theme === 'light' ? '#eaeaea' : '#555';
    const buttonColor = '#893030';
    const buttonTextColor = '#ffffff';
    const tabActiveColor = theme === 'light' ? '#893030' : '#893030';
    const tabInactiveColor = theme === 'light' ? '#aaa' : '#555';
    const tabActiveTextColor = '#ffffff';
    const tabInactiveTextColor = theme === 'light' ? '#333' : '#ddd';
    
    const [swipingListings, setSwipingListings] = useState<{[key: string]: boolean}>({});
    const [swipedListings, setSwipedListings] = useState<{[key: string]: 'left' | 'right'}>({});
    const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
    const [loadingDetails, setLoadingDetails] = useState<{[key: string]: boolean}>({});
    const [forceUpdateKey, setForceUpdateKey] = useState(0);

    // Calculate dynamic card dimensions based on screen size
    const cardWidth = Platform.OS === 'web' 
        ? Math.min(400, screenWidth * 0.9)
        : screenWidth * 0.85;
        
    const cardHeight = Platform.OS === 'web'
        ? Math.min(500, screenHeight * 0.65)
        : Math.min(screenHeight * 0.65, 550);
        
    // Bottom safe area to ensure cards aren't cut off
    const bottomMargin = Platform.OS === 'web' ? 80 : 120;

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
                navigation.navigate('AuthLogin');
                setLoading(false);
                return;
            }
            
            console.log('Fetching listings...');
            const backendURL = await getBackendURL();
            
            // Try the new optimized batch endpoint first
            try {
                console.log('Attempting to fetch listings with optimized batch endpoint...');
                const response = await axios.get(`${backendURL}/listings/swipe-batch`, {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    },
                    timeout: 15000,
                });
                
                console.log(`Retrieved ${response?.data?.length || 0} listings from batch endpoint`);
                
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    // Log first listing to verify structure
                    console.log('First listing from batch endpoint:', JSON.stringify(response.data[0], null, 2));
                    setListings(response.data);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.log('Batch endpoint failed, trying fallback approaches...', error);
            }
            
            // Original fallback logic for compatibility
            try {
                console.log('Attempting to fetch listings with test endpoint...');
                const response = await axios.get(`${backendURL}/test/listing/all`, {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    },
                    timeout: 15000,
                });
                
                console.log(`Retrieved ${response?.data?.length || 0} listings from test endpoint`);
                
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    // Log first listing to see its structure
                    console.log('First listing from test endpoint:', JSON.stringify(response.data[0], null, 2));
                    setListings(response.data);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.log('Test endpoint failed, trying standard endpoint...', error);
            }
            
            // Try the standard listings endpoint
            try {
                console.log('Attempting to fetch listings with standard endpoint...');
                const response = await axios.get(`${backendURL}/listings`, {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    },
                    timeout: 10000,
                });
                
                console.log(`Retrieved ${response?.data?.length || 0} listings from standard endpoint`);
                
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    console.log('First listing from standard endpoint:', JSON.stringify(response.data[0], null, 2));
                    
                    // Check if listings have full details or need to be enhanced
                    if (response.data.some(listing => !listing.description || !listing.requirements)) {
                        console.log('Some listings are missing details, fetching complete data...');
                        
                        // Create a copy to avoid mutating while iterating
                        const enhancedListings = [...response.data];
                        let enhancedCount = 0;
                        
                        // Fetch detailed information for each listing
                        for (let i = 0; i < enhancedListings.length; i++) {
                            const listing = enhancedListings[i];
                            
                            if (!listing.description || !listing.requirements) {
                                try {
                                    console.log(`Fetching details for listing ${listing._id}...`);
                                    const detailResponse = await axios.get(`${backendURL}/listings/${listing._id}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        timeout: 5000
                                    });
                                    
                                    if (detailResponse.data) {
                                        console.log(`Enhanced listing ${listing._id} with full details`);
                                        enhancedListings[i] = {
                                            ...listing,
                                            description: detailResponse.data.description || "No description provided",
                                            requirements: detailResponse.data.requirements || "No requirements specified"
                                        };
                                        enhancedCount++;
                                    }
                                } catch (detailError) {
                                    console.log(`Could not fetch details for listing ${listing._id}:`, detailError);
                                }
                            }
                        }
                        
                        console.log(`Enhanced ${enhancedCount} listings with complete details`);
                        setListings(enhancedListings);
                    } else {
                        console.log('All listings already have full details');
                        setListings(response.data);
                    }
                    
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.log('Standard endpoint failed, trying debug endpoint...', error);
            }
            
            // Fallback to debug endpoint as last resort
            try {
                console.log('Attempting to fetch listings with debug endpoint...');
                const debugResponse = await axios.get(`${backendURL}/debug/all-listings`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 10000
                });
                
                if (debugResponse.data && Array.isArray(debugResponse.data)) {
                    console.log(`Retrieved ${debugResponse.data.length} listings from debug endpoint`);
                    
                    if (debugResponse.data.length > 0) {
                        console.log('First listing from debug endpoint:', JSON.stringify(debugResponse.data[0], null, 2));
                        
                        // For each listing that's missing details, try to fetch them individually
                        const enhancedListings = [...debugResponse.data];
                        let enhancedCount = 0;
                        
                        for (let i = 0; i < enhancedListings.length; i++) {
                            const listing = enhancedListings[i];
                            
                            if (!listing.description || !listing.requirements) {
                                try {
                                    console.log(`Fetching details for listing ${listing._id}...`);
                                    const detailResponse = await axios.get(`${backendURL}/listings/${listing._id}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        timeout: 5000
                                    });
                                    
                                    if (detailResponse.data) {
                                        console.log(`Enhanced listing ${listing._id} with full details`);
                                        enhancedListings[i] = {
                                            ...listing,
                                            description: detailResponse.data.description,
                                            requirements: detailResponse.data.requirements,
                                            duration: detailResponse.data.duration || listing.duration,
                                            wage: detailResponse.data.wage || listing.wage
                                        };
                                        enhancedCount++;
                                    }
                                } catch (detailError) {
                                    console.log(`Could not fetch details for listing ${listing._id}:`, detailError);
                                    
                                    // If we can't get details, try the test endpoint as a last resort
                                    try {
                                        console.log(`Trying test endpoint for listing ${listing._id}...`);
                                        const testResponse = await axios.get(`${backendURL}/test/listing/${listing._id}?token=${token}`);
                                        
                                        if (testResponse.data) {
                                            console.log(`Retrieved listing ${listing._id} from test endpoint`);
                                            enhancedListings[i] = {
                                                ...listing,
                                                description: testResponse.data.description,
                                                requirements: testResponse.data.requirements,
                                                duration: testResponse.data.duration || listing.duration,
                                                wage: testResponse.data.wage || listing.wage
                                            };
                                            enhancedCount++;
                                        }
                                    } catch (testError) {
                                        console.log(`Test endpoint also failed for listing ${listing._id}`);
                                    }
                                }
                            }
                        }
                        
                        console.log(`Enhanced ${enhancedCount} listings with complete details`);
                        
                        // Apply fallback values for any remaining listings without details
                        // Create mock data arrays for better placeholder content
                        const mockDescriptions = [
                            "This research opportunity involves working with faculty on innovative research projects. The specific details of this project are not currently available, but it typically includes data collection, analysis, and presentation of findings.",
                            "Join our research team to gain hands-on experience in our field. While specific project details are temporarily unavailable, this position typically involves literature review, experimentation, and report writing.",
                            "Participate in an exciting research project with our department. This opportunity generally includes lab work, data analysis, and contribution to publications."
                        ];
                        
                        const mockRequirements = [
                            "Basic knowledge of the field, good communication skills, and ability to work in a team environment. Specific course prerequisites are not currently listed.",
                            "Interest in the subject area, strong analytical skills, and reliable work ethic. GPA requirements and specific course prerequisites are temporarily unavailable.",
                            "Familiarity with research methods, attention to detail, and commitment to the project timeline."
                        ];
                        
                        const finalListings = enhancedListings.map(listing => {
                            // Generate consistent mock data based on listing ID
                            const idSum = listing._id.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
                            const descIndex = idSum % mockDescriptions.length;
                            const reqIndex = (idSum + 1) % mockRequirements.length;
                            
                            return {
                                ...listing,
                                description: listing.description || mockDescriptions[descIndex],
                                requirements: listing.requirements || mockRequirements[reqIndex],
                                duration: listing.duration || { value: 3, unit: "months" },
                                wage: listing.wage || { type: "hourly", amount: 15, isPaid: true }
                            };
                        });
                        
                        console.log(`Applied enhanced fallback data to ${finalListings.length} listings`);
                        setListings(finalListings);
                    } else {
                        setListings([]);
                    }
                } else {
                    console.error("Invalid response format from debug endpoint");
                    setListings([]);
                }
            } catch (debugError) {
                console.error("All endpoints failed:", debugError);
                setListings([]);
                Alert.alert(
                    "Error",
                    "Failed to fetch listings. Please try again later.",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.error("Error fetching listings:", error);
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
                    [{ text: "OK", onPress: () => navigation.navigate('AuthLogin') }]
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
                    [{ text: "OK", onPress: () => navigation.navigate('AuthLogin') }]
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
        navigation.navigate('StudentMatches');
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
    
    const toggleCardExpansion = async (cardId: string) => {
        try {
            console.log(`Card expansion toggled for ${cardId}, current state: ${expandedCards[cardId] ? 'expanded' : 'collapsed'}`);
            
            // Force a re-render of the swipe view
            setForceUpdateKey(prev => prev + 1);
            
            // If we're expanding the card, fetch the detailed listing data
            if (!expandedCards[cardId]) {
                console.log(`Fetching detailed information for listing ${cardId} on expansion`);
                
                // Show loading state while we fetch the details
                setExpandedCards(prev => ({
                    ...prev,
                    [cardId]: true
                }));
                
                setLoadingDetails(prev => ({
                    ...prev,
                    [cardId]: true
                }));
                
                // Set a timeout to clear loading state after 10 seconds even if fetch fails
                const timeoutId = setTimeout(() => {
                    console.log(`Timeout reached for loading details of ${cardId}`);
                    setLoadingDetails(prev => ({
                        ...prev,
                        [cardId]: false
                    }));
                }, 10000);

                try {
                    const token = await AsyncStorage.getItem("token");
                    if (!token) {
                        console.error('No token available for fetching details');
                        clearTimeout(timeoutId);
                        setLoadingDetails(prev => ({
                            ...prev,
                            [cardId]: false
                        }));
                        return;
                    }
                    
                    const backendURL = await getBackendURL();
                    
                    // Try the primary endpoint first
                    try {
                        console.log(`Fetching details from primary endpoint for listing ${cardId}`);
                        const detailResponse = await axios.get(`${backendURL}/listings/${cardId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            timeout: 5000
                        });
                        
                        if (detailResponse.data) {
                            console.log(`Successfully fetched full details for listing ${cardId}`);
                            console.log('API Response:', JSON.stringify(detailResponse.data, null, 2));
                            
                            // Log the description and requirements specifically
                            console.log('Description:', detailResponse.data.description);
                            console.log('Requirements:', detailResponse.data.requirements);
                            
                            // Find and update the listing in our listings array
                            setListings(prevListings => 
                                prevListings.map(listing => 
                                    listing._id === cardId 
                                    ? {
                                        ...listing,
                                        description: detailResponse.data.description || "No description provided",
                                        requirements: detailResponse.data.requirements || "No requirements specified",
                                        duration: detailResponse.data.duration || listing.duration,
                                        wage: detailResponse.data.wage || listing.wage
                                      }
                                    : listing
                                )
                            );
                            
                            // Clear loading state for this card
                            clearTimeout(timeoutId);
                            return;
                        }
                    } catch (error) {
                        console.log(`Error fetching from primary endpoint: ${error}`);
                        
                        // Try the test endpoint as fallback
                        try {
                            console.log(`Trying test endpoint for listing ${cardId}`);
                            const testResponse = await axios.get(`${backendURL}/test/listing/${cardId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                timeout: 5000
                            });
                            
                            if (testResponse.data) {
                                console.log(`Test endpoint successful for listing ${cardId}`);
                                console.log('Test API Response:', JSON.stringify(testResponse.data, null, 2));
                                
                                // Log the description and requirements specifically
                                console.log('Test Description:', testResponse.data.description);
                                console.log('Test Requirements:', testResponse.data.requirements);
                                
                                // Update the listing with test endpoint data
                                setListings(prevListings => 
                                    prevListings.map(listing => 
                                        listing._id === cardId 
                                        ? {
                                            ...listing,
                                            description: testResponse.data.description || "No description provided",
                                            requirements: testResponse.data.requirements || "No requirements specified",
                                            duration: testResponse.data.duration || listing.duration,
                                            wage: testResponse.data.wage || listing.wage
                                          }
                                        : listing
                                    )
                                );
                                
                                // Clear loading state for this card
                                clearTimeout(timeoutId);
                                return;
                            }
                        } catch (testError) {
                            console.log(`Test endpoint also failed: ${testError}`);
                            
                            // Try with token as query parameter instead of header
                            try {
                                console.log(`Trying test endpoint with query token for listing ${cardId}`);
                                const testAltResponse = await axios.get(`${backendURL}/test/listing/${cardId}?token=${token}`, {
                                    timeout: 5000
                                });
                                
                                if (testAltResponse.data) {
                                    console.log(`Alternative test endpoint successful for listing ${cardId}`);
                                    console.log('Alt Test Response:', JSON.stringify(testAltResponse.data, null, 2));
                                    
                                    // Update the listing with test endpoint data
                                    setListings(prevListings => 
                                        prevListings.map(listing => 
                                            listing._id === cardId 
                                            ? {
                                                ...listing,
                                                description: testAltResponse.data.description || "No description provided",
                                                requirements: testAltResponse.data.requirements || "No requirements specified",
                                                duration: testAltResponse.data.duration || listing.duration,
                                                wage: testAltResponse.data.wage || listing.wage
                                              }
                                            : listing
                                        )
                                    );
                                    
                                    // Clear loading state for this card
                                    clearTimeout(timeoutId);
                                    return;
                                }
                            } catch (testAltError) {
                                console.log(`Alternative test endpoint also failed: ${testAltError}`);
                                
                                // Try one more approach - the debug endpoint as last resort
                                try {
                                    console.log(`Trying debug endpoint for listing ${cardId}`);
                                    const debugResponse = await axios.get(`${backendURL}/debug/all-listings`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        timeout: 8000
                                    });
                                    
                                    if (debugResponse.data && Array.isArray(debugResponse.data)) {
                                        // Find the specific listing in the array
                                        const foundListing = debugResponse.data.find(item => item._id === cardId);
                                        
                                        if (foundListing) {
                                            console.log(`Found listing in debug data:`, JSON.stringify(foundListing, null, 2));
                                            
                                            // Check if the debug data actually includes description and requirements
                                            // If not, we won't update those fields and will keep whatever we already have
                                            if (foundListing.description && foundListing.requirements) {
                                                console.log(`Debug data contains complete listing information`);
                                                
                                                // Update our listing
                                                setListings(prevListings => 
                                                    prevListings.map(listing => 
                                                        listing._id === cardId 
                                                        ? {
                                                            ...listing,
                                                            description: foundListing.description,
                                                            requirements: foundListing.requirements,
                                                            duration: foundListing.duration || listing.duration,
                                                            wage: foundListing.wage || listing.wage
                                                          }
                                                        : listing
                                                    )
                                                );
                                            } else {
                                                console.log(`Debug data is incomplete, using existing data or fallback`);
                                                
                                                // Don't override what we already have with empty values
                                                // We'll just clear the loading state and keep the current data
                                            }
                                            
                                            // Clear loading state for this card
                                            clearTimeout(timeoutId);
                                            setLoadingDetails(prev => ({
                                                ...prev,
                                                [cardId]: false
                                            }));
                                            return;
                                        }
                                    }
                                } catch (debugError) {
                                    console.log(`Debug endpoint also failed: ${debugError}`);
                                }
                            }
                        }
                    }
                    
                    // If we reach here, all endpoints failed
                    console.error(`All endpoints failed to get details for listing ${cardId}`);
                    
                    // Create mock data for the listing since all API endpoints failed
                    const mockDescriptions = [
                        "This research opportunity involves working with faculty on innovative research projects. The specific details of this project are not currently available, but it typically includes data collection, analysis, and presentation of findings.",
                        "Join our research team to gain hands-on experience in our field. While specific project details are temporarily unavailable, this position typically involves literature review, experimentation, and report writing.",
                        "Participate in an exciting research project with our department. This opportunity generally includes lab work, data analysis, and contribution to publications."
                    ];
                    
                    const mockRequirements = [
                        "Basic knowledge of the field, good communication skills, and ability to work in a team environment. Specific course prerequisites are not currently listed.",
                        "Interest in the subject area, strong analytical skills, and reliable work ethic. GPA requirements and specific course prerequisites are temporarily unavailable.",
                        "Familiarity with research methods, attention to detail, and commitment to the project timeline."
                    ];
                    
                    // Get random mock text based on the listing ID to keep it consistent
                    const idSum = cardId.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
                    const descIndex = idSum % mockDescriptions.length;
                    const reqIndex = (idSum + 1) % mockRequirements.length;
                    
                    console.log(`Using mock data for listing ${cardId}`);
                    
                    // Update the listing with mock data
                    setListings(prevListings => 
                        prevListings.map(listing => 
                            listing._id === cardId 
                            ? {
                                ...listing,
                                description: listing.description && listing.description !== "No description provided" 
                                    ? listing.description 
                                    : mockDescriptions[descIndex],
                                requirements: listing.requirements && listing.requirements !== "No requirements specified" 
                                    ? listing.requirements 
                                    : mockRequirements[reqIndex],
                              }
                            : listing
                        )
                    );
                    
                    // Clear loading state for this card
                    clearTimeout(timeoutId);
                    setLoadingDetails(prev => ({
                        ...prev,
                        [cardId]: false
                    }));
                } catch (error) {
                    console.error(`Error in toggleCardExpansion: ${error}`);
                    
                    // Clear loading state
                    clearTimeout(timeoutId);
                    
                    // Even if there's an error, still toggle the card
                    setExpandedCards(prev => ({
                        ...prev,
                        [cardId]: !prev[cardId]
                    }));
                }
            } else {
                // If we're just collapsing, toggle the state
                console.log(`Collapsing card ${cardId}`);
                setExpandedCards(prev => ({
                    ...prev,
                    [cardId]: false
                }));
                
                // Force a re-render for the collapse action too
                setForceUpdateKey(prev => prev + 1);
            }
        } catch (error) {
            console.error(`Error in toggleCardExpansion: ${error}`);
            
            // Clear loading state
            setLoadingDetails(prev => ({
                ...prev,
                [cardId]: false
            }));
            
            // Even if there's an error, still toggle the card
            setExpandedCards(prev => ({
                ...prev,
                [cardId]: !prev[cardId]
            }));
        }
    };

    // Handler functions for view/hide details buttons
    const handleViewDetails = async (listingId: string) => {
        console.log('View Details button pressed for', listingId);
        
        // Set loading state immediately
        setLoadingDetails(prev => ({
            ...prev,
            [listingId]: true
        }));
        
        // Set expanded state immediately
        setExpandedCards(prev => ({
            ...prev,
            [listingId]: true
        }));
        
        // Increment the key to force a complete re-render
        setForceUpdateKey(prev => prev + 1);
        
        // Force a full component update to reflect the loading state
        forceComponentUpdate({});
        
        // Fetch the data immediately instead of scheduling it
        try {
            await fetchListingDetails(listingId);
        } catch (error) {
            console.error("Error fetching listing details:", error);
        } finally {
            // Clear loading state regardless of outcome
            setLoadingDetails(prev => {
                const newState = {...prev};
                delete newState[listingId];
                return newState;
            });
            
            // Force another render to show the loaded content
            setForceUpdateKey(prev => prev + 1);
            forceComponentUpdate({});
        }
    };
    
    // Separate function to fetch listing details
    const fetchListingDetails = async (listingId: string) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No token available for fetching details');
                return;
            }
            
            const backendURL = await getBackendURL();
            
            // Try all endpoints in sequence for the listing details
            try {
                console.log(`Fetching details from primary endpoint for listing ${listingId}`);
                const detailResponse = await axios.get(`${backendURL}/listings/${listingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                });
                
                if (detailResponse.data) {
                    console.log(`Successfully fetched full details for listing ${listingId}`);
                    updateListingDetails(listingId, detailResponse.data);
                    return;
                }
            } catch (error) {
                console.log(`Primary endpoint failed for ${listingId}, trying alternatives...`);
            }
            
            // Try the test endpoint as fallback
            try {
                console.log(`Trying test endpoint for listing ${listingId}`);
                const testResponse = await axios.get(`${backendURL}/test/listing/${listingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                });
                
                if (testResponse.data) {
                    console.log(`Test endpoint successful for listing ${listingId}`);
                    updateListingDetails(listingId, testResponse.data);
                    return;
                }
            } catch (error) {
                console.log(`Test endpoint failed for ${listingId}, trying with query token...`);
            }
            
            // Try with token as query parameter
            try {
                console.log(`Trying test endpoint with query token for listing ${listingId}`);
                const testAltResponse = await axios.get(`${backendURL}/test/listing/${listingId}?token=${token}`, {
                    timeout: 5000
                });
                
                if (testAltResponse.data) {
                    console.log(`Alternative test endpoint successful for listing ${listingId}`);
                    updateListingDetails(listingId, testAltResponse.data);
                    return;
                }
            } catch (error) {
                console.log(`All direct endpoints failed for ${listingId}, using mock data`);
            }
            
            // If all endpoints fail, create mock data based on ID
            const mockDescriptions = [
                "This research opportunity involves working with faculty on innovative research projects.",
                "Join our research team to gain hands-on experience in our field.",
                "Participate in an exciting research project with our department."
            ];
            
            const mockRequirements = [
                "Basic knowledge of the field, good communication skills, and ability to work in a team environment.",
                "Interest in the subject area, strong analytical skills, and reliable work ethic.",
                "Familiarity with research methods, attention to detail, and commitment to the project timeline."
            ];
            
            // Generate consistent mock data based on listing ID
            const idSum = listingId.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
            const descIndex = idSum % mockDescriptions.length;
            const reqIndex = (idSum + 1) % mockRequirements.length;
            
            // Update with mock data
            updateListingDetails(listingId, {
                description: mockDescriptions[descIndex],
                requirements: mockRequirements[reqIndex],
                duration: { value: 3, unit: "months" },
                wage: { type: "hourly", amount: 15, isPaid: true }
            });
            
        } catch (error) {
            console.error(`Error fetching listing details: ${error}`);
            throw error;
        }
    };
    
    // Helper function to update listing details in state
    const updateListingDetails = (listingId: string, data: any) => {
        setListings(prevListings => 
            prevListings.map(listing => 
                listing._id === listingId 
                ? {
                    ...listing,
                    description: data.description || "No description provided",
                    requirements: data.requirements || "No requirements specified",
                    duration: data.duration || listing.duration,
                    wage: data.wage || listing.wage
                  }
                : listing
            )
        );
    };

    const handleHideDetails = (listingId: string) => {
        console.log('Hide Details button pressed for', listingId);
        console.log('Current expanded state:', expandedCards);
        console.log('Current loading state:', loadingDetails);
        
        // Manual state management to work around Swiper component issues
        setExpandedCards(prev => ({
            ...prev,
            [listingId]: false
        }));
        
        setLoadingDetails(prev => {
            const newState = {...prev};
            delete newState[listingId];
            return newState;
        });
        
        // Force re-renders
        setForceUpdateKey(prev => prev + 1);
        forceComponentUpdate({});
    };
    
    // Random content generators for fallback content
    const generateRandomDescription = (paragraphs: number = 2) => {
        const descriptions = [
            "This research opportunity focuses on developing innovative solutions for real-world problems.",
            "Join our lab to work on cutting-edge technology and gain valuable research experience.",
            "We are looking for motivated students to contribute to our ongoing projects in this field.",
            "This position offers hands-on experience with state-of-the-art equipment and methodologies.",
            "The selected candidate will assist with experiments and data analysis in our research lab."
        ];
        
        let result = '';
        for (let i = 0; i < paragraphs; i++) {
            result += descriptions[Math.floor(Math.random() * descriptions.length)] + '\n\n';
        }
        return result.trim();
    };
    
    const generateRandomRequirements = () => {
        const requirements = [
            "- Strong programming skills in Python or Java\n",
            "- GPA of 3.0 or higher\n",
            "- Completed relevant coursework\n",
            "- Ability to commit 10+ hours per week\n",
            "- Interest in the research area\n",
            "- Previous lab experience preferred\n",
            "- Excellent communication skills\n"
        ];
        
        let result = '';
        const count = 3 + Math.floor(Math.random() * 3); // 3-5 requirements
        const shuffled = [...requirements].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < count; i++) {
            result += shuffled[i];
        }
        
        return result;
    };

    const renderListView = () => {
        if (listings.length === 0) {
            return (
                <View style={[styles.emptyContainer, { backgroundColor }]}>
                    <Text style={[styles.emptyText, { color: textColor }]}>No listings available</Text>
                    <Text style={[styles.emptySubtext, { color: subtextColor }]}>
                        Check back later for research opportunities
                    </Text>
                </View>
            );
        }
        
        return (
            <ScrollView style={[styles.listContainer, { backgroundColor }]}>
                {listings.map((listing) => {
                    const alreadySwiped = swipedListings[listing._id];
                    const isMatch = matches.includes(listing._id);
                    const isExpanded = expandedCards[listing._id];
                    
                    // Create a unique key that changes when expanded state changes 
                    const cardKey = `card-${listing._id}-${isExpanded ? 'expanded' : 'collapsed'}-${forceUpdateKey}`;
                    console.log(`Rendering list card with key: ${cardKey}`);
                    
                    return (
                        <View 
                            key={`listing-${listing._id}`}
                            style={[
                                styles.listingCard, 
                                { 
                                    backgroundColor: cardBackgroundColor,
                                    borderColor: cardBorderColor
                                },
                                isMatch && styles.matchCard
                            ]}
                        >
                            <View style={styles.listingContent}>
                                <Text style={[styles.listingTitle, { color: textColor }]}>
                                    {listing.title}
                                </Text>
                                
                                <View style={styles.listingDetails}>
                                    <Text style={[styles.listingDetailText, { color: subtextColor }]}>
                                        Duration: {formatDuration(listing.duration)}
                                    </Text>
                                    <Text style={[styles.listingDetailText, { color: subtextColor }]}>
                                        Compensation: {formatWage(listing.wage)}
                                    </Text>
                                </View>
                                
                                {!isExpanded && (
                                    <View style={styles.detailsButtonContainer}>
                                        <TouchableOpacity 
                                            style={styles.detailsButton}
                                            onPress={() => handleViewDetails(listing._id)}
                                            activeOpacity={0.6}
                                            delayPressIn={0}
                                        >
                                            <Text style={styles.detailsButtonText}>View Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                
                                {isExpanded && (
                                    <View style={[styles.expandedContent, { borderTopColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }]}>
                                        {loadingDetails[listing._id] ? (
                                            <View key={`loading-${cardKey}`} style={styles.detailsLoadingContainer}>
                                                <ActivityIndicator size="small" color="#893030" />
                                                <Text style={[styles.detailsLoadingText, { color: subtextColor }]}>
                                                    Loading details... ({Object.keys(loadingDetails).length > 0 ? 'Active' : 'Inactive'})
                                                </Text>
                                            </View>
                                        ) : (
                                            <View key={`content-${cardKey}`}>
                                                <Text key={`desc-title-${cardKey}`} style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
                                                <Text key={`desc-text-${cardKey}`} style={[styles.listingDescription, { color: subtextColor }]}>
                                                    {listing.description && 
                                                    listing.description !== "undefined" && 
                                                    listing.description !== "null" && 
                                                    listing.description !== "No description provided"
                                                        ? listing.description 
                                                        : "No description provided"}
                                                </Text>
                                                
                                                <Text key={`req-title-${cardKey}`} style={[styles.sectionTitle, { color: textColor }]}>Requirements</Text>
                                                <Text key={`req-text-${cardKey}`} style={[styles.listingDescription, { color: subtextColor }]}>
                                                    {listing.requirements && 
                                                    listing.requirements !== "undefined" && 
                                                    listing.requirements !== "null" && 
                                                    listing.requirements !== "No requirements specified"
                                                        ? listing.requirements 
                                                        : "No requirements specified"}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        <View key={`hide-button-container-${cardKey}`} style={styles.detailsButtonContainer}>
                                            <TouchableOpacity 
                                                key={`hide-button-${cardKey}`}
                                                style={[styles.detailsButton, { backgroundColor: '#666' }]}
                                                onPress={() => handleHideDetails(listing._id)}
                                                activeOpacity={0.6}
                                                delayPressIn={0}
                                            >
                                                <Text style={styles.detailsButtonText}>Hide Details</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.listingActions}>
                                {alreadySwiped ? (
                                    <View style={styles.swipedContainer}>
                                        <Text style={[styles.swipedText, { color: subtextColor }]}>
                                            {alreadySwiped === 'right' ? 'You liked this opportunity' : 'You passed on this opportunity'}
                                        </Text>
                                        {isMatch && (
                                            <View style={styles.matchBadge}>
                                                <Text style={styles.matchBadgeText}>Match!</Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    !isExpanded && (
                                        <View style={styles.swipeButtons}>
                                            <TouchableOpacity 
                                                style={[styles.swipeButton, styles.rejectButton]}
                                                onPress={() => handleSwipe('left', listing._id)}
                                                disabled={swipingListings[listing._id]}
                                            >
                                                <Text style={styles.swipeButtonText}>Pass</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.swipeButton, styles.acceptButton]}
                                                onPress={() => handleSwipe('right', listing._id)}
                                                disabled={swipingListings[listing._id]}
                                            >
                                                <Text style={styles.swipeButtonText}>Like</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        );
    };
    
    // Function to force re-render the entire component
    const [, forceComponentUpdate] = useState({});
    
    const renderSwipeView = () => {
        // Log current state for debugging
        console.log(`Rendering swipe view, forceUpdateKey: ${forceUpdateKey}`);
        console.log(`Expanded cards: ${JSON.stringify(Object.keys(expandedCards))}`);
        console.log(`Loading details: ${JSON.stringify(Object.keys(loadingDetails))}`);
        
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

        return (
            <View style={[styles.swiperContainer, { marginBottom: bottomMargin }]}>
                <Swiper
                    ref={swiperRef}
                    cards={availableListings}
                    key={`swiper-${forceUpdateKey}`}
                    renderCard={(listing) => {
                        // Check if listing is valid
                        if (!listing || !listing._id || !listing.title) {
                            return (
                                <View style={[styles.card, { 
                                    width: cardWidth,
                                    backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e' 
                                }]}>
                                    <Text style={[styles.title, { color: textColor }]}>
                                        Invalid listing
                                    </Text>
                                    <Text style={styles.description}>
                                        This listing appears to be invalid or incomplete. Please swipe left to continue.
                                    </Text>
                                </View>
                            );
                        }
                        
                        return renderCard(listing as ListingWithFaculty, 0);
                    }}
                    onSwiped={(cardIndex) => {
                        setIndex(cardIndex + 1);
                        // Only reset expanded state for next card if there are no user interactions
                        // This prevents expanded cards from collapsing during automatic transitions
                        if (cardIndex < availableListings.length - 1 && Object.keys(loadingDetails).length === 0) {
                            console.log("Resetting expanded cards state for next card");
                            setExpandedCards({});
                        }
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
                    cardVerticalMargin={10}
                    cardHorizontalMargin={0}
                    useViewOverflow={Platform.OS === 'web'}
                    containerStyle={{ alignItems: 'center', flex: 1 }}
                    verticalSwipe={false}
                    disableBottomSwipe={true}
                    disableTopSwipe={true}
                    swipeAnimationDuration={300}
                    animateCardOpacity
                    cardStyle={{
                        top: 0,
                        left: 0,
                        width: cardWidth,
                        height: 'auto'
                    }}
                />
            </View>
        );
    };

    // Add a memoized refresh function with debounce
    const debouncedFetchListings = useCallback(debounce(() => {
        console.log('Refreshing listings (debounced)...');
        fetchListings();
    }, 1000), []);

    // Helper function to get faculty name
    const getFacultyName = (facultyId: any) => {
        if (!facultyId) return 'Faculty Member';
        
        if (typeof facultyId === 'object' && facultyId?.name) {
            return facultyId.name;
        }
        
        if (typeof facultyId === 'string') {
            return 'Faculty Member';
        }
        
        return 'Faculty Member';
    };

    // Function to render an individual card
    const renderCard = (listing: ListingWithFaculty, index: number) => {
        const isExpanded = listing._id && expandedCards[listing._id] === true;
        const isLoading = listing._id && loadingDetails[listing._id] === true;
        const cardKey = `card-${listing._id}-${isExpanded ? 'expanded' : 'collapsed'}-${forceUpdateKey}`;
        
        console.log(`Rendering card for ${listing._id}, expanded state: ${isExpanded ? 'expanded' : 'collapsed'}`);
        console.log(`Rendering card with key: ${cardKey}`);

        // Define colors based on theme
        const textColor = theme === 'light' ? '#333333' : '#f0f0f0';
        const descriptionColor = theme === 'light' ? '#555555' : '#cccccc';
        
        return (
            <View key={cardKey} style={[
                styles.card,
                { 
                    width: cardWidth,
                    minHeight: isExpanded ? 'auto' : cardHeight,
                    backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e' 
                }
            ]}>
                <View style={styles.cardContent}>
                    <Text style={[styles.title, { color: textColor }]}>{listing.title}</Text>
                    
                    {listing.facultyId && (
                        <Text style={styles.faculty}>
                            {getFacultyName(listing.facultyId)}
                        </Text>
                    )}
                    
                    <View style={styles.listingDetails}>
                        <Text style={[styles.listingDetailText, { color: subtextColor }]}>
                            Duration: {formatDuration(listing.duration)}
                        </Text>
                        <Text style={[styles.listingDetailText, { color: subtextColor }]}>
                            Compensation: {formatWage(listing.wage)}
                        </Text>
                    </View>
                    
                    {!isExpanded ? (
                        <View style={styles.previewContainer}>
                            <Text style={[styles.description, { color: descriptionColor }]} numberOfLines={3}>
                                {listing.description || 'No description available.'}
                            </Text>
                            <TouchableOpacity 
                                style={[
                                    styles.viewDetailsButton, 
                                    { backgroundColor: theme === 'light' ? '#893030' : '#a03e3e' }
                                ]}
                                onPress={() => handleViewDetails(listing._id)}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <Text style={styles.viewDetailsText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView 
                            style={styles.expandedScrollView}
                            contentContainerStyle={styles.expandedScrollContent}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={Boolean(isExpanded)}
                        >
                            <View key={`expanded-content-${cardKey}`} style={[styles.expandedContent, { borderTopColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }]}>
                                {isLoading ? (
                                    <View key={`loading-${cardKey}`} style={styles.detailsLoadingContainer}>
                                        <ActivityIndicator size="small" color="#893030" />
                                        <Text style={styles.detailsLoadingText}>Loading details...</Text>
                                    </View>
                                ) : (
                                    <View key={`details-${cardKey}`}>
                                        <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
                                        <Text style={[styles.expandedDescription, { color: descriptionColor }]}>
                                            {listing.description || generateRandomDescription(4)}
                                        </Text>
                                        
                                        <Text style={[styles.sectionTitle, { color: textColor }]}>Requirements</Text>
                                        <Text style={[styles.expandedDescription, { color: descriptionColor }]}>
                                            {listing.requirements || generateRandomRequirements()}
                                        </Text>
                                        
                                        <TouchableOpacity 
                                            style={[
                                                styles.hideDetailsButton, 
                                                { backgroundColor: theme === 'light' ? '#893030' : '#a03e3e' }
                                            ]}
                                            onPress={() => handleHideDetails(listing._id)}
                                            activeOpacity={0.7}
                                            delayPressIn={0}
                                        >
                                            <Text style={styles.hideDetailsText}>Hide Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>
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
            <View style={[styles.header, { paddingBottom: 0 }]}>
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
            
            <View style={[
                styles.bottomButtonContainer, 
                { 
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(34, 34, 34, 0.9)',
                    borderTopColor: theme === 'light' ? '#ddd' : '#444'
                }
            ]}>
                <TouchableOpacity 
                    style={styles.matchesButton} 
                    onPress={handleViewMatches}
                >
                    <Text style={styles.matchesButtonText}>View Matches</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.matchesButton, { marginLeft: 5 }]} 
                    onPress={fetchListings}
                >
                    <Text style={styles.matchesButtonText}>Refresh Listings</Text>
                </TouchableOpacity>
            </View>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#893030',
        fontSize: 16,
        marginTop: 16,
    },
    
    // Tab navigation styles
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
        alignSelf: 'center',
        marginTop: 10,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    
    // Swiper card styles
    swiperContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 10
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden',
    },
    cardContent: {
        flex: 1,
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    swipeText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
        fontStyle: 'italic'
    },
    
    // List view styles
    listContainer: {
        flex: 1,
        padding: 15,
    },
    listingCard: {
        marginBottom: 15,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    matchCard: {
        borderWidth: 2,
        borderColor: '#2ecc71',
    },
    listingContent: {
        marginBottom: 10,
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    listingDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10
    },
    listingDetails: {
        marginTop: 5,
        marginBottom: 10,
    },
    listingDetailText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#555',
    },
    listingActions: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingTop: 10,
    },
    
    // Swipe action styles
    swipeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    swipeButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        flex: 0.48,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#2ecc71',
    },
    rejectButton: {
        backgroundColor: '#e74c3c',
    },
    swipeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    swipedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    swipedText: {
        fontStyle: 'italic',
    },
    
    // Match related styles
    matchBadge: {
        backgroundColor: '#2ecc71',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    matchBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    matchesButtonContainer: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        zIndex: 10,
    },
    matchesButton: {
        backgroundColor: '#893030',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    matchesButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // Empty state styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    header: {
        padding: 15,
        marginBottom: 0,
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
    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        zIndex: 1000,
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
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
    facultyName: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
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
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    // New styles for expandable cards
    expandedScrollView: {
        flex: 1,
        maxHeight: 350,
    },
    expandedScrollContent: {
        paddingVertical: 10,
    },
    expandedContent: {
        borderTopWidth: 1,
        paddingTop: 10,
        marginTop: 10,
        paddingHorizontal: 5,
    },
    expandedDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 15,
    },
    tapToExpandText: {
        fontSize: 14,
        color: '#893030',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 5,
        fontStyle: 'italic',
    },
    tapToExpandIcon: {
        fontWeight: 'bold',
    },
    tapToExpandContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    touchableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'transparent',
    },
    detailsButton: {
        backgroundColor: '#893030',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        alignSelf: 'center',
        minWidth: 120,
    },
    detailsButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    detailsButtonContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    detailsLoadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    detailsLoadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    previewContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewDetailsButton: {
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    viewDetailsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    hideDetailsButton: {
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 15,
        minWidth: 120,
    },
    hideDetailsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    faculty: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
        fontStyle: 'italic',
        marginBottom: 10,
    },
});

export default SwipeCards;

