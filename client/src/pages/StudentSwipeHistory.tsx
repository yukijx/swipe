import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBackendURL } from '../utils/network';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

interface Listing {
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
    value: number;
  };
  isPaid: boolean;
  createdAt: string;
  userId: string;
  professorName: string;
  professorUniversity: string;
  professorDepartment: string;
}

interface Swipe {
  _id: string;
  listing: Listing;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface SwipeItem {
  listing: Listing;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
  swipeId: string;
}

const StudentSwipeHistory = ({ navigation }: { navigation: any }) => {
  const [swipes, setSwipes] = useState<SwipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#000' : '#fff';
  const backgroundColor = theme === 'light' ? '#fff' : '#333';

  useEffect(() => {
    fetchSwipeHistory();
  }, []);

  const fetchSwipeHistory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again');
        navigation.navigate('AuthLogin');
        return;
      }

      const backendURL = await getBackendURL();
      const response = await axios.get(`${backendURL}/swipe/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Swipe history data:', response.data);

      // Format the data
      const formattedSwipes = response.data.map((swipe: Swipe) => ({
        listing: swipe.listing,
        status: swipe.status,
        date: new Date(swipe.createdAt).toLocaleDateString(),
        swipeId: swipe._id
      }));

      setSwipes(formattedSwipes);
    } catch (error) {
      console.error('Error fetching swipe history:', error);
      Alert.alert('Error', 'Failed to fetch swipe history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSwipes = () => {
    if (activeFilter === 'all') return swipes;
    return swipes.filter(swipe => swipe.status === activeFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f39c12'; // Orange for pending
      case 'accepted':
        return '#2ecc71'; // Green for accepted
      case 'rejected':
        return '#e74c3c'; // Red for rejected
      default:
        return '#bbb'; // Grey default
    }
  };

  const renderSwipeItem = ({ item }: { item: SwipeItem }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <View style={[styles.swipeItem, { backgroundColor }]}>
        <View style={styles.swipeHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={[styles.dateText, { color: textColor }]}>{item.date}</Text>
        </View>
        
        <Text style={[styles.listingTitle, { color: textColor }]}>
          {item.listing.title}
        </Text>
        
        <View style={styles.listingDetails}>
          <Text style={[styles.professorName, { color: textColor }]}>
            Professor: {item.listing.professorName}
          </Text>
          <Text style={[styles.universityText, { color: textColor }]}>
            {item.listing.professorUniversity} - {item.listing.professorDepartment}
          </Text>
          
          <View style={styles.listingStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Duration:</Text>
              <Text style={[styles.statValue, { color: textColor }]}>
                {item.listing.duration.value} {item.listing.duration.unit}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Compensation:</Text>
              <Text style={[styles.statValue, { color: textColor }]}>
                {item.listing.isPaid ? 
                  `${item.listing.wage.value} ${item.listing.wage.type}` : 
                  'Unpaid'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('ListingDetail', { listingId: item.listing._id })}
        >
          <Text style={styles.viewButtonText}>View Listing</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: textColor }]}>
        {activeFilter === 'all' ? 
          'You haven\'t swiped on any listings yet.' : 
          `No ${activeFilter} swipes found.`}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('SwipeCards')}
      >
        <Text style={styles.browseButtonText}>Browse Listings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ResponsiveScreen navigation={navigation}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Your Swipe History</Text>
        
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
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              activeFilter === 'rejected' && styles.activeFilterButton
            ]}
            onPress={() => setActiveFilter('rejected')}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilter === 'rejected' && styles.activeFilterText
            ]}>Rejected</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#893030" />
            <Text style={styles.loadingText}>Loading swipe history...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredSwipes()}
            renderItem={renderSwipeItem}
            keyExtractor={(item) => item.swipeId}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </View>
    </ResponsiveScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#893030',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
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
  listContainer: {
    flexGrow: 1,
  },
  swipeItem: {
    marginBottom: 15,
    borderRadius: 8,
    padding: 15,
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
  swipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listingDetails: {
    marginBottom: 15,
  },
  professorName: {
    fontSize: 16,
    marginBottom: 5,
  },
  universityText: {
    fontSize: 14,
    marginBottom: 10,
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: '#893030',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewButtonText: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#893030',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StudentSwipeHistory; 