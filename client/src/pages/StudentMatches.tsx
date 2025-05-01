import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import ThemedView from '../components/ThemedView';

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
    
    // Theme colors
    const backgroundColor = theme === 'light' ? '#fff7d5' : '#1e1e1e';
    const cardBackgroundColor = theme === 'light' ? '#ffffff' : '#333333';
    const expandedBackgroundColor = theme === 'light' ? '#f7f7f7' : '#2a2a2a';
    const primaryColor = '#893030';
    const textColor = theme === 'light' ? '#333333' : '#ffffff';
    const secondaryTextColor = theme === 'light' ? '#666666' : '#cccccc';
    const tertiaryTextColor = theme === 'light' ? '#888888' : '#aaaaaa';
    const dividerColor = theme === 'light' ? '#dddddd' : '#444444';

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
            // Use the new optimized endpoint that reduces database calls
            const response = await axios.get(`${backendURL}/matches/student-optimized`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(`Retrieved ${response.data.length} matches from optimized endpoint`);
            
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
        <View key={item._id} style={[styles.matchCard, { backgroundColor: cardBackgroundColor }]}>
            <TouchableOpacity 
                style={styles.matchContent}
                onPress={() => toggleExpanded(item._id)}
            >
                <Text style={[styles.matchTitle, { color: primaryColor }]}>
                    {item.title || 'Untitled Research Opportunity'}
                </Text>
                
                {item.facultyId && (
                    <Text style={[styles.facultyNameSmall, { color: secondaryTextColor }]}>
                        By: {item.facultyId.name || 'Faculty Member'}
                    </Text>
                )}
                
                <View style={styles.matchDetails}>
                    <Text style={[styles.matchDetail, { color: secondaryTextColor }]}>
                        Duration: {formatDuration(item.duration)}
                    </Text>
                    <Text style={[styles.matchDetail, { color: secondaryTextColor }]}>
                        Compensation: {formatWage(item.wage)}
                    </Text>
                </View>
                
                <Text 
                    style={[styles.matchDescription, { color: textColor }]} 
                    numberOfLines={item.expanded ? undefined : 2}
                >
                    {item.description || 'No description provided'}
                </Text>
                
                {/* Expanded content */}
                {item.expanded && (
                    <View style={[styles.expandedContent, { backgroundColor: expandedBackgroundColor }]}>
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
                        <Text style={[styles.expandedText, { color: textColor }]}>
                            {item.description || 'No description provided'}
                        </Text>
                        
                        {item.requirements && (
                            <>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>Requirements</Text>
                                <Text style={[styles.expandedText, { color: textColor }]}>{item.requirements}</Text>
                            </>
                        )}
                        
                        {item.facultyId && (
                            <>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>Faculty Information</Text>
                                <Text style={[styles.expandedText, { color: textColor }]}>
                                    <Text style={{fontWeight: 'bold'}}>Name:</Text> {item.facultyId.name || 'Not specified'}{'\n'}
                                    <Text style={{fontWeight: 'bold'}}>Department:</Text> {item.facultyId.department || 'Not specified'}{'\n'}
                                    {item.facultyId.university && (
                                        <><Text style={{fontWeight: 'bold'}}>University:</Text> {item.facultyId.university}{'\n'}</>
                                    )}
                                </Text>
                            </>
                        )}
                        
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Duration</Text>
                        <Text style={[styles.expandedText, { color: textColor }]}>{formatDuration(item.duration)}</Text>
                        
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Compensation</Text>
                        <Text style={[styles.expandedText, { color: textColor }]}>{formatWage(item.wage)}</Text>
                        
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Posted</Text>
                        <Text style={[styles.expandedText, { color: textColor }]}>{formatDate(item.createdAt)}</Text>
                        
                        <View style={styles.expandedButtons}>
                            <TouchableOpacity 
                                style={[styles.expandedButton, { backgroundColor: '#28a745' }]}
                                onPress={() => contactFaculty(item)}
                            >
                                <Text style={styles.expandedButtonText}>Contact Faculty</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                        
                        <Text style={[styles.collapseText, { color: tertiaryTextColor }]}>
                            Tap to collapse
                        </Text>
                    </View>
                )}
                
                {!item.expanded && (
                    <Text style={[styles.expandPrompt, { color: tertiaryTextColor }]}>
                        Tap to see more details
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
                        Loading your matches...
                    </Text>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: primaryColor }]}>Your Accepted Matches</Text>
            </View>
            
            {matches.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: primaryColor }]}>No matches yet!</Text>
                    <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
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
        </ThemedView>
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
    },
    header: {
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
    },
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    matchCard: {
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
        marginBottom: 5,
    },
    facultyNameSmall: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 5,
    },
    matchDetails: {
        marginBottom: 8,
    },
    matchDetail: {
        fontSize: 14,
        marginBottom: 3,
    },
    matchDescription: {
        fontSize: 14,
    },
    expandPrompt: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 5,
        textAlign: 'center',
    },
    expandedContent: {
        padding: 15,
        borderRadius: 8,
        marginTop: 5,
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    expandedText: {
        fontSize: 14,
        lineHeight: 20,
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
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
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
    },
    facultyDepartment: {
        fontSize: 14,
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