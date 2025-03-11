import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/types';
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  email: string;
  isFaculty: boolean;
}

const useAuth = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          navigation.navigate('Login');
          return;
        }

        // Decode token and check role
        const decoded = jwtDecode(token) as DecodedToken;
        setIsFaculty(decoded.isFaculty);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
      setIsFaculty(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return { isAuthenticated, isFaculty, loading, logout };
};

export default useAuth;
