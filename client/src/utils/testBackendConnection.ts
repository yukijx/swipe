import axios, { AxiosError } from 'axios';
import { getBackendURL } from './network';

// The production URL - needs to match the URL in network.ts
const RENDER_SERVER_URL = 'https://swipe-rdli.onrender.com';

/**
 * Tests the connection to the backend server
 * @returns A promise that resolves with connection status and details
 */
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
  url?: string;
  connectionLogDetails?: any;
}> => {
  try {
    // First test the normal URL resolution to see what it returns
    const normalBackendURL = await getBackendURL();
    console.log(`Normal URL resolution returned: ${normalBackendURL}`);
    
    // For testing purposes, we'll always use the production URL
    // This ensures we're testing Render connectivity regardless of dev settings
    const backendURL = RENDER_SERVER_URL;
    console.log(`🌐 Testing connection to production URL: ${backendURL}`);
    
    // Try to connect to the health endpoint
    const healthResponse = await axios.get(`${backendURL}/health`, { 
      timeout: 10000  // 10 second timeout
    });
    
    console.log(`✅ Health check successful: ${JSON.stringify(healthResponse.data)}`);
    
    // After health check succeeds, try the connection-log endpoint
    try {
      const connectionLogResponse = await axios.get(`${backendURL}/connection-log`, {
        timeout: 10000,
        params: {
          client: 'mobile-app',
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`✅ Connection log successful: ${JSON.stringify(connectionLogResponse.data)}`);
      
      // Both endpoints succeeded
      return {
        success: true,
        message: 'Successfully connected to Render backend',
        details: healthResponse.data,
        connectionLogDetails: connectionLogResponse.data,
        url: backendURL
      };
    } catch (connectionLogError) {
      // Health succeeded but connection-log failed
      console.warn('Health check succeeded but connection-log failed:', connectionLogError);
      return {
        success: true,
        message: 'Connected to Render health endpoint but connection-log failed',
        details: healthResponse.data,
        url: backendURL
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Render backend connection test failed:', axiosError);
    console.error('Error details:', axiosError.message);
    
    // Try to get more details about the error
    if (axiosError.response) {
      console.error('Response data:', axiosError.response.data);
      console.error('Response status:', axiosError.response.status);
    } else if (axiosError.request) {
      console.error('No response received from server');
    }
    
    return {
      success: false,
      message: `Failed to connect to Render backend: ${axiosError.message}`,
      details: axiosError,
      url: RENDER_SERVER_URL
    };
  }
}; 