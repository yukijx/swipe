import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

interface Listing {
    _id: string;
    title: string;
    description: string;
    requirements: string;
    facultyId: {
        name: string;
        university: string;
    };
}

const Swipe = ({ navigation }: { navigation: any }) => {
    const [currentListing, setCurrentListing] = useState<Listing | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const { theme } = useTheme();
    
    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/listings', {
                headers: { Authorization: token }
            });
            setListings(response.data);
            if (response.data.length > 0) {
                setCurrentListing(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (!currentListing) return;

        if (direction === 'right') {
            try {
                // Get user CV from profile or storage
                const userCV = "Example CV text"; // Replace with actual CV
                
                const matchResponse = await axios.post('http://localhost:5001/match', {
                    student_cv: userCV,
                    job_description: currentListing.description + " " + currentListing.requirements
                });

                if (matchResponse.data.should_show) {
                    Alert.alert(
                        'Match!',
                        `Match score: ${matchResponse.data.match_score}%`
                    );
                }
            } catch (error) {
                console.error('Error matching:', error);
            }
        }

        // Move to next listing
        const currentIndex = listings.findIndex(l => l._id === currentListing._id);
        if (currentIndex < listings.length - 1) {
            setCurrentListing(listings[currentIndex + 1]);
        } else {
            setCurrentListing(null);
            Alert.alert('No more listings', 'Check back later for more opportunities!');
        }
    };

    return (
        <ResponsiveScreen navigation={navigation} scrollable={false}>
            {currentListing ? (
                <>
                    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#fff7d5' : '#222' }]}>
                        <View style={styles.card}>
                            <Text style={styles.title}>{currentListing.title}</Text>
                            <Text style={styles.faculty}>By: {currentListing.facultyId.name}</Text>
                            <Text style={styles.university}>{currentListing.facultyId.university}</Text>
                            <Text style={styles.description}>{currentListing.description}</Text>
                            <Text style={styles.requirements}>{currentListing.requirements}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button title="Pass" onPress={() => handleSwipe('left')} color="#ff0000" />
                            <Button title="Like" onPress={() => handleSwipe('right')} color="#00ff00" />
                        </View>
                    </View>
                </>
            ) : (
                <Text>No more listings available</Text>
            )}
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    faculty: {
        fontSize: 18,
        marginBottom: 5,
    },
    university: {
        fontSize: 16,
        marginBottom: 15,
        color: '#666',
    },
    description: {
        fontSize: 16,
        marginBottom: 15,
    },
    requirements: {
        fontSize: 16,
        fontStyle: 'italic',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
});

export default Swipe;
