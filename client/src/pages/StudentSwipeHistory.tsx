import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Platform, ActivityIndicator, RefreshControl, Modal } from 'react-native';
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
  interested: boolean;
}

type FilterOption = 'all' | 'interested' | 'not-interested' | 'pending' | 'accepted' | 'rejected';

const StudentSwipeHistory = ({ navigation }: { navigation: any }) => {
  const [swipes, setSwipes] = useState<SwipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>(['all']);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#000' : '#fff';
  const backgroundColor = theme === 'light' ? '#fff' : '#333';
  const modalBackgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)';

  // Filter options with labels
  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All Swipes' },
    { value: 'interested', label: 'Interested' },
    { value: 'not-interested', label: 'Not Interested' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

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
      
      try {
        // Use the new optimized endpoint that fetches listings in a single batch
        console.log('Fetching swipe history from optimized endpoint');
        const response = await axios.get(`${backendURL}/swipes/all-optimized`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000 // 10 second timeout
        });

        console.log('Swipe history response status:', response.status);
        
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response format:', response.data);
          Alert.alert('Error', 'Received invalid data format from the server');
          setSwipes([]);
          return;
        }
        
        console.log(`Received ${response.data.length} swipe history records`);

        // Format the data with error handling for each item
        const formattedSwipes = response.data.map((item: any) => {
          // Skip invalid swipe entries
          if (!item || typeof item !== 'object' || !item.swipe) {
            console.log('Skipping invalid swipe entry:', item);
            return null;
          }
          
          const swipe = item.swipe;
          const listing = item.listing || {};
          
          if (!swipe._id) {
            console.log('Swipe entry missing ID:', swipe);
            return null;
          }

          // Get faculty info from the listing - handle different possible formats
          let facultyInfo: any = {};
          if (listing.facultyId) {
            if (typeof listing.facultyId === 'object') {
              // Format where facultyId is the actual faculty object with details
              facultyInfo = listing.facultyId;
            } else if (typeof listing.facultyId === 'string') {
              // Format where facultyId is just the ID string
              facultyInfo = {
                _id: listing.facultyId,
                name: listing.professorName || 'Faculty Member',
                university: listing.professorUniversity || 'University',
                department: listing.professorDepartment || 'Department'
              };
            }
          }
          
          console.log('Faculty info formatted as:', facultyInfo);
          console.log('Raw listing ID:', listing._id);
          
          // Create a properly formatted listing object that matches our interface
          const formattedListing: Listing = {
            _id: listing._id || '',
            title: listing.title || 'Untitled Listing',
            description: listing.description || '',
            requirements: listing.requirements || '',
            duration: listing.duration || { value: 0, unit: 'Unknown' },
            wage: {
              type: listing.wage?.type || '',
              value: listing.wage?.amount || 0
            },
            isPaid: listing.wage?.isPaid || false,
            createdAt: listing.createdAt || '',
            userId: listing.facultyId?._id || '',
            professorName: facultyInfo.name || 'Unknown Professor',
            professorUniversity: facultyInfo.university || 'Unknown University',
            professorDepartment: facultyInfo.department || 'Unknown Department'
          };
          
          return {
            listing: formattedListing,
            status: swipe.facultyAccepted === null ? 'pending' : 
                   swipe.facultyAccepted ? 'accepted' : 'rejected',
            date: swipe.createdAt ? new Date(swipe.createdAt).toLocaleDateString() : 'Unknown date',
            swipeId: swipe._id,
            interested: swipe.interested === true
          };
        }).filter(Boolean) as SwipeItem[]; // Remove null entries and assert as SwipeItem[]
        
        console.log(`Formatted ${formattedSwipes.length} valid swipe history records`);
        
        // Debug logging of first item to check structure
        if (formattedSwipes.length > 0) {
          console.log('First formatted swipe item:', JSON.stringify({
            swipeId: formattedSwipes[0].swipeId,
            status: formattedSwipes[0].status,
            listingId: formattedSwipes[0].listing._id
          }));
        }
        
        setSwipes(formattedSwipes);
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        
        if (apiError.response) {
          // Server responded with an error status code
          console.error('Response status:', apiError.response.status);
          console.error('Response data:', apiError.response.data);
          
          if (apiError.response.status === 401) {
            Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
            navigation.navigate('AuthLogin');
            return;
          }
        } else if (apiError.request) {
          // Request was made but no response received (network error)
          console.error('No response received:', apiError.request);
          Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection.');
        } else {
          // Error setting up the request
          console.error('Request setup error:', apiError.message);
          Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
        }
        
        setSwipes([]);
      }
    } catch (error) {
      console.error('Error in fetchSwipeHistory:', error);
      Alert.alert('Error', 'Failed to fetch swipe history. Please try again.');
      setSwipes([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSwipes = () => {
    // If 'all' is selected, return all swipes
    if (activeFilters.includes('all')) {
      return swipes;
    }

    // Filter swipes based on multiple selected criteria
    return swipes.filter(swipe => {
      // Check interest filters
      const interestMatch = 
        (activeFilters.includes('interested') && swipe.interested) || 
        (activeFilters.includes('not-interested') && !swipe.interested);
      
      // Check status filters
      const statusMatch = activeFilters.includes(swipe.status);
      
      // If either interest or status filters are active, check their match
      const hasInterestFilters = activeFilters.includes('interested') || activeFilters.includes('not-interested');
      const hasStatusFilters = activeFilters.includes('pending') || activeFilters.includes('accepted') || activeFilters.includes('rejected');
      
      if (hasInterestFilters && hasStatusFilters) {
        // If both interest and status filters are active, item must match both
        return interestMatch && statusMatch;
      } else {
        // If only one type of filter is active, item must match that type
        return hasInterestFilters ? interestMatch : statusMatch;
      }
    });
  };

  const toggleFilter = (filter: FilterOption) => {
    if (filter === 'all') {
      // If 'all' is selected, clear other filters
      setActiveFilters(['all']);
    } else {
      // Remove 'all' if it's selected
      const newFilters = activeFilters.filter(f => f !== 'all');
      
      // Toggle the selected filter
      if (newFilters.includes(filter)) {
        // Remove filter if it's already active
        const updatedFilters = newFilters.filter(f => f !== filter);
        
        // If no filters remain, set 'all' as the default
        setActiveFilters(updatedFilters.length > 0 ? updatedFilters : ['all']);
      } else {
        // Add the filter
        setActiveFilters([...newFilters, filter]);
      }
    }
  };

  const getFilterSummary = () => {
    if (activeFilters.includes('all')) {
      return 'All Swipes';
    }
    
    const labels = activeFilters.map(filter => 
      filterOptions.find(option => option.value === filter)?.label
    ).filter(Boolean);
    
    if (labels.length > 2) {
      return `${labels.length} Filters`;
    } else {
      return labels.join(', ');
    }
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
    
    // Handle missing listing data
    if (!item.listing) {
      return (
        <View style={[styles.swipeItem, { backgroundColor }]}>
          <View style={styles.swipeHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={[styles.dateText, { color: textColor }]}>{item.date}</Text>
          </View>
          <Text style={[styles.listingTitle, { color: textColor }]}>
            Listing information unavailable
          </Text>
          <Text style={[styles.emptyText, { color: textColor, textAlign: 'left', marginTop: 10 }]}>
            This listing may have been removed or is no longer available.
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.swipeItem, { backgroundColor }]}>
        <View style={styles.swipeHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <View style={[
            styles.interestIndicator, 
            { backgroundColor: item.interested ? '#2ecc71' : '#e74c3c' }
          ]}>
            <Text style={styles.statusText}>
              {item.interested ? 'INTERESTED' : 'NOT INTERESTED'}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: textColor }]}>{item.date}</Text>
        </View>
        
        <Text style={[styles.listingTitle, { color: textColor }]}>
          {item.listing.title || 'Untitled Listing'}
        </Text>
        
        <View style={styles.listingDetails}>
          <Text style={[styles.professorName, { color: textColor }]}>
            Professor: {item.listing.professorName || 'Not specified'}
          </Text>
          <Text style={[styles.universityText, { color: textColor }]}>
            {item.listing.professorUniversity || 'University'} - {item.listing.professorDepartment || 'Department'}
          </Text>
          
          <View style={styles.listingStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Duration:</Text>
              <Text style={[styles.statValue, { color: textColor }]}>
                {item.listing.duration && typeof item.listing.duration === 'object' 
                  ? `${item.listing.duration.value || 0} ${item.listing.duration.unit || 'units'}`
                  : 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Compensation:</Text>
              <Text style={[styles.statValue, { color: textColor }]}>
                {item.listing.isPaid && item.listing.wage && typeof item.listing.wage === 'object'
                  ? `${item.listing.wage.value || 0} ${item.listing.wage.type || ''}`
                  : 'Unpaid'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => {
            console.log('Attempting to view listing with ID:', item.listing._id);
            if (!item.listing._id) {
              console.error('No listing ID available, cannot navigate');
              Alert.alert('Error', 'Unable to view this listing. The listing ID is missing.');
              return;
            }
            
            try {
              navigation.navigate('ListingDetail', { 
                listingId: item.listing._id,
                listingData: item.listing,
                currentInterest: item.interested,
                swipeId: item.swipeId
              });
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert(
                'Navigation Error',
                'Unable to view listing details. Would you like to try refreshing the data?',
                [
                  { 
                    text: 'Cancel', 
                    style: 'cancel' 
                  },
                  {
                    text: 'Refresh', 
                    onPress: () => {
                      fetchSwipeHistory();
                    }
                  }
                ]
              );
            }
          }}
        >
          <Text style={styles.viewButtonText}>View Listing</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: textColor }]}>
        {activeFilters.includes('all') ? 
          'You haven\'t swiped on any listings yet.' : 
          `No ${getFilterSummary()} swipes found.`}
      </Text>
      
      <View style={styles.emptyButtonsContainer}>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('SwipeCards')}
        >
          <Text style={styles.browseButtonText}>Browse Listings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.browseButton, styles.retryButton]}
          onPress={fetchSwipeHistory}
        >
          <Text style={styles.browseButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSwipeHistory();
    setRefreshing(false);
  };

  const renderFilterModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Filter Swipes</Text>
            
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  activeFilters.includes(option.value) && styles.selectedFilterOption
                ]}
                onPress={() => toggleFilter(option.value)}
              >
                <View style={[
                  styles.checkmark,
                  activeFilters.includes(option.value) && styles.selectedCheckmark
                ]}>
                  {activeFilters.includes(option.value) && (
                    <Text style={styles.checkmarkText}>✓</Text>
                  )}
                </View>
                <Text 
                  style={[
                    styles.filterOptionText, 
                    activeFilters.includes(option.value) && styles.selectedFilterOptionText,
                    { color: textColor }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setActiveFilters(['all']);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <ResponsiveScreen navigation={navigation} scrollable={false}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Your Swipe History</Text>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              {getFilterSummary()}
            </Text>
            <Text style={styles.filterButtonIcon}>▼</Text>
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#893030']}
                tintColor={theme === 'light' ? '#893030' : '#ffffff'}
              />
            }
          />
        )}
        
        {renderFilterModal()}
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
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#893030',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  filterButtonIcon: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
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
    marginLeft: 'auto',
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
  emptyButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#555',
  },
  interestIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedFilterOption: {
    backgroundColor: 'rgba(137, 48, 48, 0.1)',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#893030',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    backgroundColor: '#893030',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterOptionText: {
    fontSize: 16,
  },
  selectedFilterOptionText: {
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#893030',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StudentSwipeHistory; 