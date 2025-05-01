// DEVELOPER GUIDE:
// ----------------
// This file provides dynamic backend URL resolution for different environments.
// 
// To configure your development environment:
// 1. Access Developer Settings by tapping 5 times on the Login screen title
//    or by pressing the small "DEV" button in the bottom right corner
// 2. Enter your computer's IP address where the server is running
// 3. The app will connect to your local server at http://YOUR_IP:8080
//
// For production, the app will automatically use the deployed backend URL.
//

//This allows the host to be local or the assigned 5000
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEVELOPER CONFIGURATION
// If you need to override the automatic IP detection, change this value to your
// development machine's IP address, then uncomment the line below
// const DEVELOPER_MACHINE_IP = '192.168.1.100';

/**
 * Gets the backend URL dynamically based on environment
 * @returns The correct backend URL
 */
export const getBackendURL = async (): Promise<string> => {
  // For development in Expo Go
  if (__DEV__) {
    try {
      // Check if developer has manually set a server IP in AsyncStorage
      const savedIP = await AsyncStorage.getItem('dev_server_ip');
      if (savedIP) {
        console.log(`Using saved development server IP: ${savedIP}`);
        return `http://${savedIP}:8080`;
      }
    } catch (e) {
      console.warn('Failed to read saved server IP', e);
      // Continue to other methods if AsyncStorage fails
    }

    // Try to get the host from Expo constants (works in Expo Go)
    const debuggerHost = Constants.expoConfig?.hostUri || 
                         Constants.manifest?.debuggerHost || 
                         Constants.manifest2?.extra?.expoGo?.debuggerHost;
    
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0]; // Extract only the IP
      console.log(`Auto-detected development server IP: ${host}`);
      return `http://${host}:8080`; // Use your local dev port
    }
    
    // Return localhost as last resort fallback
    console.warn('Could not determine server IP. Using localhost which may not work on physical devices.');
    return 'http://localhost:8080';
  }
  
  // For production builds
  return 'https://swipe-rdli.onrender.com';
};

/**
 * Helper function to save a custom development server IP
 * Call this from a developer settings screen to configure the app
 */
export const saveDevServerIP = async (ip: string): Promise<void> => {
  if (!ip) return;
  
  try {
    await AsyncStorage.setItem('dev_server_ip', ip);
    console.log(`Saved development server IP: ${ip}`);
  } catch (e) {
    console.error('Failed to save server IP', e);
  }
};

/**
 * Helper function to clear the saved development server IP
 */
export const clearDevServerIP = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('dev_server_ip');
    console.log('Cleared development server IP');
  } catch (e) {
    console.error('Failed to clear server IP', e);
  }
};

/**
 * Gets the backend URL synchronously (use this only when async is not possible)
 * @returns {string} The backend URL
 * @deprecated Use getBackendURL async function when possible
 */
export const getBackendURLSync = (): string => {
  // For development in Expo Go
  if (__DEV__) {
    // Try to get the host from Expo constants (works in Expo Go)
    const debuggerHost = Constants.expoConfig?.hostUri || 
                         Constants.manifest?.debuggerHost || 
                         Constants.manifest2?.extra?.expoGo?.debuggerHost;
    
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0]; // Extract only the IP
      return `http://${host}:8080`; // Use your local dev port
    }
    
    // Return localhost as fallback for development
    return 'http://localhost:8080';
  }
  
  // For production builds
  return 'https://swipe-api.onrender.com';
};

//192.168.0.135
