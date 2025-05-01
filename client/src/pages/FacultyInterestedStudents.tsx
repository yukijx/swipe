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
    description?: string;
    requirements?: string;
};

type FullListing = {
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
    facultyId: string;
    createdAt: string;
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

const FacultyInterestedStudents: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted'>('all');
    const [loading, setLoading] = useState(true);
    // Track which listings are expanded
    const [expandedListings, setExpandedListings] = useState<{[key: string]: boolean}>({});
    // Store detailed listings data
    const [listingDetails, setListingDetails] = useState<{[key: string]: FullListing}>({});
    // Track if a specific listing is being loaded
    const [loadingListings, setLoadingListings] = useState<{[key: string]: boolean}>({});
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    
    // Themed variables
    const inputBackground = theme === 'light' ? '#ffffff' : '#333';
    const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
    const placeholderTextColor = theme === 'light' ? '#666' : '#bbb';
    const borderColor = theme === 'light' ? '#ddd' : '#000';
    const buttonColor = '#893030';
    const buttonTextColor = '#ffffff';
    const backgroundColor = theme === 'light' ? '#fff' : '#333';
    const subtextColor = theme === 'light' ? '#333' : '#ddd';
    const mutedTextColor = theme === 'light' ? '#666' : '#bbb';
    const cardBackgroundColor = theme === 'light' ? '#fff' : '#444';
    const sectionBackgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';
    const textColor = theme === 'light' ? '#000' : '#fff';

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
                navigation.navigate('AuthLogin');
                return;
            }

            const backendURL = await getBackendURL();
            const response = await axios.get(`${backendURL}/matches/faculty`, {
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
            // Reset expanded listings state when refreshing
            setExpandedListings({});
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
                navigation.navigate('AuthLogin');
                return;
            }

            console.log('Responding to swipe:', swipeId, accept);
            
            const backendURL = await getBackendURL();
            const response = await axios.post(
                `${backendURL}/swipe/respond`, 
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

    const toggleListingExpanded = async (listingId: string) => {
        // Toggle expanded state
        setExpandedListings(prev => ({
            ...prev,
            [listingId]: !prev[listingId]
        }));
        
        // If we're expanding and don't have the full details yet, fetch them
        if (!expandedListings[listingId] && !listingDetails[listingId]) {
            try {
                setLoadingListings(prev => ({
                    ...prev,
                    [listingId]: true
                }));
                
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                
                const backendURL = await getBackendURL();
                
                // First try the standard endpoint
                try {
                    const response = await axios.get(
                        `${backendURL}/listings/${listingId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (response.data) {
                        setListingDetails(prev => ({
                            ...prev,
                            [listingId]: response.data
                        }));
                    }
                } catch (error) {
                    console.log('Standard endpoint failed, trying alternative approaches...');
                    
                    // Try completely different endpoint patterns
                    try {
                        // Try the faculty-listings endpoint that works in ListingManagement
                        const facultyResponse = await axios.get(
                            `${backendURL}/test/faculty-listings?token=${token}`
                        );
                        
                        if (facultyResponse.data && Array.isArray(facultyResponse.data)) {
                            // Find the specific listing in the array
                            const foundListing = facultyResponse.data.find(listing => listing._id === listingId);
                            if (foundListing) {
                                console.log('Found listing in faculty-listings array');
                                setListingDetails(prev => ({
                                    ...prev,
                                    [listingId]: foundListing
                                }));
                                return; // Exit early if successful
                            }
                        }
                        
                        // If we didn't find the specific listing, throw an error to try next approach
                        throw new Error('Listing not found in faculty-listings response');
                    } catch (firstFallbackError) {
                        console.log('First fallback failed, trying debug endpoint...');
                        
                        try {
                            // Try a direct debug endpoint for a specific listing
                            const debugResponse = await axios.get(
                                `${backendURL}/debug/listing/${listingId}?token=${token}`
                            );
                            
                            if (debugResponse.data) {
                                setListingDetails(prev => ({
                                    ...prev,
                                    [listingId]: debugResponse.data
                                }));
                                return; // Exit early if successful
                            }
                            
                            throw new Error('Debug endpoint returned no data');
                        } catch (secondFallbackError) {
                            // As a last resort, construct a minimal listing object from what we already know
                            console.log('All API attempts failed, using minimal data');
                            
                            // Find the listing title info from our existing matches data
                            let minimalListing = null;
                            for (const match of matches) {
                                const matchingListing = match.listings.find(l => l._id === listingId);
                                if (matchingListing) {
                                    minimalListing = {
                                        _id: matchingListing._id,
                                        title: matchingListing.title,
                                        description: matchingListing.description || 'Description not available',
                                        requirements: matchingListing.requirements || 'Requirements not available',
                                        duration: { value: 0, unit: 'Not specified' },
                                        wage: { type: 'Not specified', amount: 0, isPaid: false },
                                        facultyId: '',
                                        createdAt: new Date().toISOString()
                                    };
                                    break;
                                }
                            }
                            
                            if (minimalListing) {
                                setListingDetails(prev => ({
                                    ...prev,
                                    [listingId]: minimalListing
                                }));
                                console.log('Using limited listing data available from matches');
                            } else {
                                throw new Error('Failed to retrieve or construct listing details');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching full listing details for ${listingId}:`, error);
                
                // More detailed error logging
                if (axios.isAxiosError(error) && error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                
                Alert.alert(
                    'Error', 
                    'Failed to load full listing details. Please try again later.',
                    [
                        { 
                            text: 'Debug Info', 
                            onPress: () => Alert.alert('Listing ID', listingId)
                        },
                        { text: 'OK' }
                    ]
                );
            } finally {
                setLoadingListings(prev => ({
                    ...prev,
                    [listingId]: false
                }));
            }
        }
    };

    const viewStudentProfile = (student: Student) => {
        // Navigate to StudentInfo with studentId
        navigation.navigate('ProfileView', { studentId: student._id });
    };

    const filteredMatches = () => {
        if (!matches || matches.length === 0) return [];
        
        if (activeFilter === 'all') return matches;
        
        // First, filter out matches based on their swipe status
        const filteredMatchesByStatus = matches.map(match => {
            // For the 'pending' tab, only include swipes with pending status
            // For the 'accepted' tab, only include swipes with accepted status
            const filteredSwipes = match.swipes.filter(swipe => 
                activeFilter === 'pending' ? swipe.status === 'pending' : swipe.status === 'accepted'
            );
            
            // If there are no swipes that match the filter, don't include this student
            if (filteredSwipes.length === 0) return null;
            
            // Only include listings that correspond to the filtered swipes
            const filteredListingIds = filteredSwipes.map(swipe => swipe.listingId);
            const filteredListings = match.listings.filter(listing => 
                filteredListingIds.includes(listing._id)
            );
            
            return {
                ...match,
                swipes: filteredSwipes,
                listings: filteredListings
            };
        });
        
        // Remove null entries (students with no matching swipes)
        return filteredMatchesByStatus.filter(match => match !== null) as Match[];
    };

    const formatDuration = (duration: any) => {
        if (!duration) return 'Not specified';
        return `${duration.value} ${duration.unit}`;
    };

    const formatWage = (wage: any) => {
        if (!wage) return 'Not specified';
        if (!wage.isPaid) return 'Unpaid position';
        return `$${wage.amount} per ${wage.type}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderMatchItem = ({ item }: { item: Match }) => {
        // Ensure item has all required arrays to prevent errors
        const hasListings = item.listings && item.listings.length > 0;
        const hasSwipes = item.swipes && item.swipes.length > 0;

        return (
            <View style={[styles.matchCard, { backgroundColor: cardBackgroundColor }]}>
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
                                    
                                    const isExpanded = expandedListings[listing._id];
                                    
                                    return (
                                        <View key={listing._id} style={styles.listingRow}>
                                            <TouchableOpacity 
                                                style={styles.listingTitleRow}
                                                onPress={() => toggleListingExpanded(listing._id)}
                                            >
                                                <Text style={[styles.listingItem, { color: textColor }]} numberOfLines={1}>
                                                    <Text style={{fontWeight: 'bold'}}>{statusIcon} </Text>
                                                    {listing.title}
                                                </Text>
                                                {swipe && (
                                                    <Text style={[styles.statusBadge, { backgroundColor: statusColor, color:textColor }]}>
                                                        {swipe.status.toUpperCase()}
                                                    </Text>
                                                )}
                                                <Text style={[styles.expandCollapseIcon, { color: mutedTextColor }]}>
                                                    {isExpanded ? '▼' : '▶'}
                                                </Text>
                                            </TouchableOpacity>
                                            
                                            {isExpanded && (
                                                <View style={[styles.expandedListingDetails, { backgroundColor: sectionBackgroundColor }]}>
                                                    {loadingListings[listing._id] ? (
                                                        <View style={styles.loadingListingDetails}>
                                                            <ActivityIndicator size="small" color="#893030" />
                                                            <Text style={[styles.loadingListingText, { color: mutedTextColor }]}>Loading details...</Text>
                                                        </View>
                                                    ) : listingDetails[listing._id] ? (
                                                        // Display full listing details
                                                        <>
                                                            <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Description:</Text>
                                                            <Text style={[styles.expandedText, { color: textColor }]}>
                                                                {listingDetails[listing._id].description}
                                                            </Text>
                                                            
                                                            <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Requirements:</Text>
                                                            <Text style={[styles.expandedText, { color: textColor }]}>
                                                                {listingDetails[listing._id].requirements}
                                                            </Text>
                                                            
                                                            <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Duration:</Text>
                                                            <Text style={[styles.expandedText, { color: textColor }]}>
                                                                {formatDuration(listingDetails[listing._id].duration)}
                                                            </Text>
                                                            
                                                            <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Compensation:</Text>
                                                            <Text style={[styles.expandedText, { color: textColor }]}>
                                                                {formatWage(listingDetails[listing._id].wage)}
                                                            </Text>
                                                            
                                                            <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Posted:</Text>
                                                            <Text style={[styles.expandedText, { color: textColor }]}>
                                                                {formatDate(listingDetails[listing._id].createdAt)}
                                                            </Text>
                                                            
                                                            {swipe && swipe.status === 'pending' && (
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
                                                            )}
                                                        </>
                                                    ) : (
                                                        // Fallback to basic details if full details not available
                                                        <>
                                                            {listing.description && (
                                                                <>
                                                                    <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Description:</Text>
                                                                    <Text style={[styles.expandedText, { color: textColor }]}>{listing.description}</Text>
                                                                </>
                                                            )}
                                                            
                                                            {listing.requirements && (
                                                                <>
                                                                    <Text style={[styles.expandedSectionTitle, { color: subtextColor }]}>Requirements:</Text>
                                                                    <Text style={[styles.expandedText, { color: textColor }]}>{listing.requirements}</Text>
                                                                </>
                                                            )}
                                                            
                                                            {swipe && swipe.status === 'pending' && (
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
                                                            )}
                                                        </>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={[styles.noDataText, { color: mutedTextColor }]}>No listing interest data available</Text>
                        )}
                    </View>
                    
                    <View style={styles.studentDetails}>
                        <Text style={[styles.studentInfo, { color: textColor }]}>University: {item.student?.university || 'Not specified'}</Text>
                        <Text style={[styles.studentInfo, { color: textColor }]}>Major: {item.student?.major || 'Not specified'}</Text>
                        <Text style={[styles.studentInfo, { color: textColor }]}>Skills: {item.student?.skills || 'Not specified'}</Text>
                    </View>
                </View>
                
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
            <View style={[styles.container, { backgroundColor }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>Interested Students</Text>
                </View>
                
                <View style={[styles.filterContainer, { backgroundColor: 'transparent' }]}>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            { backgroundColor: theme === 'light' ? '#f0f0f0' : '#444' },
                            activeFilter === 'all' && [styles.activeFilterButton, { backgroundColor: buttonColor }]
                        ]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            { color: theme === 'light' ? '#555' : '#ddd' },
                            activeFilter === 'all' && styles.activeFilterText
                        ]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            { backgroundColor: theme === 'light' ? '#f0f0f0' : '#444' },
                            activeFilter === 'pending' && [styles.activeFilterButton, { backgroundColor: buttonColor }]
                        ]}
                        onPress={() => setActiveFilter('pending')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            { color: theme === 'light' ? '#555' : '#ddd' },
                            activeFilter === 'pending' && styles.activeFilterText
                        ]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            { backgroundColor: theme === 'light' ? '#f0f0f0' : '#444' },
                            activeFilter === 'accepted' && [styles.activeFilterButton, { backgroundColor: buttonColor }]
                        ]}
                        onPress={() => setActiveFilter('accepted')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            { color: theme === 'light' ? '#555' : '#ddd' },
                            activeFilter === 'accepted' && styles.activeFilterText
                        ]}>Accepted</Text>
                    </TouchableOpacity>
                </View>
                
                {filteredMatches().length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: '#893030' }]}>No student matches found</Text>
                        <Text style={[styles.emptySubtext, { color: mutedTextColor }]}>
                            {activeFilter === 'all' 
                                ? 'Students will appear here when they swipe right on your listings' 
                                : activeFilter === 'pending'
                                    ? 'No pending student requests at the moment'
                                    : 'You haven\'t accepted any student requests yet'}
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('ListingCreate')}
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#893030',
        textAlign: 'center',
        marginVertical: 20,
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
        width: 100,
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
    },
    activeFilterButton: {
        backgroundColor: '#893030',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
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
        borderRadius: 6,
        backgroundColor: '#893030',
    },
    headerProfileButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    studentDetails: {
        padding: 6,
        borderRadius: 6,
        marginBottom: 4,
    },
    studentInfo: {
        fontSize: 14,
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
        marginBottom: 5,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.25)',
    },
    listingTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: 'rgba(59, 56, 56, 0.96)',
    },
    expandCollapseIcon: {
        fontSize: 12,
        color: '#555',
        marginLeft: 4,
    },
    expandedListingDetails: {
        padding: 8,
    },
    expandedSectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    expandedText: {
        fontSize: 12,
        marginBottom: 8,
    },
    listingItem: {
        fontSize: 13,
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
    loadingListingDetails: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    loadingListingText: {
        fontSize: 12,
        marginLeft: 8,
    },
    actionButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginHorizontal: 4,
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
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
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
        textAlign: 'center',
    }
});

export default FacultyInterestedStudents; 