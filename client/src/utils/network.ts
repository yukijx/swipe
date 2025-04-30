//This allows the host to be local or the assigned 5000
import Constants from 'expo-constants';

/**
 * Gets the backend URL dynamically based on environment
 * @returns The correct backend URL
 */
export const getBackendURL = (): string => {
  // For development in Expo Go
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0]; // Extract only the IP
      return `http://${host}:8080`; // Use your local dev port
    }
    return 'http://localhost:8080';
  }
  
  // For production builds - your Railway URL
  return 'https://swipedeploy-production.up.railway.app';
};

//192.168.0.135
