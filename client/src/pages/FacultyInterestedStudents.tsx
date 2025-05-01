import React, { useEffect, useState, useCallback } from 'react';
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
    // Track if listings are being loaded
    const [loadingListings, setLoadingListings] = useState(false);
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    
    // Theme colors
    const primaryColor = '#893030';
    const cardBackgroundColor = theme === 'light' ? '#ffffff' : '#333333';
    const textColor = theme === 'light' ? '#333333' : '#ffffff';
    const subtextColor = theme === 'light' ? '#555555' : '#dddddd';
    const mutedTextColor = theme === 'light' ? '#777777' : '#aaaaaa';
    const disabledTextColor = theme === 'light' ? '#999999' : '#666666';
    const borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    const sectionBackgroundColor = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const filterButtonColor = theme === 'light' ? '#f0f0f0' : '#444444';
    const filterButtonTextColor = theme === 'light' ? '#555555' : '#dddddd';
    const listingTitleRowColor = theme === 'light' ? 'rgba(137, 48, 48, 0.1)' : 'rgba(137, 48, 48, 0.3)';

    useEffect(() => {
        if (!isFaculty) {
            Alert.alert('Error', 'Only faculty can view this page');
            navigation.goBack();
            return;
        }
        
        fetchMatches();
    }, []);

    // New function to prefetch all listing details in a single batch request
    const prefetchListingDetails = useCallback(async (listingIds: string[]) => {
        if (!listingIds.length) return;
        
        // Filter out IDs we already have cached
        const idsToFetch = listingIds.filter(id => !listingDetails[id]);
        if (!idsToFetch.length) return;
        
        try {
            setLoadingListings(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Filter IDs to ensure they're valid MongoDB ObjectIds
            // MongoDB ObjectIds are 24 character hex strings
            const validIds = idsToFetch.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));
            
            if (validIds.length === 0) {
                console.warn('No valid listing IDs to fetch');
                return;
            }
            
            console.log(`Attempting to fetch ${validIds.length} listings`);
            const backendURL = await getBackendURL();
            
            // Try using the new test endpoint that doesn't require token verification
            try {
                console.log('Using test batch endpoint that should be more reliable');
                const testResponse = await axios.get(
                    `${backendURL}/test/listings/batch?ids=${validIds.join(',')}`
                );
                
                if (testResponse.data && Array.isArray(testResponse.data)) {
                    // Update our cache with all fetched listings
                    const newDetails = { ...listingDetails };
                    testResponse.data.forEach((listing: FullListing) => {
                        newDetails[listing._id] = listing;
                    });
                    setListingDetails(newDetails);
                    console.log(`Successfully fetched ${testResponse.data.length} listings via test endpoint`);
                    return; // Exit early if successful
                }
            } catch (testError) {
                console.warn('Test endpoint failed, trying standard endpoint:', testError);
                // Continue to standard endpoint if test endpoint fails
            }
            
            // Fall back to standard endpoint if test endpoint fails
            const response = await axios.get(
                `${backendURL}/listings/batch?ids=${validIds.join(',')}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data && Array.isArray(response.data)) {
                // Update our cache with all fetched listings
                const newDetails = { ...listingDetails };
                response.data.forEach((listing: FullListing) => {
                    newDetails[listing._id] = listing;
                });
                setListingDetails(newDetails);
                console.log(`Successfully fetched ${response.data.length} listings via standard endpoint`);
            } else {
                throw new Error('Invalid response format from batch listings endpoint');
            }
        } catch (error) {
            console.error('Error batch fetching listing details:', error);
            
            // Fallback: Use existing minimal data from matches
            const minimalListings: {[key: string]: FullListing} = {};
            
            // Create minimal listing objects from what we know
            for (const id of idsToFetch) {
                // Skip invalid IDs
                if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
                    continue;
                }
                
                for (const match of matches as Match[]) {
                    const matchingListing = match.listings.find(l => l._id === id);
                    if (matchingListing) {
                        minimalListings[id] = {
                            _id: matchingListing._id,
                            title: matchingListing.title,
                            description: matchingListing.description || 'Description not available',
                            requirements: matchingListing.requirements || 'Requirements not available',
                            duration: { value: 0, unit: 'Not specified' },
                            wage: { type: 'Not specified', amount: 0, isPaid: false },
                            facultyId: '',
                            createdAt: new Date().toISOString()
                        };
                    }
                }
            }
            
            setListingDetails(prev => ({
                ...prev,
                ...minimalListings
            }));
        } finally {
            setLoadingListings(false);
        }
    }, [matches, listingDetails]);

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
            // Use the new optimized endpoint that reduces database calls
            const response = await axios.get(`${backendURL}/matches/faculty-optimized`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Faculty matches data:', JSON.stringify(response.data));
            
            // Ensure proper data structure - defensive programming
            const cleanedMatches = response.data.map((match: Match) => ({
                student: match.student || {},
                listings: match.listings || [],
                swipes: match.swipes || []
            }));
            
            setMatches(cleanedMatches);
            // Reset expanded listings state when refreshing
            setExpandedListings({});
            
            // Prefetch all listing details when matches load
            const allListingIds = cleanedMatches.flatMap((match: Match) => 
                match.listings.map((listing: ListingTitle) => listing._id)
            );
            prefetchListingDetails(allListingIds);
            
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

    const toggleListingExpanded = (listingId: string) => {
        // Toggle expanded state only
        setExpandedListings(prev => ({
            ...prev,
            [listingId]: !prev[listingId]
        }));
        
        // We don't need to fetch individual listings anymore as we prefetch all of them
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
            <View style={[styles.matchCard, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
                <View style={styles.cardContent}>
                    <View style={styles.studentHeader}>
                        <Text style={[styles.studentName, { color: textColor }]}>
                            {item.student?.name || 'Unknown Student'}
                        </Text>
                        <TouchableOpacity 
                            style={[styles.headerProfileButton, { backgroundColor: primaryColor }]}
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
                                    
                                    const isExpanded = Boolean(expandedListings[listing._id]);
                                    
                                    return (
                                        <View key={listing._id} style={[styles.listingRow, { borderColor: borderColor }]}>
                                            <TouchableOpacity 
                                                style={[styles.listingTitleRow, { backgroundColor: listingTitleRowColor }]}
                                                onPress={() => toggleListingExpanded(listing._id)}
                                            >
                                                <Text style={[styles.listingItem, { color: textColor }]} numberOfLines={1}>
                                                    <Text style={{fontWeight: 'bold'}}>{statusIcon} </Text>
                                                    {listing.title}
                                                </Text>
                                                {swipe && (
                                                    <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                                        {swipe.status.toUpperCase()}
                                                    </Text>
                                                )}
                                                <Text style={[styles.expandCollapseIcon, { color: mutedTextColor }]}>
                                                    {isExpanded ? '▼' : '▶'}
                                                </Text>
                                            </TouchableOpacity>
                                            
                                            {isExpanded && (
                                                <View style={[styles.expandedListingDetails, { backgroundColor: sectionBackgroundColor }]}>
                                                    {loadingListings ? (
                                                        <View style={styles.loadingListingDetails}>
                                                            <ActivityIndicator size="small" color={primaryColor} />
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
                                                                        <Text style={styles.actionButtonText}>Reject</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Text style={[styles.expandedText, { color: textColor }]}>
                                                            Could not load detailed information for this listing.
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={[styles.noListingsText, { color: mutedTextColor }]}>
                                No listing information available.
                            </Text>
                        )}
                    </View>
                    
                    <View style={styles.contactRow}>
                        <TouchableOpacity 
                            style={[styles.contactButton, { backgroundColor: primaryColor }]}
                            onPress={() => contactStudent(item.student)}
                        >
                            <Text style={styles.contactButtonText}>Contact Student</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={[styles.loadingText, { color: mutedTextColor }]}>
                        Loading student matches...
                    </Text>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: primaryColor }]}>Student Matches</Text>
            </View>
            
            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[
                        styles.filterButton, 
                        activeFilter === 'all' && [styles.activeFilterButton, { backgroundColor: primaryColor }],
                        { backgroundColor: activeFilter === 'all' ? primaryColor : filterButtonColor }
                    ]}
                    onPress={() => setActiveFilter('all')}
                >
                    <Text style={[
                        styles.filterButtonText, 
                        activeFilter === 'all' && styles.activeFilterText,
                        { color: activeFilter === 'all' ? '#fff' : filterButtonTextColor }
                    ]}>
                        All
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.filterButton, 
                        activeFilter === 'pending' && [styles.activeFilterButton, { backgroundColor: primaryColor }],
                        { backgroundColor: activeFilter === 'pending' ? primaryColor : filterButtonColor }
                    ]}
                    onPress={() => setActiveFilter('pending')}
                >
                    <Text style={[
                        styles.filterButtonText, 
                        activeFilter === 'pending' && styles.activeFilterText,
                        { color: activeFilter === 'pending' ? '#fff' : filterButtonTextColor }
                    ]}>
                        Pending
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.filterButton, 
                        activeFilter === 'accepted' && [styles.activeFilterButton, { backgroundColor: primaryColor }],
                        { backgroundColor: activeFilter === 'accepted' ? primaryColor : filterButtonColor }
                    ]}
                    onPress={() => setActiveFilter('accepted')}
                >
                    <Text style={[
                        styles.filterButtonText, 
                        activeFilter === 'accepted' && styles.activeFilterText,
                        { color: activeFilter === 'accepted' ? '#fff' : filterButtonTextColor }
                    ]}>
                        Accepted
                    </Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.container}>
                {(!matches || matches.length === 0 || filteredMatches().length === 0) ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: textColor }]}>
                            No {activeFilter === 'all' ? '' : activeFilter} student matches found
                        </Text>
                        <Text style={[styles.emptySubtext, { color: mutedTextColor }]}>
                            {activeFilter === 'all' 
                                ? 'Students will appear here after they express interest in your listings'
                                : activeFilter === 'pending'
                                    ? 'No students currently waiting for your response'
                                    : 'You have not accepted any student interests yet'
                            }
                        </Text>
                        <TouchableOpacity 
                            style={[styles.createButton, { backgroundColor: primaryColor }]}
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
        </ThemedView>
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
        borderRadius: 6,
    },
    activeFilterButton: {
        // Dynamic color applied inline
    },
    filterButtonText: {
        fontSize: 14,
        textAlign: 'center',
    },
    activeFilterText: {
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
    },
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    matchCard: {
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        borderWidth: 1,
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
    },
    listingTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    expandCollapseIcon: {
        fontSize: 12,
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
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noListingsText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    }
});

export default FacultyInterestedStudents; 