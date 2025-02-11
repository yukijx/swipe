import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../App'; 

const useAuth = () => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login'); // Redirect to login if no token
      }
    };

    checkAuth();
  }, []);
};

export default useAuth;
