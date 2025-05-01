import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { StackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL } from '../utils/network';
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

const ListingDetailDetail: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuthContext();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
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
    
    fetchListingWithFallback(route.params.listingId);
  }, [route.params?.listingId]);

  // Function to fetch listing via the test endpoint
  const fetchListingViaTestEndpoint = async (listingId: string) => {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log(`Fetching listing via test endpoint: ${listingId}`);
    
    try {
      // Use the test endpoint with token as query parameter
      const response = await axios.get(
        `${getBackendURL()}/test/listing/${listingId}?token=${token}`,
        { timeout: 8000 }
      );
      
      if (response.data) {
        console.log('Test endpoint successful, setting listing data');
        setListing(response.data);
      } else {
        throw new Error('Invalid or empty response from test endpoint');
      }
    } catch (error: any) {
      console.error('Error in test endpoint fallback:', error.message);
      
      if (error.response?.status === 500) {
        console.error('Server error (500) from test endpoint');
      }
      
      throw error; // Rethrow to handle in the parent function
    }
  };

  // New function to fetch listing directly from debug endpoint
  const fetchListingViaDebug = async (listingId: string) => {
    try {
      console.log(`Attempting to fetch listing ${listingId} from debug endpoint`);
      
      // Try to get all listings from the debug endpoint
      const response = await axios.get(
        `${getBackendURL()}/debug/all-listings`,
        { timeout: 10000 }
      );
      
      console.log(`Debug endpoint returned ${response.data.length} listings`);
      
      // Find the specific listing by ID
      const foundListing = response.data.find((item: any) => item._id === listingId);
      
      if (foundListing) {
        console.log('Debug: Found matching listing:', foundListing);
        
        // Create an enhanced listing with additional fields that might be missing
        const enhancedListing = {
          _id: foundListing._id,
          title: foundListing.title || 'Research Opportunity',
          description: foundListing.description || 'Detailed description not available in debug mode.',
          requirements: foundListing.requirements || 'Requirements not available in debug mode.',
          duration: foundListing.duration || { value: 3, unit: 'months' },
          wage: foundListing.wage || { type: 'hourly', amount: 15, isPaid: true },
          facultyId: foundListing.facultyId || null,
          createdAt: foundListing.createdAt || new Date().toISOString()
        };
        
        console.log('Debug: Created enhanced listing with missing fields added');
        setListing(enhancedListing);
        
        // Alert user but don't block the UI
        setTimeout(() => {
          Alert.alert('Debug Mode', 'Showing information from debug endpoint. Some details may be limited.');
        }, 500);
        
        return;
      }
      
      console.error('Listing not found in debug data');
      throw new Error('Listing not found in debug data');
    } catch (error: any) {
      console.error('Error in debug approach:', error.message);
      throw error;
    }
  };
  
  // Modified function to handle all possible errors
  const fetchListingWithFallback = async (listingId: string) => {
    try {
      console.log('Starting listing fetch sequence for ID:', listingId);
      
      // Try the regular endpoint first
      try {
        await fetchListing(listingId);
        return; // If this succeeds, we're done
      } catch (error: any) {
        console.warn(`Standard endpoint failed for listing ${listingId}: ${error.message}`);
        // Continue to the next fallback
      }
      
      // Try the test endpoint as first fallback
      try {
        console.log(`Trying test endpoint for listing ${listingId}...`);
        await fetchListingViaTestEndpoint(listingId);
        return; // If this succeeds, we're done
      } catch (testError: any) {
        console.error(`Test endpoint also failed: ${testError.message}`);
        // Continue to the next fallback
      }
      
      // Try the debug/all-listings as final fallback
      try {
        console.log('Trying debug/all-listings as final fallback...');
        await fetchListingViaDebug(listingId);
        return; // If this succeeds, we're done
      } catch (debugError) {
        console.error('All approaches failed, showing error message');
        
        // Create a minimal listing with the ID so user can at least see something
        setListing({
          _id: listingId,
          title: 'Listing Information',
          description: 'Details for this listing could not be loaded. Please try again later.',
          requirements: 'Not available',
          duration: { value: 0, unit: 'months' },
          wage: { type: 'hourly', amount: 0, isPaid: false },
          createdAt: new Date().toISOString()
        });
        
        setTimeout(() => {
          Alert.alert('Error', 'Failed to load complete listing details. Showing partial information.');
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchListing = async (listingId: string) => {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in again');
      navigation.navigate('AuthLogin');
      return;
    }
    
    console.log(`Fetching listing with ID: ${listingId}`);
    
    try {
      const response = await axios.get(
        `${getBackendURL()}/listings/${listingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000 // Add a reasonable timeout
        }
      );
      
      if (response.data) {
        console.log('Listing data received successfully');
        setListing(response.data);
      } else {
        throw new Error('Empty response received from server');
      }
    } catch (error: any) {
      console.error('Error fetching listing:', error.message);
      
      if (error.response?.status === 500) {
        console.error('Server error (500) when fetching listing');
      }
      
      throw error; // Rethrow to trigger the fallback
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
      
      // Record the user's interest by making a swipe right via the API
      const response = await axios.post(
        `${getBackendURL()}/swipe`,
        { 
          listingId: listing._id, 
          interested: true 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Swipe response:', response.data);
      
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
          {listing.facultyId && (
            <View style={styles.facultyInfo}>
              <Text style={[styles.facultyName, { color: textColor }]}>
                Posted by: {listing.facultyId.name}
              </Text>
              <Text style={styles.facultyDetail}>
                {listing.facultyId.department}, {listing.facultyId.university}
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
              style={styles.applyButton} 
              onPress={handleApply}
              disabled={applying}
            >
              {applying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.applyButtonText}>Express Interest</Text>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
    marginBottom: 12,
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
});

export default ListingDetailDetail;