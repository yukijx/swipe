import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '../context/AuthContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import * as ImagePicker from 'expo-image-picker';
import { getBackendURL } from '../utils/network';

interface ProfileField {
    key: string;
    label: string;
    multiline?: boolean;
}

const studentFields: ProfileField[] = [
    { key: 'name', label: 'Name' },
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
    { key: 'university', label: 'University' },
    { key: 'department', label: 'Department' },
    { key: 'researchInterests', label: 'Research Interests', multiline: true },
    { key: 'biography', label: 'Biography', multiline: true },
    { key: 'publications', label: 'Publications', multiline: true },
    { key: 'officeHours', label: 'Office Hours' },
    { key: 'contactInfo', label: 'Contact Information' }
];

const ProfileManagement = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [profileData, setProfileData] = useState<Record<string, string>>({});
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const backendURL = await getBackendURL();
            const response = await axios.get(
                `${backendURL}/user/profile`,
                { headers: { Authorization: token } }
            );
            setProfileData(response.data);
            if (response.data.profileImage?.data && response.data.profileImage?.contentType) {
                setProfileImage(`data:${response.data.profileImage.contentType};base64,${response.data.profileImage.data}`);
            }              
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to fetch profile');
        }
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const backendURL = await getBackendURL();
            await axios.put(
                `${backendURL}/user/profile`,
                profileData,
                { headers: { Authorization: token } }
            );
            Alert.alert('Success', 'Profile updated successfully', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        // Navigate to appropriate dashboard based on user type
                        navigation.navigate(isFaculty ? 'HomeFaculty' : 'HomeStudent');
                    } 
                }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleChange = (key: string, value: string) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };
    useEffect(() => {
        (async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your media library to upload profile pictures.');
          }
        })();
      
        fetchProfile();
      }, []);      
      
      const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
          base64: true,
        });
      
        if (result.canceled || !result.assets || !result.assets[0]?.base64) {
          Alert.alert('No image selected');
          return;
        }
      
        try {
          const token = await AsyncStorage.getItem('token');
      
          // Properly await the async getBackendURL call
          const backendURL = await getBackendURL();
          const uploadRes = await fetch(`${backendURL}/user/profile/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token || '',
            },
            body: JSON.stringify({
              base64Image: result.assets[0].base64,
              contentType: 'image/jpeg',
            }),
          });
      
          const resText = await uploadRes.text();
      
          try {
            const data = JSON.parse(resText);
      
            if (data?.profileImage?.data) {
              setProfileImage(`data:${data.profileImage.contentType};base64,${data.profileImage.data}`);
            } else {
              Alert.alert('Upload failed', 'No image returned');
            }
          } catch (parseError) {
            console.error('Failed to parse image upload response:', resText);
            Alert.alert('Upload failed', 'Server error or invalid response');
          }
        } catch (error) {
          console.error('Upload error:', error);
          console.error('Error uploading image:', error);
          Alert.alert('Upload Error', 'Failed to upload image');
        }
    };
      
      
      
      
      
    const handleWebImageUpload = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;
      
        const formData = new FormData();
        formData.append('profileImage', file);  // File is already a Blob
      
        try {
          const token = await AsyncStorage.getItem('token');
          // Properly await the async getBackendURL call
          const backendURL = await getBackendURL();
          const res = await fetch(`${backendURL}/user/profile/image`, {
            method: 'POST',
            headers: {
              Authorization: token || '', // Don't add Content-Type here; let fetch set it
            },
            body: formData,
          });
      
          const data = await res.json();
          if (data?.profileImage?.url) {
            setProfileImage(data.profileImage.url);
          } else {
            Alert.alert('Upload Error', 'No image URL returned from server');
          }
        } catch (error) {
          console.error('Error uploading web image:', error);
          Alert.alert('Upload Failed', 'Something went wrong while uploading');
        }
    };
      
    const renderProfileImage = () => (
        <View style={styles.imageContainer}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'web') {
                document.getElementById('fileInput')?.click();
              } else {
                pickImage();  // Use native picker
              }
            }}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
      
          {Platform.OS === 'web' && (
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleWebImageUpload}
            />
          )}
        </View>
    );
      
    const renderField = ({ key, label, multiline }: ProfileField) => (
        <View key={key} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {Platform.OS === 'web' ? (
                <textarea
                    style={{
                        ...styles.input,
                        ...(multiline && styles.multiline),
                        backgroundColor: theme === 'light' ? '#ffffff' : '#333',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 14,
                        width: '100%',
                        fontFamily: 'inherit',
                    }}
                    value={profileData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    rows={multiline ? 4 : 1}
                />
            ) : (
                <TextInput
                    style={[ 
                        styles.input,
                        multiline && styles.multiline,
                        { backgroundColor: theme === 'light' ? '#ffffff' : '#333' }
                    ]}
                    value={profileData[key] || ''}
                    onChangeText={(text) => handleChange(key, text)}
                    multiline={multiline}
                    placeholderTextColor={theme === 'light' ? '#666' : '#999'}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}
        </View>
    );

    const fields = isFaculty ? professorFields : studentFields;

    return (
        <ResponsiveScreen navigation={navigation}>
        <View style={styles.container}>
            <Text style={[styles.title, { color: textColor }]}>
            {isFaculty ? 'Faculty Profile' : 'Student Profile'}
            </Text>

            {/* Group Save and View buttons together */}
            <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ProfileView')}>
                <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>
            </View>

            {renderProfileImage()}

            <View style={styles.formContainer}>
            {fields.map(renderField)}
            </View>
        </View>
        </ResponsiveScreen>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        gap: 20,
    },
    fieldContainer: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    input: Platform.OS === 'web' ? {} : {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    multiline: {
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
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonGroup: {
        gap: 12,
        marginBottom: 20,
      },
      viewButton: {
        borderWidth: 1,
        borderColor: '#893030',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'transparent',
      },
      viewButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#893030',
      },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    imagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#666',
        fontSize: 16,
    }
});

export default ProfileManagement;
