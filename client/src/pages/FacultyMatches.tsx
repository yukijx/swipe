import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';
import useAuth from '../hooks/useAuth';

type Student = {
    _id: string;
    name: string;
    email: string;
    university: string;
    major: string;
    skills: string;
};

type ListingTitle = {
    _id: string;
    title: string;
};

type Match = {
    student: Student;
    listings: ListingTitle[];
};

const FacultyMatches = ({ navigation }: { navigation: any }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { isFaculty } = useAuth();

    useEffect(() => {
        if (!isFaculty) {
            Alert.alert('Error', 'Only faculty can view this page');
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

            const response = await axios.get(`${getBackendURL()}/matches/faculty`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
            Alert.alert('Error', 'Failed to fetch student matches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const viewStudentProfile = (student: Student) => {
        // Navigate to StudentInfo with studentId
        navigation.navigate('StudentInfo', { studentId: student._id });
    };

    const renderMatchItem = ({ item }: { item: Match }) => (
        <TouchableOpacity
            style={styles.matchCard}
            onPress={() => viewStudentProfile(item.student)}
        >
            <Text style={styles.studentName}>{item.student.name}</Text>
            <View style={styles.studentDetails}>
                <Text style={styles.studentInfo}>University: {item.student.university}</Text>
                <Text style={styles.studentInfo}>Major: {item.student.major}</Text>
                <Text style={styles.studentInfo}>Skills: {item.student.skills}</Text>
            </View>
            <View style={styles.matchedListings}>
                <Text style={styles.listingsTitle}>Matched with your listings:</Text>
                {item.listings.map((listing, index) => (
                    <Text key={listing._id} style={styles.listingItem}>
                        • {listing.title}
                    </Text>
                ))}
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.contactButton}>
                    <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
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
            <Text style={styles.title}>Interested Students</Text>
            {matches.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No student matches yet</Text>
                    <Text style={styles.emptySubtext}>
                        Students will appear here when they swipe right on your listings
                    </Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateListing')}
                    >
                        <Text style={styles.createButtonText}>Create New Listing</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    renderItem={renderMatchItem}
                    keyExtractor={(item) => item.student._id}
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
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    studentDetails: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    studentInfo: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    matchedListings: {
        marginBottom: 12,
    },
    listingsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    listingItem: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        marginBottom: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    contactButton: {
        backgroundColor: '#893030',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
    createButton: {
        backgroundColor: '#fff7d5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#893030',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FacultyMatches; 