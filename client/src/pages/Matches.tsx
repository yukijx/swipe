import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';
import useAuth from '../hooks/useAuth';

type MatchedListing = {
    _id: string;
    title: string;
    description: string;
    facultyId: {
        _id: string;
        name: string;
        email: string;
        department: string;
    };
};

const Matches = ({ navigation }: { navigation: any }) => {
    const [matches, setMatches] = useState<MatchedListing[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { isFaculty } = useAuth();

    useEffect(() => {
        if (isFaculty) {
            Alert.alert('Error', 'Faculty should use the Faculty Matches page');
            navigation.goBack();
            return;
        }
        
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }

            const response = await axios.get(`${getBackendURL()}/matches/student`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
            Alert.alert('Error', 'Failed to fetch matches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const viewListingDetails = (listing: MatchedListing) => {
        navigation.navigate('Listing', { listingId: listing._id });
    };

    const renderMatchItem = ({ item }: { item: MatchedListing }) => (
        <TouchableOpacity
            style={styles.matchCard}
            onPress={() => viewListingDetails(item)}
        >
            <Text style={styles.matchTitle}>{item.title}</Text>
            <Text style={styles.matchDescription}>{item.description.substring(0, 100)}...</Text>
            <View style={styles.facultyInfo}>
                <Text style={styles.facultyName}>Faculty: {item.facultyId.name}</Text>
                <Text style={styles.facultyDepartment}>Department: {item.facultyId.department}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Text style={styles.title}>Your Matches</Text>
            {matches.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No matches yet!</Text>
                    <Text style={styles.emptySubtext}>
                        Swipe right on listings you're interested in to get matches
                    </Text>
                    <TouchableOpacity
                        style={styles.swipeButton}
                        onPress={() => navigation.navigate('Swipe')}
                    >
                        <Text style={styles.swipeButtonText}>Go to Swipe</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    renderItem={renderMatchItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#893030',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    matchCard: {
        backgroundColor: '#fff7d5',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    matchTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    matchDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
    },
    facultyInfo: {
        backgroundColor: 'rgba(137, 48, 48, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    facultyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    facultyDepartment: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    swipeButton: {
        backgroundColor: '#fff7d5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    swipeButtonText: {
        color: '#893030',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Matches; 