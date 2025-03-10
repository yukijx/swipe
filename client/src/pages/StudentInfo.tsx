import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, Linking, Image, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { StackParamList } from '../navigation/types';

type Props = StackScreenProps<StackParamList, 'StudentInfo'>;

const StudentInfo = ({ route, navigation }: { route: any, navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  const [student, setStudent] = useState<{
    name: string;
    email: string;
    university: string;
    major: string;
    experience: string;
    skills: string;
    projects: string;
    certifications: string;
    resumeText: string;
    profileImage: { url: string } | null;
  }>({
    name: '',
    email: '',
    university: '',
    major: '',
    experience: '',
    skills: '',
    projects: '',
    certifications: '',
    resumeText: '',
    profileImage: null, // Ensures proper handling when no profile image is set
  });

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/user/profile',
        { headers: { Authorization: token } }
      );
      setStudent(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch student profile');
    }
  };
  useEffect(() => {
    fetchStudentProfile();
  }, [route.params?.student]);

  const handleUpdateProfilePicture = () => {
    // Navigate to UpdateStudentProfile page, passing current profile picture
    navigation.navigate('UpdateStudentProfile', { student, setStudent });
  };

  return (
    <ScrollView style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, color: textColor, textAlign: 'center', marginBottom: 20 }}>Student Information</Text>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image 
          source={student.profileImage ? { uri: student.profileImage.url} : require('../../../client/assets/images/ProfilePic.png')}
          style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: textColor }}
        />
        <Button title="Change Profile Picture" onPress={handleUpdateProfilePicture} />
      </View>

      <Text style={{ fontSize: 20, color: textColor, marginBottom: 10 }}>Name: {student.name}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>Email: {student.email}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>University: {student.university}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>Major: {student.major}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>Experience: {student.experience}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>Skills: {student.skills}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>Projects: {student.projects}</Text>
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 10 }}>Certifications: {student.certifications}</Text>
      {student.resumeText && (
        <Text style={{ fontSize: 16, color: textColor, marginBottom: 20 }}>Resume Text: {student.resumeText}</Text>
      )}
      
      <Button 
        title="Edit Profile" 
        color="#893030" 
        onPress={() => navigation.navigate('ProfileSettings')} 
      />
      <Button 
        title="Back" 
        color="#893030" 
        onPress={() => navigation.goBack()} 
      />
    </ScrollView>
  );
};

export default StudentInfo;