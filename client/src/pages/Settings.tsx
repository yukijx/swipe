import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Settings = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, color: textColor }}>Settings</Text>
      <Button title="Profile Settings" color="#893030" onPress={() => navigation.navigate('ProfileSettings')} />
      <Button title="Preferences" color="#893030" onPress={() => navigation.navigate('Preferences')} />
      <Button title="Security & Privacy" color="#893030" onPress={() => navigation.navigate('SecuritySettings')} />
      <Button title="App Settings" color="#893030" onPress={() => navigation.navigate('AppSettings')} />
      <Button title="Support & About" color="#893030" onPress={() => navigation.navigate('SupportAbout')} />
      <Button title="Student Profile" color="#893030" onPress={() => navigation.navigate('StudentInfo')} />
      <Button title="Create Faculty Profile" color="#893030" onPress={() => navigation.navigate('CreateFacultyProfile')} />
      <Button title="Create Listing" color="#893030" onPress={() => navigation.navigate('CreateListing')} />
      <Button title="Listings" color="#893030" onPress={() => navigation.navigate('ListListings')} />
      <Button title="Listing" color="#893030" onPress={() => navigation.navigate('Listing')} />
      <Button title="Log Out" color="#893030" onPress={() => console.log('Logging out...')} />
    </View>
  );
};

export default Settings;