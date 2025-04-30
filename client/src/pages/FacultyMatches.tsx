import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

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

type SwipeStatus = {
    _id: string;
    listingId: string;
    status: 'pending' | 'accepted' | 'rejected';
};

type Match = {
    student: Student;
    listings: ListingTitle[];
    swipes: SwipeStatus[];
};

const FacultyMatches: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted'>('all');
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#000' : '#fff';
    const backgroundColor = theme === 'light' ? '#fff' : '#333';

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

            console.log('Faculty matches data:', JSON.stringify(response.data));
            
            // Ensure proper data structure - defensive programming
            const cleanedMatches = response.data.map((match: any) => ({
                student: match.student || {},
                listings: match.listings || [],
                swipes: match.swipes || []
            }));
            
            setMatches(cleanedMatches);
        } catch (error) {
            console.error('Error fetching matches:', error);
            Alert.alert('Error', 'Failed to fetch student matches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const contactStudent = (student: Student) => {
        if (student && student.email) {
            Alert.alert(
                'Student Contact Information',
                `Email: ${student.email}`
            );
        } else {
            Alert.alert('Error', 'Student contact information not available');
        }
    };

    const respondToSwipe = async (swipeId: string, accept: boolean) => {
        if (!swipeId) {
            console.error('Invalid swipeId provided to respondToSwipe');
            return;
        }
        
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }

            console.log('Responding to swipe:', swipeId, accept);
            
            const response = await axios.post(
                `${getBackendURL()}/swipe/respond`, 
                { swipeId, accept },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Response:', response.data);

            // Update local state to reflect the change
            setMatches(prevMatches => 
                prevMatches.map(match => ({
                    ...match,
                    swipes: match.swipes ? match.swipes.map(swipe => 
                        swipe._id === swipeId 
                            ? { ...swipe, status: accept ? 'accepted' : 'rejected' } 
                            : swipe
                    ) : []
                }))
            );

            Alert.alert(
                'Success', 
                `Student interest ${accept ? 'accepted' : 'rejected'} successfully`
            );
        } catch (error) {
            console.error('Error responding to swipe:', error);
            Alert.alert('Error', 'Failed to process your response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const viewStudentProfile = (student: Student) => {
        // Navigate to StudentInfo with studentId
        navigation.navigate('StudentInfo', { studentId: student._id });
    };

    const filteredMatches = () => {
        if (!matches || matches.length === 0) return [];
        
        if (activeFilter === 'all') return matches;
        
        return matches.filter(match => 
            match.swipes && match.swipes.some(swipe => 
                activeFilter === 'pending' ? swipe.status === 'pending' : swipe.status === 'accepted'
            )
        );
    };

    const renderMatchItem = ({ item }: { item: Match }) => {
        // Ensure item has all required arrays to prevent errors
        const hasListings = item.listings && item.listings.length > 0;
        const hasSwipes = item.swipes && item.swipes.length > 0;

        return (
            <View style={[styles.matchCard, { backgroundColor }]}>
                <View style={styles.cardContent}>
                    <View style={styles.studentHeader}>
                        <Text style={[styles.studentName, { color: textColor }]}>
                            {item.student?.name || 'Unknown Student'}
                        </Text>
                        <TouchableOpacity 
                            style={styles.headerProfileButton}
                            onPress={() => item.student ? viewStudentProfile(item.student) : null}
                        >
                            <Text style={styles.headerProfileButtonText}>View Profile</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.matchedListings}>
                        {hasListings && hasSwipes ? (
                            <View style={styles.listingsContainer}>
                                {item.listings.map((listing, index) => {
                                    // Find the corresponding swipe for this listing
                                    const swipe = item.swipes.find(s => s.listingId === listing._id);
                                    const statusColor = 
                                        !swipe ? '#999' :
                                        swipe.status === 'pending' ? '#f39c12' : 
                                        swipe.status === 'accepted' ? '#2ecc71' : '#e74c3c';
                                    
                                    const statusIcon = 
                                        !swipe ? '?' :
                                        swipe.status === 'pending' ? '⌛' : 
                                        swipe.status === 'accepted' ? '✓' : '✗';
                                    
                                    return (
                                        <View key={listing._id} style={styles.listingRow}>
                                            <Text style={styles.listingItem} numberOfLines={1}>
                                                <Text style={{fontWeight: 'bold'}}>{statusIcon} </Text>
                                                {listing.title}
                                            </Text>
                                            {swipe && (
                                                <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                                    {swipe.status.toUpperCase()}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.noDataText}>No listing interest data available</Text>
                        )}
                    </View>
                    
                    <View style={styles.studentDetails}>
                        <Text style={styles.studentInfo}>University: {item.student?.university || 'Not specified'}</Text>
                        <Text style={styles.studentInfo}>Major: {item.student?.major || 'Not specified'}</Text>
                        <Text style={styles.studentInfo}>Skills: {item.student?.skills || 'Not specified'}</Text>
                    </View>
                </View>
                
                {hasSwipes && item.swipes.some(swipe => swipe.status === 'pending') && (
                    <View style={styles.actionButtons}>
                        {item.swipes
                            .filter(swipe => swipe.status === 'pending')
                            .map(swipe => {
                                // Find the listing title for this swipe
                                const listing = hasListings ? item.listings.find(l => l._id === swipe.listingId) : null;
                                return (
                                    <View key={swipe._id} style={styles.swipeAction}>
                                        <Text style={styles.pendingText}>
                                            Pending for: {listing?.title || 'Unknown listing'}
                                        </Text>
                                        <View style={styles.actionButtonRow}>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.acceptButton]}
                                                onPress={() => respondToSwipe(swipe._id, true)}
                                            >
                                                <Text style={styles.actionButtonText}>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.rejectButton]}
                                                onPress={() => respondToSwipe(swipe._id, false)}
                                            >
                                                <Text style={styles.actionButtonText}>Decline</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        }
                    </View>
                )}
                
                <View style={styles.contactRow}>
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => item.student ? contactStudent(item.student) : null}
                    >
                        <Text style={styles.contactButtonText}>Contact Student</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <ResponsiveScreen navigation={navigation}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#893030" />
                    <Text style={styles.loadingText}>Loading student matches...</Text>
                </View>
            </ResponsiveScreen>
        );
    }

    return (
        <ResponsiveScreen navigation={navigation} scrollable={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Interested Students</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={fetchMatches}>
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            activeFilter === 'all' && styles.activeFilterButton
                        ]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            activeFilter === 'all' && styles.activeFilterText
                        ]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            activeFilter === 'pending' && styles.activeFilterButton
                        ]}
                        onPress={() => setActiveFilter('pending')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            activeFilter === 'pending' && styles.activeFilterText
                        ]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            activeFilter === 'accepted' && styles.activeFilterButton
                        ]}
                        onPress={() => setActiveFilter('accepted')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            activeFilter === 'accepted' && styles.activeFilterText
                        ]}>Accepted</Text>
                    </TouchableOpacity>
                </View>
                
                {filteredMatches().length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No student matches found</Text>
                        <Text style={styles.emptySubtext}>
                            {activeFilter === 'all' 
                                ? 'Students will appear here when they swipe right on your listings' 
                                : activeFilter === 'pending'
                                    ? 'No pending student requests at the moment'
                                    : 'You haven\'t accepted any student requests yet'}
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
                        data={filteredMatches()}
                        renderItem={renderMatchItem}
                        keyExtractor={(item) => item.student._id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#893030',
    },
    refreshButton: {
        backgroundColor: '#893030',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: 'transparent',
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
    },
    activeFilterButton: {
        backgroundColor: '#893030',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#555',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    matchCard: {
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    cardContent: {
        flex: 1,
        paddingVertical: 4,
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerProfileButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#893030',
    },
    headerProfileButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    studentDetails: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: 6,
        borderRadius: 6,
        marginBottom: 4,
    },
    studentInfo: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    matchedListings: {
        marginTop: 0,
        marginBottom: 4,
    },
    listingsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    listingsContainer: {
        marginTop: 2,
    },
    listingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
        paddingRight: 2,
    },
    listingItem: {
        fontSize: 13,
        color: '#333',
        flex: 1,
        paddingRight: 4,
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        overflow: 'hidden',
    },
    swipeAction: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        padding: 8,
        borderRadius: 8,
        marginBottom: 6,
    },
    pendingText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        fontWeight: '500',
    },
    actionButtons: {
        marginBottom: 10,
    },
    actionButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginLeft: 8,
    },
    acceptButton: {
        backgroundColor: '#2ecc71',
    },
    rejectButton: {
        backgroundColor: '#e74c3c',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    contactRow: {
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
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#893030',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#893030',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    }
});

export default FacultyMatches; 