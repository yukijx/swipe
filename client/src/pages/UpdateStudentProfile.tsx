import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

const UpdateStudentProfile = ({ navigation, route }: { navigation: any, route: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const { student, setStudent } = route.params; // Receive student and setStudent from navigation params

  // Local state for handling changes
  const [updatedStudent, setUpdatedStudent] = useState(student);

  const handleUpdateProfilePicture = () => {
    
    // Allow user to pick an image from gallery
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

  launchImageLibrary(options, (response) => { 
        if (response.didCancel) {
          console.log('User canceled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const newProfilePicture = { uri: response.assets[0].uri };
          setUpdatedStudent((prevStudent: any) => ({
            ...prevStudent,
            profilePicture: newProfilePicture, // Update profile picture
          }));
        }
      });
    };

  const handleUpdate = () => {
    setStudent(updatedStudent); // Update the student data in StudentInfo
    navigation.goBack(); // Navigate back to StudentInfo
  };

  return (
    <ScrollView style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, color: textColor, textAlign: 'center', marginBottom: 20 }}>Update Student Profile</Text>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image 
          source={updatedStudent.profilePicture} // Dynamic profile picture
          style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: textColor }}
        />
        <Button title="Change Profile Picture" onPress={handleUpdateProfilePicture} />
      </View>

      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Name"
        value={updatedStudent.name}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, name: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Email"
        value={updatedStudent.email}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, email: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="University"
        value={updatedStudent.university}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, university: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Major"
        value={updatedStudent.major}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, major: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Experience"
        value={updatedStudent.experience}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, experience: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Skills"
        value={updatedStudent.skills}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, skills: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Projects"
        value={updatedStudent.projects}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, projects: text })}
      />
      <TextInput
        style={{ fontSize: 16, color: textColor, marginBottom: 10 }}
        placeholder="Certifications"
        value={updatedStudent.certifications}
        onChangeText={(text) => setUpdatedStudent({ ...updatedStudent, certifications: text })}
      />

      <Button title="Save Changes" color="#893030" onPress={handleUpdate} />
      <Button title="Back" color="#893030" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

export default UpdateStudentProfile;