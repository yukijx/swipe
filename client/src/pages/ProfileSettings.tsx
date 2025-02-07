import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ProfileSettings = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  
  // Define colors dynamically based on theme
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackgroundColor = theme === 'light' ? '#ffffff' : '#444';
  const inputTextColor = theme === 'light' ? '#000' : '#fff';
  const buttonColor = theme === 'light' ? '#893030' : '#bb4b4b';

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, color: textColor, marginBottom: 10 }}>Profile Settings</Text>
      
      <TextInput
        style={{ backgroundColor: inputBackgroundColor, color: inputTextColor, marginBottom: 10, padding: 10, borderRadius: 5 }}
        placeholder="Profile Picture URL"
        placeholderTextColor={inputTextColor}
      />
      <TextInput
        style={{ backgroundColor: inputBackgroundColor, color: inputTextColor, marginBottom: 10, padding: 10, borderRadius: 5 }}
        placeholder="Name"
        placeholderTextColor={inputTextColor}
      />
      <TextInput
        style={{ backgroundColor: inputBackgroundColor, color: inputTextColor, marginBottom: 10, padding: 10, borderRadius: 5 }}
        placeholder="Email"
        placeholderTextColor={inputTextColor}
      />
      <TextInput
        style={{ backgroundColor: inputBackgroundColor, color: inputTextColor, marginBottom: 10, padding: 10, borderRadius: 5 }}
        placeholder="CV Link"
        placeholderTextColor={inputTextColor}
      />
      <TextInput
        style={{ backgroundColor: inputBackgroundColor, color: inputTextColor, marginBottom: 20, padding: 10, borderRadius: 5 }}
        placeholder="University & Major"
        placeholderTextColor={inputTextColor}
      />

      <Button title="Back" color={buttonColor} onPress={() => navigation.goBack()} />
    </View>
  );
};

export default ProfileSettings;
