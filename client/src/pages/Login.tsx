import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Login = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });

      // Save JWT token in local storage
      await AsyncStorage.setItem('token', response.data.token);

      Alert.alert('Success', 'Logged in successfully');
      navigation.navigate('Home'); // Redirect to home after login
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, color: textColor, textAlign: 'center', marginBottom: 20 }}>Login</Text>
      <TextInput
        style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }}
        placeholder="Email"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 20, borderRadius: 5 }}
        placeholder="Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" color="#893030" onPress={handleLogin} />
      <Button title="Create Account" color="#893030" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default Login;
