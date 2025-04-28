import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  faculty: boolean;
  iat: number;
  exp: number;
}

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [userData, setUserData] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            setIsAuthenticated(true);
            setIsFaculty(decoded.faculty);
            setUserData(decoded);
          } else {
            await AsyncStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
      setIsFaculty(false);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    isFaculty,
    userData,
    logout,
  };
};

export default useAuth; 