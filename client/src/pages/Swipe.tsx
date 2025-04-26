import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import axios from "axios";
import useAuth from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView'; 
import { getBackendURL } from "../utils/network";

type Listing = {
    _id: string;
    facultyId: string;
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
    const swiperRef = useRef<Swiper<Listing>>(null);
    const { theme } = useTheme();
    const { isFaculty } = useAuth();

    useEffect(() => {
        if (isFaculty) {
            Alert.alert('Error', 'Only Students can view Listings Swipe Page');
            navigation.goBack();
            return;
        }
        
        // Log auth state at component mount
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
            
            // Log partial token for debugging (first 10 chars)
            const tokenPreview = token.substring(0, 10) + '...';
            console.log(`Token found (preview): ${tokenPreview}`);
            
            console.log('Fetching listings from:', `${getBackendURL()}/listings`);
            
            const response = await axios.get(`${getBackendURL()}/listings`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
                timeout: 10000, 
            });

            console.log("API Response:", response.status, response.statusText);
            
            if (response.data && Array.isArray(response.data)) {
                console.log("Retrieved listings:", response.data.length);
                
                // If we receive an empty array but it's a valid response, still update state
                setListings(response.data);
                
                // Debug: Log the first listing if available
                if (response.data.length > 0) {
                    console.log("Sample listing:", JSON.stringify(response.data[0], null, 2));
                } else {
                    console.log("No listings returned from the API (empty array)");
                    // Try to see if there are any listings in the database
                    console.log("Checking if there are any listings in the database...");
                }
            } else {
                console.error("Invalid response format:", response.data);
                Alert.alert('Error', 'Invalid data format received from server');
            }
        } catch (error: any) {
            console.error("Error fetching listings:", error);
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
            Alert.alert('Error', 'Failed to fetch listings. Please try again.');
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
            
            // If it's a match, add to matches list and maybe show a notification
            if (interested && response.data.isMatch) {
                setMatches(prev => [...prev, listingId]);
                Alert.alert('Match!', 'You matched with this listing. Check your matches page!');
            }
            
        } catch (error) {
            console.error('Error recording swipe:', error);
            // Don't show alert for every failed swipe to avoid spamming the user
        } finally {
            setSwipingInProgress(false);
        }
    };

    const handleViewMatches = () => {
        navigation.navigate('Matches');
    };

    if (loading) { 
        return (
            <ThemedView style={styles.container}>
                <View style={styles.contentContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </ThemedView>
        );
    }
    
    return (
        <ThemedView style={styles.container}>
            <View style={styles.contentContainer}>
                {listings.length === 0 || index >= listings.length ? (
                    <View style={styles.noListingsContainer}>
                        <Text style={styles.noListings}>No more listings available</Text>
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
                ) : (
                    <View style={styles.swiperContainer}>
                        <Swiper
                            ref={swiperRef}
                            cards={listings}
                            renderCard={(item) => (
                                <View key={item._id} style={styles.card}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                    <Text style={styles.details}>Requirements: {item.requirements}</Text>
                                    <Text style={styles.details}>
                                        Duration: {item.duration?.value} {item.duration?.unit}
                                    </Text>
                                    <Text style={styles.details}>
                                        {item.wage?.isPaid 
                                            ? `Compensation: $${item.wage?.amount} per ${item.wage?.type}`
                                            : 'Unpaid position'}
                                    </Text>
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
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.matchesButton} 
                                onPress={handleViewMatches}
                            >
                                <Text style={styles.matchesButtonText}>View Matches</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#893030",
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    swiperContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    card: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: "#fff7d5",
        padding: 24,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        borderColor: '#000',
        borderStyle: 'solid',
        borderWidth: 4,
        position: 'absolute',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 24,
        color: "#000",
    },
    description: {
        fontSize: 20,
        color: "#000",
        marginBottom: 16,
    },
    details: {
        fontSize: 16,
        color: "#000",
        marginBottom: 10,
    },
    noListingsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noListings: {
        textAlign: "center",
        fontSize: 20,
        color: "#fff",
        marginBottom: 20,
    },
    overlayLabelLeft: {
        backgroundColor: 'red',
        color: 'white',
        fontSize: 24,
        padding: 10,
        borderRadius: 10,
    },
    overlayLabelRight: {
        backgroundColor: 'green',
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
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    matchesButton: {
        backgroundColor: '#fff7d5',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: 200,
        alignItems: 'center',
    },
    matchesButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
    },
    refreshButton: {
        backgroundColor: '#fff7d5',
        padding: 15,
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
    },
    refreshButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
    },
});

export default Swipe;
