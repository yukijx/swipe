import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from '../utils/network';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

type Listing = {
    _id: string;
    facultyId: {
        _id: string;
        name: string;
        email: string;
        department: string;
    };
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

type SwipeWithListing = {
    swipe: {
        _id: string;
        interested: boolean;
        facultyAccepted: boolean | null;
        createdAt: string;
    };
    listing: Listing;
};

const StudentSwipeHistory: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [swipes, setSwipes] = useState<SwipeWithListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'interested'|'declined'>('interested');
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const backgroundColor = theme === 'light' ? '#f9f9f9' : '#333';
    const cardColor = theme === 'light' ? '#fff7d5' : '#444';

    useEffect(() => {
        if (isFaculty) {
            Alert.alert('Error', 'Only students can view their application history');
            navigation.goBack();
            return;
        }
        
        fetchSwipes();
    }, []);

    const fetchSwipes = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                navigation.navigate('Login');
                return;
            }

            const backendURL = await getBackendURL();
            const response = await axios.get(`${backendURL}/swipes/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Swipes data received:', response.data.length, 'items');
            setSwipes(response.data);
        } catch (error) {
            console.error('Error fetching swipes:', error);
            Alert.alert('Error', 'Failed to fetch your application history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const changeSwipeStatus = async (listingId: string, newInterestedStatus: boolean) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const backendURL = await getBackendURL();
            const response = await axios.post(`${backendURL}/swipe/update`, 
                { 
                    listingId, 
                    interested: newInterestedStatus 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Swipe updated:', response.data);
            
            // Update the local state
            setSwipes(prev => prev.map(item => {
                if (item.listing._id === listingId) {
                    return {
                        ...item,
                        swipe: {
                            ...item.swipe,
                            interested: newInterestedStatus,
                            // If faculty accepted before, but student now rejects, set to null
                            facultyAccepted: !newInterestedStatus && item.swipe.facultyAccepted ? null : item.swipe.facultyAccepted
                        }
                    };
                }
                return item;
            }));

            Alert.alert(
                'Success', 
                `Application status updated to ${newInterestedStatus ? 'interested' : 'not interested'}`
            );
        } catch (error) {
            console.error('Error updating swipe:', error);
            Alert.alert('Error', 'Failed to update your application status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatDuration = (duration: any) => {
        if (!duration || !duration.value || !duration.unit) {
            return 'Unknown duration';
        }
        return `${duration.value} ${duration.unit}`;
    };

    const formatWage = (wage: any) => {
        if (!wage) return 'No compensation info';
        
        if (!wage.isPaid) return 'Unpaid';
        
        if (wage.type === 'hourly') {
            return `$${wage.amount}/hour`;
        } else if (wage.type === 'monthly') {
            return `$${wage.amount}/month`;
        } else {
            return `$${wage.amount} total`;
        }
    };

    const getStatusText = (swipe: any) => {
        if (!swipe.interested) return 'Not Interested';
        if (swipe.facultyAccepted === true) return 'Matched! ✓';
        if (swipe.facultyAccepted === false) return 'Rejected by Faculty';
        return 'Pending Faculty Review';
    };

    const getStatusColor = (swipe: any) => {
        if (!swipe.interested) return '#888';
        if (swipe.facultyAccepted === true) return '#4CAF50';
        if (swipe.facultyAccepted === false) return '#F44336';
        return '#FFC107';
    };

    const filteredSwipes = swipes.filter(item => 
        view === 'interested' ? item.swipe.interested : !item.swipe.interested
    );

    const renderSwipeItem = ({ item }: { item: SwipeWithListing }) => {
        return (
            <View style={[styles.listingCard, { backgroundColor: cardColor }]}>
                <Text style={[styles.listingTitle, { color: textColor }]}>{item.listing.title}</Text>
                
                <View style={styles.statusRow}>
                    <Text style={[
                        styles.statusText, 
                        { backgroundColor: getStatusColor(item.swipe) }
                    ]}>
                        {getStatusText(item.swipe)}
                    </Text>
                    <Text style={styles.dateText}>Applied: {formatDate(item.swipe.createdAt)}</Text>
                </View>
                
                {item.listing.facultyId && (
                    <Text style={styles.facultyName}>
                        By: {item.listing.facultyId.name || 'Unknown Faculty'}
                        {item.listing.facultyId.department ? ` (${item.listing.facultyId.department})` : ''}
                    </Text>
                )}
                
                <View style={styles.listingDetails}>
                    <Text style={styles.listingDetail}>
                        Duration: {formatDuration(item.listing.duration)}
                    </Text>
                    <Text style={styles.listingDetail}>
                        Compensation: {formatWage(item.listing.wage)}
                    </Text>
                </View>
                
                <View style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description} numberOfLines={3}>
                    {item.listing.description}
                </Text>
                
                <View style={styles.actionsContainer}>
                    {view === 'interested' && !item.swipe.facultyAccepted && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.noButton]}
                            onPress={() => changeSwipeStatus(item.listing._id, false)}
                        >
                            <Text style={styles.actionButtonText}>Remove Interest</Text>
                        </TouchableOpacity>
                    )}
                    
                    {view === 'declined' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.yesButton]}
                            onPress={() => changeSwipeStatus(item.listing._id, true)}
                        >
                            <Text style={styles.actionButtonText}>Mark Interested</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => navigation.navigate('Listing', { listingId: item.listing._id })}
                    >
                        <Text style={styles.actionButtonText}>View Details</Text>
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
                    <Text style={styles.loadingText}>Loading your application history...</Text>
                </View>
            </ResponsiveScreen>
        );
    }

    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>My Applications</Text>
                
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            view === 'interested' && styles.activeTab
                        ]}
                        onPress={() => setView('interested')}
                    >
                        <Text style={[
                            styles.tabText,
                            view === 'interested' && styles.activeTabText
                        ]}>Interested</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            view === 'declined' && styles.activeTab
                        ]}
                        onPress={() => setView('declined')}
                    >
                        <Text style={[
                            styles.tabText,
                            view === 'declined' && styles.activeTabText
                        ]}>Declined</Text>
                    </TouchableOpacity>
                </View>
                
                {filteredSwipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {view === 'interested' 
                                ? "You haven't shown interest in any positions yet." 
                                : "You don't have any declined positions."}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredSwipes}
                        renderItem={renderSwipeItem}
                        keyExtractor={(item) => item.swipe._id}
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
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    activeTab: {
        backgroundColor: '#893030',
    },
    tabText: {
        fontWeight: '600',
        color: '#333',
    },
    activeTabText: {
        color: '#fff',
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    },
    listingCard: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusText: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
    },
    facultyName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    listingDetails: {
        marginBottom: 8,
    },
    listingDetail: {
        fontSize: 14,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noButton: {
        backgroundColor: '#F44336',
    },
    yesButton: {
        backgroundColor: '#4CAF50',
    },
    viewButton: {
        backgroundColor: '#2196F3',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default StudentSwipeHistory; 