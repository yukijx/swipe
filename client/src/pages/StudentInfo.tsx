import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, Linking, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const StudentInfo = ({ route, navigation }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  const [student, setStudent] = useState(route.params?.student || {
    name: 'Ryan Williams',
    email: 'ryan.williams@ou.edu',
    university: 'University of Oklahoma',
    major: 'Computer Science',
    experience: 'Intern at Google, TA at OU',
    skills: 'React Native, Python, Machine Learning',
    projects: 'Swipe App, AI Chatbot',
    certifications: 'AWS Certified, Google Cloud Professional',
    resumeLink: 'https://example.com/resume.pdf',
    profilePicture: require('../../../client/assets/images/ProfilePic.png'), // Initial profile picture
  });

  useEffect(() => {
    if (route.params?.student) {
      setStudent(route.params.student);  // Update student data when coming back
    }
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
          source={student.profilePicture} // Dynamic profile picture
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
      <Text style={{ fontSize: 16, color: textColor, marginBottom: 20 }}>Resume: <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(student.resumeLink)}>Download Resume</Text></Text>
      
      <Button title="Update Profile" color="#893030" onPress={() => navigation.navigate('UpdateStudentProfile', { student, setStudent })} />
      <Button title="Back" color="#893030" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

export default StudentInfo;
