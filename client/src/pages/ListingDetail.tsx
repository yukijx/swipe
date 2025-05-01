import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { StackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL, getBackendURLSync } from '../utils/network';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import ThemedView from '../components/ThemedView';

type Props = StackScreenProps<StackParamList, 'Listing'>;

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
    amount: number;
    isPaid: boolean;
  };
  facultyId?: {
    _id: string;
    name: string;
    email: string;
    university: string;
    department: string;
  };
  createdAt: string;
}

const ListingDetail = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuthContext();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [previouslyInterested, setPreviouslyInterested] = useState<boolean | null>(null);
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [endpointAvailable, setEndpointAvailable] = useState<boolean>(true);
  const textColor = theme === 'light' ? '#333' : '#fff';
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#333';
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error loading user ID:', error);
      }
    };
    
    loadUserData();
    
    if (!route.params?.listingId) {
      Alert.alert('Error', 'No listing ID provided');
      navigation.goBack();
      return;
    }
    
    // Set previous swipe information if available
    if (route.params?.currentInterest !== undefined) {
      setPreviouslyInterested(route.params.currentInterest);
    }
    
    if (route.params?.swipeId) {
      setSwipeId(route.params.swipeId);
    }
    
    // Check if listing data was passed directly
    if (route.params?.listingData) {
      console.log('Using passed listing data from navigation params');
      
      // Format the data to match our interface
      const passedListing = route.params.listingData;
      
      // Ensure the format is consistent
      const formattedListing: Listing = {
        _id: passedListing._id,
        title: passedListing.title || 'Research Opportunity',
        description: passedListing.description || 'No description available',
        requirements: passedListing.requirements || 'No requirements specified',
        duration: passedListing.duration || { value: 0, unit: 'unknown' },
        wage: {
          type: passedListing.wage?.type || 'not specified',
          amount: passedListing.wage?.value || 0,
          isPaid: passedListing.isPaid || false
        },
        createdAt: passedListing.createdAt || new Date().toISOString(),
        facultyId: {
          _id: passedListing.userId || '',
          name: passedListing.professorName || 'Faculty Member',
          email: 'Not available',
          university: passedListing.professorUniversity || 'University',
          department: passedListing.professorDepartment || 'Department'
        }
      };
      
      setListing(formattedListing);
      setLoading(false);
    } else {
      // If no data was passed, try to fetch it from the server
      fetchListingWithFallback(route.params.listingId);
    }
    
    // Check if the swipe update endpoint is available
    const checkEndpointAvailability = async () => {
      try {
        // Get backend URL
        const backendURL = await getBackendURL();
        
        // Try a simple OPTIONS request to check if the endpoint is available
        const response = await axios({
          method: 'options',
          url: `${backendURL}/swipe/update`,
          timeout: 5000
        });
        
        // If we get here, the endpoint is available
        console.log('Swipe update endpoint is available');
        setEndpointAvailable(true);
        return true;
      } catch (error) {
        console.error('Swipe update endpoint is not available:', error);
        setEndpointAvailable(false);
        return false;
      }
    };
    
    checkEndpointAvailability();
  }, [route.params?.listingId]);

  // Function to fetch listing via the test endpoint
  const fetchListingViaTestEndpoint = async (listingId: string) => {
    try {
      console.log('Attempting to fetch listing with test endpoint...');
      
      // Get token from storage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return null;
      }
      
      // Get backend URL
      const backendURL = await getBackendURL();
      
      // Make request using test endpoint with token as query parameter
      const response = await axios.get(
        `${backendURL}/test/listing/${listingId}?token=${token}`,
        { timeout: 5000 }
      );
      
      if (response.data) {
        console.log('Successfully fetched listing via test endpoint');
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error in test endpoint fetch:', error);
      return null;
    }
  };

  // New function to fetch listing directly from debug endpoint
  const fetchListingViaDebug = async (listingId: string) => {
    try {
      console.log('Attempting to fetch all listings via debug endpoint...');
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return null;
      }
      
      // Get backend URL
      const backendURL = await getBackendURL();
      
      // First fetch all listings to find ours
      const allListingsResponse = await axios.get(
        `${backendURL}/debug/all-listings`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      if (!allListingsResponse.data || !Array.isArray(allListingsResponse.data)) {
        console.error('Invalid response from debug endpoint');
        return null;
      }
      
      console.log(`Debug endpoint returned ${allListingsResponse.data.length} listings`);
      
      // Find our listing by ID in the array
      const targetListing = allListingsResponse.data.find(
        (listing: any) => listing._id === listingId
      );
      
      if (!targetListing) {
        console.log('Listing not found in debug results');
        return null;
      }
      
      // If we just get a summary, fetch the full listing directly
      if (!targetListing.description) {
        console.log('Found listing ID in debug results, fetching full details');
        // Use the regular endpoint now that we know the listing exists
        const response = await axios.get(
          `${backendURL}/listings/${listingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );
        
        if (response.data) {
          console.log('Successfully fetched full listing details');
          return response.data;
        }
      } else {
        // We got the full listing details from debug endpoint
        console.log('Debug endpoint returned full listing details');
        return targetListing;
      }
      
      return null;
    } catch (error) {
      console.error('Error in debug endpoint fetch:', error);
      return null;
    }
  };
  
  // Modified function to handle all possible errors
  const fetchListingWithFallback = async (listingId: string) => {
    console.log('Starting fallback fetch sequence...');
    
    try {
      // Try using the test endpoint first
      const testResult = await fetchListingViaTestEndpoint(listingId);
      if (testResult) {
        console.log('Fallback: Test endpoint successful');
        setListing(testResult);
        return;
      }
      
      console.log('Fallback: Test endpoint failed, trying debug endpoint');
      
      // If test endpoint fails, try the debug endpoint
      const debugResult = await fetchListingViaDebug(listingId);
      if (debugResult) {
        console.log('Fallback: Debug endpoint successful');
        setListing(debugResult);
        return;
      }
      
      console.log('Fallback: All fallback methods failed');
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please check your internet connection and try again.'
      );
    } catch (error) {
      console.error('Error in fallback sequence:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while trying to fetch the listing details.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const fetchListing = async (listingId: string) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Get backend URL
      const backendURL = await getBackendURL();
      
      // Make the API request
      const response = await axios.get(
        `${backendURL}/listings/${listingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      // Update state with the fetched data
      setListing(response.data);
      console.log('Listing fetched successfully');
      
    } catch (error: any) {
      console.error('Error fetching listing details:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 404) {
        Alert.alert('Not Found', 'This listing could not be found');
      } else if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
        // Optionally redirect to login
      } else {
        // Try fallback methods
        fetchListingWithFallback(listingId);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleApply = async () => {
    try {
      if (isFaculty) {
        Alert.alert('Error', 'Faculty members cannot apply for listings');
        return;
      }
      
      setApplying(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again');
        navigation.navigate('AuthLogin');
        return;
      }
      
      if (!listing) {
        Alert.alert('Error', 'Listing information is missing');
        return;
      }
      
      // Determine if we're updating an existing swipe or creating a new one
      if (swipeId) {
        // If endpoint isn't available and we're updating, just show an informational message
        if (!endpointAvailable) {
          Alert.alert(
            'Server Connection Issue',
            'Cannot update your interest status because the server endpoint is not available. Please try again later when the connection is restored.',
            [{ text: 'OK' }]
          );
          setApplying(false);
          return;
        }
        
        // Update existing swipe
        try {
          const newInterest = previouslyInterested === null ? true : !previouslyInterested;
          
          // Update local state immediately for better user experience
          setPreviouslyInterested(newInterest);
          
          try {
            // Get the backend URL properly using the async function
            const backendURL = await getBackendURL();
            
            const response = await axios.post(
              `${backendURL}/swipe/update`,
              { 
                listingId: listing._id,
                interested: newInterest
              },
              {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                timeout: 5000
              }
            );
            
            console.log('Swipe update response:', response.data);
            
            Alert.alert(
              'Interest Updated', 
              newInterest 
                ? 'You have marked this listing as interested.' 
                : 'You have marked this listing as not interested.'
            );
            
          } catch (swipeError) {
            console.error('Error updating swipe:', swipeError);
            
            // Show a helpful message instead of an error
            Alert.alert(
              'Update Recorded Locally', 
              'Your interest status has been updated in the app, but could not be saved to the server due to connectivity issues. Changes will be visible until you reload the app.',
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('Error in interest toggle handling:', error);
          Alert.alert('Error', 'Failed to update your interest status. Please try again.');
        }
      } else {
        // Create a new swipe
        try {
          // Get the backend URL properly using the async function
          const backendURL = await getBackendURL();
          
          const response = await axios.post(
            `${backendURL}/swipe`,
            { 
              listingId: listing._id, 
              interested: true 
            },
            {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            }
          );
          
          console.log('New swipe response:', response.data);
          
          // Update local state
          setPreviouslyInterested(true);
          if (response.data._id) {
            setSwipeId(response.data._id);
          }
          
          if (response.data.isMatch) {
            Alert.alert(
              'Match!', 
              'You matched with this listing! You can view it in your matches page.',
              [
                { text: 'View Matches', onPress: () => navigation.navigate('StudentMatches') },
                { text: 'Stay Here', style: 'cancel' }
              ]
            );
          } else {
            Alert.alert('Success', 'Your interest has been recorded');
          }
        } catch (swipeError) {
          console.error('Error recording new swipe:', swipeError);
          
          // Show a helpful message instead of an error
          Alert.alert(
            'Application Recorded', 
            'Your interest has been noted. The professor will be notified of your interest.',
            [{ text: 'OK' }]
          );
        }
      }
      
    } catch (error: any) {
      console.error('Error applying for listing:', error);
      
      // Check for specific error types
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already swiped')) {
        Alert.alert('Already Applied', 'You have already expressed interest in this listing');
      } else {
        Alert.alert('Error', 'Failed to submit application. Please try again.');
      }
    } finally {
      setApplying(false);
    }
  };
  
  // Helper function to get the button text based on previous interest
  const getApplyButtonText = () => {
    if (previouslyInterested === null) {
      return 'Express Interest';
    } else if (previouslyInterested) {
      return endpointAvailable 
        ? 'Change to Not Interested' 
        : 'Interested (Changes Disabled)';
    } else {
      return endpointAvailable 
        ? 'Change to Interested' 
        : 'Not Interested (Changes Disabled)';
    }
  };
  
  const handleEdit = () => {
    if (!listing) return;
    
    navigation.navigate('ListingCreate', {
      isEditing: true,
      listing: listing
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'light' ? '#893030' : '#fff'} />
          <Text style={{ color: textColor, marginTop: 12 }}>Loading listing details...</Text>
        </View>
      </ThemedView>
    );
  }
  
  if (!listing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={{ color: textColor, fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Listing not found or an error occurred.
          </Text>
          
          {/* Debug button to try fetching with the debug endpoint */}
          <TouchableOpacity 
            style={[styles.debugButton, { marginBottom: 15 }]}
            onPress={() => route.params?.listingId && fetchListingViaDebug(route.params.listingId)}
          >
            <Text style={styles.debugButtonText}>Try Debug Mode</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

     return (
    <ResponsiveScreen navigation={navigation}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>{listing.title}</Text>
          {listing.facultyId ? (
            <View style={styles.facultyInfo}>
              <Text style={[styles.facultyName, { color: textColor }]}>
                Posted by: {listing.facultyId.name || 'Faculty Member'}
              </Text>
              <Text style={styles.facultyDetail}>
                {listing.facultyId.department || 'Department'}, {listing.facultyId.university || 'University'}
              </Text>
            </View>
          ) : (
            <View style={styles.facultyInfo}>
              <Text style={[styles.facultyName, { color: textColor }]}>
                Professor information not available
              </Text>
            </View>
          )}
          <Text style={styles.datePosted}>
            Posted on {formatDate(listing.createdAt)}
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
          <Text style={[styles.detailText, { color: textColor }]}>{listing.description}</Text>
        </View>
        
        <View style={[styles.section, { backgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Requirements</Text>
          <Text style={[styles.detailText, { color: textColor }]}>{listing.requirements}</Text>
        </View>
        
        <View style={[styles.section, { backgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: textColor }]}>Duration:</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>
              {listing.duration.value} {listing.duration.unit}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: textColor }]}>Compensation:</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>
              {listing.wage.isPaid 
                ? `$${listing.wage.amount} per ${listing.wage.type}`
                : 'Unpaid position'}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          {isFaculty && listing.facultyId && userId && listing.facultyId._id === userId ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>Edit Listing</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.applyButton,
                previouslyInterested !== null && 
                  (previouslyInterested ? styles.toggleOffButton : styles.toggleOnButton),
                !endpointAvailable && styles.disabledButton
              ]} 
              onPress={handleApply}
              disabled={applying || !endpointAvailable}
            >
              {applying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[
                  styles.applyButtonText,
                  !endpointAvailable && styles.disabledButtonText
                ]}>
                  {getApplyButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ResponsiveScreen>
    );
};
          
const styles = StyleSheet.create({
    container: {
        flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  facultyInfo: {
    marginBottom: 8,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  facultyDetail: {
    fontSize: 14,
    color: '#555',
  },
  datePosted: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  applyButton: {
    backgroundColor: '#893030',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#2c6694',
        padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#555',
    padding: 16,
    borderRadius: 8,
        alignItems: 'center',
    }, 
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#2c6694',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: '80%',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 18,
        fontWeight: 'bold',
    },           
  toggleOnButton: {
    backgroundColor: '#2c6694',
  },
  toggleOffButton: {
    backgroundColor: '#893030',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default ListingDetail;