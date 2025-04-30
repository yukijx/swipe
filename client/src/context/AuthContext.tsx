import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackParamList } from '../navigation/types';

interface DecodedToken {
  id: string;
  email: string;
  isFaculty: boolean;
  exp: number; // Token expiration timestamp
  iat: number; // Token issued at timestamp
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isFaculty: boolean;
  userId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isFaculty: false,
  userId: null,
  loading: true,
  logout: async () => {},
  refreshAuth: async () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize with not authenticated - explicitly set here for clarity
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    console.log('[AuthContext] Starting auth check');
    setLoading(true);
    
    try {
      // Always start with cleared auth state
      setIsAuthenticated(false);
      setIsFaculty(false);
      setUserId(null);
      
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('[AuthContext] No token found, not authenticated');
        return;
      }
      
      try {
        // Decode token and check role
        const decoded = jwtDecode(token) as DecodedToken;
        console.log('[AuthContext] Token decoded:', {
          id: decoded.id,
          isFaculty: decoded.isFaculty
        });
        
        // Verify token is not expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('[AuthContext] Token expired, removing');
          await AsyncStorage.removeItem('token');
          return;
        }
        
        setIsFaculty(decoded.isFaculty);
        setUserId(decoded.id);
        setIsAuthenticated(true);
        console.log('[AuthContext] Successfully authenticated:', {
          id: decoded.id,
          isFaculty: decoded.isFaculty
        });
        
        // Force a re-render of the parent navigator by causing a state update
        // This helps with navigation issues on Android
        console.log('[AuthContext] Auth state updated - force re-render');
      } catch (decodeError) {
        console.error('[AuthContext] Error decoding token:', decodeError);
        // If token can't be decoded, it's invalid
        await AsyncStorage.removeItem('token');
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
      setIsFaculty(false);
      setUserId(null);
      console.log('[AuthContext] Logged out successfully');
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
    }
  }, []);

  // Check auth on initial load
  useEffect(() => {
    // Clear any expired/invalid tokens on startup
    const initialCheck = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          try {
            // Verify the token is valid
            const decoded = jwtDecode(token) as DecodedToken;
            const currentTime = Date.now() / 1000;
            
            if (!decoded.exp || decoded.exp < currentTime) {
              console.log('[AuthContext] Clearing expired token on startup');
              await AsyncStorage.removeItem('token');
            }
          } catch (error) {
            // If token is invalid, remove it
            console.log('[AuthContext] Clearing invalid token on startup');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error during initial token check:', error);
      }
      
      // Now do the regular auth check
      checkAuth();
    };
    
    initialCheck();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isFaculty, 
      userId, 
      loading, 
      logout, 
      refreshAuth: checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook for easy access to auth context
export const useAuthContext = () => useContext(AuthContext); 