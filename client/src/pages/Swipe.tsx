import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
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
    duration: string;
    compensation: string;
    active: boolean;
    createdAt: string;
};

const Swipe = ({ navigation }: { navigation: any }) => {
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);
    const [index, setIndex] = useState(0);
    const swiperRef = useRef<Swiper<Listing>>(null);
    const { theme } = useTheme();
    const { isFaculty } = useAuth();


    const debugToken = async () => {
        const token = await AsyncStorage.getItem("authToken");
        console.log("STORED TOKEN:", token);
    };    


    useEffect(() => {
        
        // debugToken();

        // DON'T KNOW HOW TO TEST THIS 
        if (isFaculty) {
            Alert.alert('Error', 'Only Students can view Listings Swipe Page');
            return;
        }
        
        // Fetch listings with the token
        const fetchListings = async () => {
            setLoading(true); 
            try {  
                // retrieve stored token
                const token = await AsyncStorage.getItem("token");
                console.log("Retrieved Token~: ", token); 
 
                // checking if token is null :( 
                if (!token) {
                    console.log('No token found');
                    setLoading(false);
                    return;
                }
                
                // API request with token
                const response = await axios.get(`${getBackendURL()}/listings`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
                timeout: 10000, 
                });

                setListings(response.data);
                console.log("Response: ", response.data);

            } catch (error) {
                console.error("Error fetching listings:", error);

            } finally { 
                setLoading(false); 
            }
        };

        fetchListings(); 
        debugToken();

    }, []);   

    if (loading) { 
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </ThemedView>
        );
    }
    
    return (
        <ThemedView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : listings.length === 0 || index >= listings.length ? (
                <Text style={styles.noListings}>No listings available</Text>
            ) : (
                <Swiper
                    ref={swiperRef}
                    cards={listings}
                    renderCard={(item) => (
                        <View key={item._id} style={styles.card}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.details}>Duration: {item.duration}</Text>
                            <Text style={styles.details}>Compensation: {item.compensation}</Text>
                        </View>
                    )}
                    onSwiped={(cardIndex) => setIndex(cardIndex + 1)}
                    onSwipedAll={() => setIndex(listings.length)}
                    backgroundColor="transparent"
                    stackSize={3}
                    cardIndex={index}
                    infinite={false}
                    animateOverlayLabelsOpacity
                    overlayLabels={{
                        left: {
                            title: "Nope",
                            style: {
                                wrapper: styles.overlayWrapperLeft,
                                // text: styles.overlayTextLeft,
                            }
                        },
                        right: {
                            title: "Interested",
                            style: {
                                wrapper: styles.overlayWrapperRight,
                                // text: styles.overlayTextRight,
                            }
                        }
                    }}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#893030",
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
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
        marginBottom: 10,
    },
    details: {
        fontSize: 16,
        color: "#000",
        marginBottom: 10,
    },
    noListings: {
        textAlign: "center",
        fontSize: 20,
        color: "#fff",
    },
    overlayWrapperLeft: {
        label: {
            backgroundColor: 'red',
            color: 'white',
            fontSize: 24,
            padding: 10,
        },
        wrapper: {
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingRight: 20,
        }
    },
    overlayWrapperRight: {
        label: {
            backgroundColor: 'green',
            color: 'white',
            fontSize: 24,
            padding: 10,
        },
        wrapper: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingLeft: 20,
        }
    },
});

export default Swipe;
