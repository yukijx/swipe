import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform, Switch } from 'react-native';
import { saveDevServerIP, clearDevServerIP, forceProductionAPI, forceDevelopmentAPI } from '../utils/network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from './ResponsiveScreen';
import { useAuthContext } from '../context/AuthContext';

const DeveloperSettings = ({ navigation }: { navigation: any }) => {
  const [serverIP, setServerIP] = useState('');
  const [savedIP, setSavedIP] = useState<string | null>(null);
  const [isProductionForced, setIsProductionForced] = useState(false);
  const [isDevelopmentForced, setIsDevelopmentForced] = useState(false);
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const backgroundColor = theme === 'light' ? '#fff' : '#222';
  const inputBgColor = theme === 'light' ? '#f5f5f5' : '#333';
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    loadSavedIP();
    checkForceProduction();
    checkForceDevelopment();
  }, []);

  const loadSavedIP = async () => {
    try {
      const ip = await AsyncStorage.getItem('dev_server_ip');
      setSavedIP(ip);
      if (ip) setServerIP(ip);
    } catch (e) {
      console.error('Failed to load saved IP', e);
    }
  };

  const checkForceProduction = async () => {
    try {
      const forced = await AsyncStorage.getItem('force_production_api');
      setIsProductionForced(forced === 'true');
    } catch (e) {
      console.error('Failed to check force production setting', e);
    }
  };

  const checkForceDevelopment = async () => {
    try {
      const forced = await AsyncStorage.getItem('force_development_api');
      setIsDevelopmentForced(forced === 'true');
    } catch (e) {
      console.error('Failed to check force development setting', e);
    }
  };

  const handleSaveIP = async () => {
    if (!serverIP.trim()) {
      Alert.alert('Error', 'Please enter a valid IP address');
      return;
    }

    try {
      await saveDevServerIP(serverIP.trim());
      setSavedIP(serverIP.trim());
      Alert.alert(
        'Success',
        'Server IP saved. Please restart the app for changes to take effect.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save server IP');
    }
  };

  const handleClearIP = async () => {
    try {
      await clearDevServerIP();
      setSavedIP(null);
      setServerIP('');
      Alert.alert(
        'Success',
        'Server IP cleared. Auto-detection will be used on next app restart.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to clear server IP');
    }
  };

  const toggleForceProduction = async (value: boolean) => {
    try {
      await forceProductionAPI(value);
      setIsProductionForced(value);
      // Update the other switch since they're mutually exclusive
      if (value) {
        setIsDevelopmentForced(false);
      }
      Alert.alert(
        value ? 'Production API Enabled' : 'Production API Disabled',
        value 
          ? 'The app will now use the production server URL. This is useful for testing connectivity with the deployed server.'
          : 'The app will now use the default server selection logic.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to update production API setting');
    }
  };

  const toggleForceDevelopment = async (value: boolean) => {
    try {
      await forceDevelopmentAPI(value);
      setIsDevelopmentForced(value);
      // Update the other switch since they're mutually exclusive
      if (value) {
        setIsProductionForced(false);
      }
      Alert.alert(
        value ? 'Development API Enabled' : 'Development API Disabled',
        value 
          ? 'The app will now use the development server URL only, bypassing the production server checks.'
          : 'The app will now use the default server selection logic.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to update development API setting');
    }
  };

  const getLocalIP = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Info',
        'On web platform, you need to determine your local network IP manually (e.g., from your computer\'s network settings)',
        [{ text: 'OK' }]
      );
      return;
    }

    // For simplicity, guide the user to find their IP
    Alert.alert(
      'Find Your Local IP',
      'To find your local IP address:\n\n' +
      '• On Windows: Run "ipconfig" in Command Prompt\n' +
      '• On Mac/Linux: Run "ifconfig" in Terminal\n' +
      '• Check your Wi-Fi settings on your device\n\n' +
      'Look for IPv4 Address in your local network (usually starts with 192.168.x.x or 10.x.x.x)',
      [{ text: 'OK' }]
    );
  };

  const openBackendTest = () => {
    navigation.navigate('DevBackendTest');
  };

  return (
    <ResponsiveScreen navigation={navigation}>
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Developer Settings</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Development Server Configuration</Text>
          <Text style={[styles.description, { color: textColor }]}>
            Configure the development server IP to connect to your local backend server when testing with physical devices.
          </Text>
          
          {savedIP && (
            <View style={styles.savedIPContainer}>
              <Text style={[styles.savedIPLabel, { color: textColor }]}>Current Server IP:</Text>
              <Text style={[styles.savedIP, { color: textColor }]}>{savedIP}</Text>
            </View>
          )}
          
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            placeholder="Enter server IP (e.g., 192.168.1.100)"
            placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
            value={serverIP}
            onChangeText={setServerIP}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSaveIP}>
              <Text style={styles.buttonText}>Save IP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearIP}>
              <Text style={styles.buttonText}>Clear IP</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.helpButton} onPress={getLocalIP}>
            <Text style={styles.helpButtonText}>Help: How to find my IP</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>API Mode Selection</Text>
          
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: textColor }]}>Force Production API</Text>
            <Switch
              value={isProductionForced}
              onValueChange={toggleForceProduction}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={isProductionForced ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.switchDescription, { color: textColor }]}>
            When enabled, the app will always use the production server URL.
            This is useful for testing connectivity with the deployed server.
          </Text>
          
          <View style={[styles.switchContainer, { marginTop: 15 }]}>
            <Text style={[styles.switchLabel, { color: textColor }]}>Force Development API</Text>
            <Switch
              value={isDevelopmentForced}
              onValueChange={toggleForceDevelopment}
              trackColor={{ false: '#767577', true: '#ff9800' }}
              thumbColor={isDevelopmentForced ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.switchDescription, { color: textColor }]}>
            When enabled, the app will always use your local development server without 
            checking if the production server is available first.
          </Text>
          
          <Text style={[styles.infoBox, { color: textColor }]}>
            By default, the app will try the production server first and fall back 
            to the development server if the production server is unavailable.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Connection Information</Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            • Development server runs on port 8080 {'\n'}
            • Production server is at {'\n'}  {RENDER_SERVER_URL} {'\n'}
            • Make sure your server and device are on the same network {'\n'}
            • Check firewall settings if connection issues persist
          </Text>
        </View>
        
        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Login</Text>
            <Text style={[styles.description, { color: textColor }]}>
              After configuring your server IP, you can proceed to login.
            </Text>
            <TouchableOpacity 
              style={[styles.button, { marginTop: 10 }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007bff' }]}
          onPress={openBackendTest}
        >
          <Text style={styles.buttonText}>Test Backend Connection</Text>
        </TouchableOpacity>
      </View>
    </ResponsiveScreen>
  );
};

// Make this variable available to the component
const RENDER_SERVER_URL = 'https://swipe-rdli.onrender.com';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  savedIPContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  savedIPLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  savedIP: {
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#893030',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpButton: {
    padding: 10,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#893030',
    textDecorationLine: 'underline',
  },
  infoText: {
    lineHeight: 22,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default DeveloperSettings; 