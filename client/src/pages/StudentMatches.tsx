import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

type MatchedListing = {
    _id: string;
    title: string;
    description: string;
    requirements: string;
    facultyId: {
        _id: string;
        name: string;
        email: string;
        department: string;
        university?: string;
    };
    duration?: {
        value: number;
        unit: string;
    };
    wage?: {
        type: string;
        amount: number;
        isPaid: boolean;
    };
    createdAt: string;
    expanded?: boolean;
};

const StudentMatches = ({ navigation }: { navigation: any }) => {
    const [matches, setMatches] = useState<MatchedListing[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const backgroundColor = theme === 'light' ? '#fff' : '#333';
    const textColor = theme === 'light' ? '#893030' : '#fff';

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
                navigation.navigate('AuthLogin');
                return;
            }

            const backendURL = await getBackendURL();
            const response = await axios.get(`${backendURL}/matches/student`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Matches data:', JSON.stringify(response.data));
            
            // Add expanded property to each listing
            const matchesWithExpandedProp = response.data.map((listing: any) => ({
                ...listing,
                expanded: false
            }));
            
            setMatches(matchesWithExpandedProp);
        } catch (error) {
            console.error('Error fetching matches:', error);
            Alert.alert('Error', 'Failed to fetch matches. Please try again.');
        } finally {
            setLoading(false);
        }
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
        if (!dateString) return 'Not specified';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
    };

    const toggleExpanded = (listingId: string) => {
        setMatches(prevMatches => 
            prevMatches.map(match => 
                match._id === listingId 
                    ? { ...match, expanded: !match.expanded } 
                    : match
            )
        );
    };

    const viewListingDetails = (listing: MatchedListing) => {
        navigation.navigate('ListingDetail', { listingId: listing._id });
    };
    
    const contactFaculty = (listing: MatchedListing) => {
        if (listing.facultyId && listing.facultyId.email) {
            Alert.alert(
                'Faculty Contact Information',
                `Email: ${listing.facultyId.email}`
            );
        } else {
            Alert.alert('Error', 'Faculty contact information not available');
        }
    };

    const renderMatchItem = (item: MatchedListing) => (
        <View key={item._id} style={styles.matchCard}>
            <TouchableOpacity 
                style={styles.matchContent}
                onPress={() => toggleExpanded(item._id)}
            >
                <Text style={styles.matchTitle}>{item.title || 'Untitled Research Opportunity'}</Text>
                
                {item.facultyId && (
                    <Text style={styles.facultyNameSmall}>
                        By: {item.facultyId.name || 'Faculty Member'}
                    </Text>
                )}
                
                <View style={styles.matchDetails}>
                    <Text style={styles.matchDetail}>
                        Duration: {formatDuration(item.duration)}
                    </Text>
                    <Text style={styles.matchDetail}>
                        Compensation: {formatWage(item.wage)}
                    </Text>
                </View>
                
                <Text style={styles.matchDescription} numberOfLines={item.expanded ? undefined : 2}>
                    {item.description || 'No description provided'}
                </Text>
                
                {/* Expanded content */}
                {item.expanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.expandedText}>{item.description || 'No description provided'}</Text>
                        
                        {item.requirements && (
                            <>
                                <Text style={styles.sectionTitle}>Requirements</Text>
                                <Text style={styles.expandedText}>{item.requirements}</Text>
                            </>
                        )}
                        
                        {item.facultyId && (
                            <>
                                <Text style={styles.sectionTitle}>Faculty Information</Text>
                                <Text style={styles.expandedText}>
                                    <Text style={{fontWeight: 'bold'}}>Name:</Text> {item.facultyId.name || 'Not specified'}{'\n'}
                                    <Text style={{fontWeight: 'bold'}}>Department:</Text> {item.facultyId.department || 'Not specified'}{'\n'}
                                    {item.facultyId.university && (
                                        <><Text style={{fontWeight: 'bold'}}>University:</Text> {item.facultyId.university}{'\n'}</>
                                    )}
                                </Text>
                            </>
                        )}
                        
                        <Text style={styles.sectionTitle}>Duration</Text>
                        <Text style={styles.expandedText}>{formatDuration(item.duration)}</Text>
                        
                        <Text style={styles.sectionTitle}>Compensation</Text>
                        <Text style={styles.expandedText}>{formatWage(item.wage)}</Text>
                        
                        <Text style={styles.sectionTitle}>Posted</Text>
                        <Text style={styles.expandedText}>{formatDate(item.createdAt)}</Text>
                        
                        <View style={styles.expandedButtons}>
                            <TouchableOpacity 
                                style={[styles.expandedButton, { backgroundColor: '#28a745' }]}
                                onPress={() => contactFaculty(item)}
                            >
                                <Text style={styles.expandedButtonText}>Contact Faculty</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <Text style={styles.collapseText}>
                            Tap to collapse
                        </Text>
                    </View>
                )}
                
                {!item.expanded && (
                    <Text style={styles.expandPrompt}>
                        Tap to see more details
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <ResponsiveScreen navigation={navigation}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#893030" />
                    <Text style={styles.loadingText}>Loading your matches...</Text>
                </View>
            </ResponsiveScreen>
        );
    }

    return (
        <ResponsiveScreen navigation={navigation} scrollable={false}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Your Accepted Matches</Text>
                </View>
                
                {matches.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No matches yet!</Text>
                        <Text style={styles.emptySubtext}>
                            Matches will appear here after you express interest and faculty members accept your application
                        </Text>
                        <TouchableOpacity
                            style={styles.swipeButton}
                            onPress={() => navigation.navigate('SwipeCards')}
                        >
                            <Text style={styles.swipeButtonText}>Go to Swipe</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView style={styles.list} contentContainerStyle={styles.listContainer}>
                        {matches.map(renderMatchItem)}
                    </ScrollView>
                )}
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
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#893030',
    },
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    matchCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 15,
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
    matchContent: {
        padding: 15,
    },
    matchTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
        marginBottom: 5,
    },
    facultyNameSmall: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    matchDetails: {
        marginBottom: 8,
    },
    matchDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    matchDescription: {
        fontSize: 14,
        color: '#444',
    },
    expandPrompt: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 5,
        textAlign: 'center',
    },
    expandedContent: {
        padding: 15,
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        marginTop: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
    },
    expandedText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
        marginBottom: 10,
    },
    expandedButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    expandedButton: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    expandedButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    collapseText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 13,
        marginTop: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#893030',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    swipeButton: {
        backgroundColor: '#893030',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    swipeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    list: {
        flex: 1,
    },
    facultyInfo: {
        backgroundColor: 'rgba(137, 48, 48, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    facultyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    facultyDepartment: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    viewButtonContainer: {
        backgroundColor: '#893030',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 8,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    }
});

export default StudentMatches; 