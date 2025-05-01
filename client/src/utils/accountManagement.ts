import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from './network';

export const deleteAccount = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const backendURL = await getBackendURL();
    await axios.delete(`${backendURL}/user/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (err) {
    console.error('[DeleteAccount]', err);
    return false;
  }
}; 