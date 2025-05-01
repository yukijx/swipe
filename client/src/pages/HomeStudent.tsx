import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebAlert from '../components/WebAlert';

const HomeStudent = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { logout } = useAuthContext();
  const [showAlert, setShowAlert] = useState(false);

  // Themed styling variables
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const buttonColor = theme === 'light' ?'#893030': '#333';
  const buttonTextColor = '#ffffff';

  // Logout logic
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

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('ProfileView')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('SwipeCards')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Browse Opportunities</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('StudentMatches')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>View My Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('StudentSwipeHistory')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Application History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => navigation.navigate('SettingsMain')}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>Settings</Text>
        </TouchableOpacity>

        {/* Logout Button */}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeStudent;