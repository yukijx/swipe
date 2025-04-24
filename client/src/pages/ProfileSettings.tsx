import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../hooks/useAuth';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import * as ImagePicker from 'expo-image-picker';

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

const ProfileSettings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [profileData, setProfileData] = useState<Record<string, string>>({});
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/user/profile',
                { headers: { Authorization: token } }
            );
            setProfileData(response.data);
            if (response.data.profileImage?.url) {
                setProfileImage(response.data.profileImage.url);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile');
        }
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/user/profile',
                profileData,
                { headers: { Authorization: token } }
            );
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
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
        });
      
        // This check ensures we actually picked an image
        if (result.canceled || !result.assets || !result.assets[0]?.uri) {
          Alert.alert('No image selected');
          return;
        }
      
        const imageUri = result.assets[0].uri;
      
        try {
          const token = await AsyncStorage.getItem('token');
          const formData = new FormData();
          formData.append('profileImage', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
          } as any);
      
          const uploadRes = await fetch('http://localhost:5000/user/profile/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token || '',
            },
            body: formData,
          });
      
          const data = await uploadRes.json();
      
          if (data?.profileImage?.url) {
            setProfileImage(data.profileImage.url); // show image on screen
          } else {
            Alert.alert('Upload failed', 'No image URL returned');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
        }
      };
      
      const handleWebImageUpload = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;
      
        const formData = new FormData();
        formData.append('profileImage', file);  // File is already a Blob
      
        try {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch('http://localhost:5000/user/profile/image', {
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
          Alert.alert('Upload Failed', 'Something went wrong while uploading');
        }
      };
      
      

      const renderProfileImage = () => (
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => document.getElementById('fileInput')?.click()}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
      
          {/* Hidden input for web uploads */}
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

            <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('StudentInfo')}>
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

export default ProfileSettings;
