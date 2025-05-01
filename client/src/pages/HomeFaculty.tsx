import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebAlert from '../components/WebAlert';

const HomeFaculty = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { logout } = useAuthContext();
  const [showAlert, setShowAlert] = useState(false);

  // Themed styling variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const buttonColor = theme === 'light' ?'#893030': '#333';
  const buttonTextColor = '#ffffff';

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await logout();
      navigation.replace('AuthLogin');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      setShowAlert(true);
    } else {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            onPress: handleLogout,
            style: 'destructive'
          }
        ]
      );
    }
  };

  return (
    <ResponsiveScreen navigation={navigation} contentContainerStyle={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>MENU</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('ProfileView')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('ListingManagement')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>My Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('FacultyInterestedStudents')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Student Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('SettingsMain')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={confirmLogout}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <WebAlert
        visible={showAlert}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        buttons={[
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Logout', onPress: handleLogout, style: 'destructive' }
        ]}
        onClose={() => setShowAlert(false)}
      />
    </ResponsiveScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeFaculty;
