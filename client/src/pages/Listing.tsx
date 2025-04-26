import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { StackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL } from '../utils/network';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth';
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

const ListingDetail: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuth();
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
    
    fetchListing(route.params.listingId);
  }, [route.params?.listingId]);
  
  const fetchListing = async (listingId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again');
        navigation.navigate('Login');
        return;
      }
      
      console.log(`Fetching listing with ID: ${listingId}`);
      
      const response = await axios.get(
        `${getBackendURL()}/listings/${listingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Listing data received:', JSON.stringify(response.data, null, 2));
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
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
        navigation.navigate('Login');
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
            { text: 'View Matches', onPress: () => navigation.navigate('Matches') },
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
    
    navigation.navigate('CreateListing', {
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
          <Text style={{ color: textColor, fontSize: 18, textAlign: 'center' }}>
            Listing not found or an error occurred.
          </Text>
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
});

export default ListingDetail;