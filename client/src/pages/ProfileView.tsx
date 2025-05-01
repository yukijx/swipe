// Keep the imports as-is
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { getBackendURL } from '../utils/network';
import { ScrollView } from 'react-native';

interface ProfileField {
  key: string;
  label: string;
  multiline?: boolean;
}

const studentFields: ProfileField[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'university', label: 'University' },
  { key: 'major', label: 'Major' },
  { key: 'experience', label: 'Experience', multiline: true },
  { key: 'skills', label: 'Skills', multiline: true },
  { key: 'projects', label: 'Projects', multiline: true },
  { key: 'certifications', label: 'Certifications', multiline: true },
  { key: 'resumeText', label: 'Resume Text', multiline: true }
];

const professorFields: ProfileField[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'university', label: 'University' },
  { key: 'department', label: 'Department' },
  { key: 'researchInterests', label: 'Research Interests', multiline: true },
  { key: 'biography', label: 'Biography', multiline: true },
  { key: 'publications', label: 'Publications', multiline: true },
  { key: 'officeHours', label: 'Office Hours' },
  { key: 'contactInfo', label: 'Contact Information' }
];

const ProfileView = ({ navigation, route }: { navigation: any, route: any }) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuthContext();

  // Themed variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
  const placeholderTextColor = theme === 'light' ? '#666' : '#bbb';
  const borderColor = theme === 'light' ? '#ddd' : '#000';
  const buttonColor = '#893030';
  const buttonTextColor = '#ffffff';


  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const viewingStudentId = route.params?.studentId;
  const viewingOtherProfile = viewingStudentId && isFaculty;
  const profileTitle = profileData.name
  ? `${profileData.name}`
  : (viewingOtherProfile ? 'Student Profile' : isFaculty ? 'Faculty Profile' : 'Student Profile');

  useEffect(() => {
    fetchProfile();
  }, [viewingStudentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again');
        navigation.navigate('AuthLogin');
        return;
      }

      const backendURL = await getBackendURL();
      const endpoint = viewingOtherProfile
        ? `${backendURL}/user/${viewingStudentId}`
        : `${backendURL}/user/profile`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData(response.data);
      if (response.data.profileImage?.data && response.data.profileImage?.contentType) {
        setProfileImage(`data:${response.data.profileImage.contentType};base64,${response.data.profileImage.data}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch profile';
      Alert.alert('Error', errorMessage);

      if (error.response?.status === 404 || error.response?.status === 401) {
        if (!isFaculty && !viewingOtherProfile) {
          Alert.alert('Profile Incomplete', 'Your profile is incomplete. Would you like to set it up now?', [
            { text: 'Yes', onPress: () => navigation.navigate('ProfileSetupStudent') },
            { text: 'No', style: 'cancel' }
          ]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProfileImage = () => (
    <View style={[styles.imageContainer,{borderColor:borderColor}]}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={[styles.profileImage,{ backgroundColor: inputBackground, borderColor }]} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: inputBackground, borderColor }]}>
          <Text style={styles.imagePlaceholderText}>No Photo</Text>
        </View>
      )}
    </View>
  );

  const renderField = ({ key, label }: ProfileField) => (
    <View key={key} style={styles.label2}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.fieldContainer, { backgroundColor: inputBackground, borderColor }]}>
        <Text style={[styles.value, { color: placeholderTextColor }]}>
          {profileData[key] || '—'}
        </Text>
      </View>
    </View>
  );
  const fields = viewingOtherProfile ? studentFields : (isFaculty ? professorFields : studentFields);

  const contactStudent = () => {
    if (profileData.email) {
      Linking.openURL(`mailto:${profileData.email}?subject=Research Opportunity Interest`);
    } else {
      Alert.alert('Error', 'No email address available for this student.');
    }
  };

  if (loading) {
    return (
      <ResponsiveScreen navigation={navigation}>
        <View style={[styles.container, styles.loadingContainer, { backgroundColor, borderColor }]}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      </ResponsiveScreen>
    );
  }

  return (
    <ResponsiveScreen navigation={navigation}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>{profileTitle}</Text>
        {renderProfileImage()}
        
        <View style={[styles.formContainer, { borderColor }]}>
          {fields.map(renderField)}
        </View>
  
        {/* Faculty viewing a student: show Contact button */}
        {viewingOtherProfile && isFaculty && (
          <View style={styles.contactButtonContainer}>
            <TouchableOpacity style={styles.contactButton} onPress={contactStudent}>
              <Text style={styles.contactButtonText}>Contact Student</Text>
            </TouchableOpacity>
          </View>
        )}
  
        {/* User viewing their own profile: show Edit button */}
        {!viewingOtherProfile && (
          <View style={styles.editButtonContainer}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: buttonColor }]}
              onPress={() => navigation.navigate('ProfileManagement')}
            >
              <Text style={[styles.editButtonText, { color: buttonTextColor }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ResponsiveScreen>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    padding: 15,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    gap: 15,
  },
  fieldContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  label2: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  value: {
    fontSize: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    borderColor: '#000',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  contactButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  contactButton: {
    backgroundColor: '#893030',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 40, // ensures spacing at bottom for scroll
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default ProfileView;
