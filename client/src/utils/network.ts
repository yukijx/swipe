//This allows the host to be local or the assigned 5000
import Constants from 'expo-constants';

/**
 * Gets the backend URL dynamically based on whether the app is running in Expo Go or a production build.
 * @param backendPort The port your backend is running on (default: 5000)
 * @returns The correct backend URL
 */
export const getBackendURL = (backendPort: number = 5001): string => {
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]; // Extract only the IP, ignoring the port
    return `http://${host}:${backendPort}`;
  }
  
  // Fallback to localhost if the host is not detected
  return `http://localhost:${backendPort}`;
};

//192.168.0.135
