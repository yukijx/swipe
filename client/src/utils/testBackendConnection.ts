import axios, { AxiosError } from 'axios';
import { getBackendURL } from './network';

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
    // Get the backend URL
    const backendURL = await getBackendURL();
    console.log(`Testing connection to: ${backendURL}`);
    
    // Try to connect to the health endpoint
    const healthResponse = await axios.get(`${backendURL}/health`, { 
      timeout: 5000 
    });
    
    // After health check succeeds, try the connection-log endpoint
    try {
      const connectionLogResponse = await axios.get(`${backendURL}/connection-log`, {
        timeout: 5000,
        params: {
          client: 'mobile-app',
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      // Both endpoints succeeded
      return {
        success: true,
        message: 'Successfully connected to backend',
        details: healthResponse.data,
        connectionLogDetails: connectionLogResponse.data,
        url: backendURL
      };
    } catch (connectionLogError) {
      // Health succeeded but connection-log failed
      console.warn('Health check succeeded but connection-log failed:', connectionLogError);
      return {
        success: true,
        message: 'Connected to health endpoint but connection-log failed',
        details: healthResponse.data,
        url: backendURL
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Backend connection test failed:', axiosError);
    return {
      success: false,
      message: `Failed to connect to backend: ${axiosError.message}`,
      details: axiosError,
      url: await getBackendURL().catch(() => 'unknown')
    };
  }
}; 