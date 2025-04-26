import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL } from '../utils/network';

interface User {
  _id: string;
  name: string;
  email: string;
  isFaculty: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isFaculty: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error in login:', error);
    }
  };
  
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error in logout:', error);
    }
  };
  
  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Verify token with backend
      const response = await axios.get(`${getBackendURL()}/user`, {
        headers: { Authorization: token }
      });
      
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        // Token is invalid
        await AsyncStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // On error, clear auth state
      await AsyncStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  useEffect(() => {
    checkAuthState();
  }, []);
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isFaculty: user?.isFaculty || false,
        login, 
        logout, 
        checkAuthState 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 