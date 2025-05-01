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
// By default, the app will try to use the production server first, falling back
// to the development server if the production server is unavailable.
//

//This allows the host to be local or the assigned 5000
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// DEVELOPER CONFIGURATION
// If you need to override the automatic IP detection, change this value to your
// development machine's IP address, then uncomment the line below
// const DEVELOPER_MACHINE_IP = '192.168.1.100';

// The production server URL - MAKE SURE THIS IS CORRECT
const RENDER_SERVER_URL = 'https://swipe-rdli.onrender.com';

// Default timeout for checking if server is available (ms)
const SERVER_CHECK_TIMEOUT = 5000;

// Cache for server availability to avoid repeated checks
let isProductionServerAvailable: boolean | null = null;
let lastServerCheckTime = 0;
const SERVER_CHECK_CACHE_DURATION = 60000; // 1 minute

/**
 * Check if the production server is available
 * This will only check once per minute to avoid excessive requests
 */
const checkProductionServerAvailable = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Use cached result if it's recent enough
  if (isProductionServerAvailable !== null && now - lastServerCheckTime < SERVER_CHECK_CACHE_DURATION) {
    console.log(`Using cached server availability: ${isProductionServerAvailable}`);
    return isProductionServerAvailable;
  }
  
  try {
    console.log(`Checking if production server is available: ${RENDER_SERVER_URL}`);
    const response = await axios.get(`${RENDER_SERVER_URL}/health`, { 
      timeout: SERVER_CHECK_TIMEOUT 
    });
    isProductionServerAvailable = response.status === 200;
    lastServerCheckTime = now;
    console.log(`Production server is ${isProductionServerAvailable ? 'available' : 'unavailable'}`);
    return isProductionServerAvailable;
  } catch (error: any) {
    console.warn(`Production server check failed: ${error.message}`);
    isProductionServerAvailable = false;
    lastServerCheckTime = now;
    return false;
  }
};

/**
 * Gets the backend URL dynamically based on environment
 * @returns The correct backend URL
 */
export const getBackendURL = async (): Promise<string> => {
  // First, check if we're forcing development mode
  try {
    const forceDevelopment = await AsyncStorage.getItem('force_development_api');
    if (forceDevelopment === 'true') {
      console.log('Forcing development API');
      return getDevelopmentURL();
    }
  } catch (e) {
    console.warn('Failed to check force development setting', e);
  }
  
  // Second, check if we're forcing production mode for testing
  try {
    const forceProduction = await AsyncStorage.getItem('force_production_api');
    if (forceProduction === 'true') {
      console.log(`Forcing production API: ${RENDER_SERVER_URL}`);
      return RENDER_SERVER_URL;
    }
  } catch (e) {
    console.warn('Failed to check force production setting', e);
  }

  // In development mode, prioritize production server but fallback to local
  if (__DEV__) {
    // Check if production server is available
    if (await checkProductionServerAvailable()) {
      console.log(`Using production server in development mode: ${RENDER_SERVER_URL}`);
      return RENDER_SERVER_URL;
    }
    
    // If production server is unavailable, use development URL
    console.log('Production server unavailable, falling back to development URL');
    return getDevelopmentURL();
  }
  
  // For production builds, always use the production server
  console.log(`Using production server: ${RENDER_SERVER_URL}`);
  return RENDER_SERVER_URL;
};

/**
 * Get the development server URL based on configuration
 */
const getDevelopmentURL = async (): Promise<string> => {
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
 * Temporarily force the app to use production API even in development
 * Useful for testing production connectivity
 */
export const forceProductionAPI = async (enable: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('force_production_api', enable ? 'true' : 'false');
    
    // If enabling production API, make sure development API is disabled
    if (enable) {
      await AsyncStorage.setItem('force_development_api', 'false');
    }
    
    // Clear the server availability cache to force a new check
    isProductionServerAvailable = null;
    
    console.log(`${enable ? 'Enabled' : 'Disabled'} force production API mode`);
  } catch (e) {
    console.error('Failed to set force production API mode', e);
  }
};

/**
 * Temporarily force the app to use development API
 * Useful if you need to bypass the production server check
 */
export const forceDevelopmentAPI = async (enable: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('force_development_api', enable ? 'true' : 'false');
    
    // If enabling development API, make sure production API is disabled
    if (enable) {
      await AsyncStorage.setItem('force_production_api', 'false');
    }
    
    console.log(`${enable ? 'Enabled' : 'Disabled'} force development API mode`);
  } catch (e) {
    console.error('Failed to set force development API mode', e);
  }
};

/**
 * Gets the backend URL synchronously (use this only when async is not possible)
 * @returns {string} The backend URL
 * @deprecated Use getBackendURL async function when possible
 */
export const getBackendURLSync = (): string => {
  // For synchronous calls, prefer the production URL when not in development
  if (!__DEV__) {
    return RENDER_SERVER_URL;
  }
  
  // In development, use the local URL if we can determine it
  const debuggerHost = Constants.expoConfig?.hostUri || 
                       Constants.manifest?.debuggerHost || 
                       Constants.manifest2?.extra?.expoGo?.debuggerHost;
  
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]; // Extract only the IP
    return `http://${host}:8080`; // Use your local dev port
  }
  
  // If we can't determine local URL, use production as fallback
  return RENDER_SERVER_URL;
};

//192.168.0.135
