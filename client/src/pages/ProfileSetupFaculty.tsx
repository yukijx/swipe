//This is the page the faculty views when creating their profile

// React Natvie imports
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SetupScreen from '../components/SetupScreen';
import { getBackendURL } from '../utils/network';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Type for the faculty profile fields
interface ProfessorProfile {
  university: string;
  department: string;
  researchInterests: string;
  biography: string;
  publications: string;
  officeHours: string;
  contactInfo: string;
}

// Only validate required fields
interface ValidationErrors {
  university?: string;
  department?: string;
}

const ProfileSetupFaculty = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();

  // Themed styling variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
  const placeholderTextColor = theme === 'light' ? '#666' : '#bbb';
  const borderColor = theme === 'light' ? '#ddd' : '#000';

  // Component state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [profile, setProfile] = useState<ProfessorProfile>({
    university: '',
    department: '',
    researchInterests: '',
    biography: '',
    publications: '',
    officeHours: '',
    contactInfo: ''
  });

  // Image selection and upload handler
  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
        return;
      }

      setIsImageUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsImageUploading(false);
        return;
      }

      const selectedImage = result.assets[0];
      const formData = new FormData();
      formData.append('profileImage', {
        uri: selectedImage.uri,
        name: 'profile-image.jpg',
        type: 'image/jpeg',
      } as any);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You are not logged in');
        navigation.navigate('AuthLogin');
        return;
      }

      const response = await axios.post(
        `${getBackendURL()}/user/profile/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setProfileImage(response.data.profileImage.url);
      Alert.alert('Success', 'Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile image');
    } finally {
      setIsImageUploading(false);
    }
  };

  // Submit the full profile to the backend
  const handleSubmit = async () => {
    console.log('Complete Setup button clicked');
    
    if (!validateForm()) {
        console.log('Form validation failed - required fields missing');
        Alert.alert('Error', 'Please fill in all required fields');
        return;
    }

    console.log('Form validation passed, proceeding with submission');
    
    try {
        setIsSubmitting(true);
        console.log('Checking for authentication token');
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            console.log('No token found, redirecting to Login');
            // Navigate directly without alert
            goToLogin();
            return;
        }
        
        console.log('Token found:', token.substring(0, 10) + '...');
        console.log('Submitting professor profile data...');
        console.log('Backend URL:', getBackendURL());
        
        console.log('Making API request to /user/setup');
        const response = await axios.post(
            `${getBackendURL()}/user/setup`, 
            profile,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Server response received:', response.status);
        
        // Clear token
        console.log('Clearing authentication token');
        await AsyncStorage.removeItem('token');
        
        // Navigate directly without alert
        console.log('Navigating directly to Login');
        goToLogin();
        
    } catch (error: any) {
        console.error('Error saving profile:', error);
        console.log('Error occurred during profile submission');
        
        // Navigate directly without alert even on error
        console.log('Error occurred, but still navigating to Login');
        await AsyncStorage.removeItem('token');
        goToLogin();
        
    } finally {
        setIsSubmitting(false);
    }
};

// Function to go directly to login page with the most reliable method
const goToLogin = () => {
    console.log('Force navigating to Login using reset');
    // Use the most direct and forceful navigation method
    navigation.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [{ name: 'AuthLogin' }],
        })
    );
};

  // Validate required fields only
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!profile.university.trim()) newErrors.university = 'University is required';
    if (!profile.department.trim()) newErrors.department = 'Department is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleTextChange = (field: keyof ProfessorProfile, value: string) => {
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <SetupScreen navigation={navigation} contentContainerStyle={[styles.contentContainer, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Create Profile</Text>
        <Text style={[styles.subtitle, { color: placeholderTextColor }]}>Fill in the details below</Text>

        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: inputBackground, borderColor }]}>
              <Text style={{ color: placeholderTextColor, fontSize: 16 }}>Add Photo</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={handleImageUpload}
            disabled={isImageUploading}
          >
            {isImageUploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.imageUploadButtonText}>
                {profileImage ? 'Change Profile Picture' : 'Upload Profile Picture'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {[...Object.entries(profile)].map(([key, value]) => {
            const field = key as keyof ProfessorProfile;
            const isRequired = field === 'university' || field === 'department';
            const lines = field === 'biography' ? 5 : field === 'publications' ? 4 : field === 'researchInterests' ? 3 : undefined;
            return (
              <View key={field} style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}> {field.charAt(0).toUpperCase() + field.slice(1)} {isRequired && <Text style={styles.required}>*</Text>}</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBackground, color: inputTextColor, borderColor },
                    lines ? styles.multilineInput : null,
                    isRequired && errors[field as keyof ValidationErrors] ? styles.inputError : null
                  ]}
                  placeholder={`e.g., ${field}`}
                  placeholderTextColor={placeholderTextColor}
                  multiline={!!lines}
                  numberOfLines={lines}
                  value={profile[field]}
                  onChangeText={(text) => handleTextChange(field, text)}
                />
                {isRequired && errors[field as keyof ValidationErrors] && (
                  <Text style={styles.errorText}>{errors[field as keyof ValidationErrors]}</Text>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting ? styles.disabledButton : null]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </SetupScreen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    padding: 12,
  },
  imageUploadButton: {
    backgroundColor: '#893030',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  imageUploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#893030',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 14,
  },
});

export default ProfileSetupFaculty;
