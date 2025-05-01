import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL } from '../utils/network';
import { useAuthContext } from '../context/AuthContext';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const AuthLogin = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { refreshAuth } = useAuthContext();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      console.log("Login validation failed: Email or password empty");
      return Alert.alert('Error', 'Please enter your email and password');
    }

    try {
      console.log("Starting login process...");
      setIsLoggingIn(true);
      
      // Use the asynchronous version
      const backendURL = await getBackendURL();
      const loginUrl = `${backendURL}/login`;
      console.log("Login URL:", loginUrl);
      
      const response = await axios.post(loginUrl, { email, password });

      console.log("Login response received, status:", response.status);
      
      if (!response.data || !response.data.token) {
        console.log("No token in response");
        throw new Error("No token received from the backend");
      }

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      console.log("Saved Token:", await AsyncStorage.getItem('token'));

      // Refresh auth context to update authentication state
      await refreshAuth();
      
      // Check if user needs to complete profile setup
      const user = response.data.user;
      const isFaculty = user && user.isFaculty;
      
      console.log("User type:", isFaculty ? "Faculty" : "Student");
      
      // Check if profile is incomplete
      const needsProfileSetup = isFaculty 
          ? (!user.university || !user.department)
          : (!user.university || !user.major || !user.skills);
          
      console.log("Needs profile setup:", needsProfileSetup);
      
      // Simply show success alert - navigation will be handled by parent router
      console.log("Login successful, auth context updated");
      console.log("Let the router handle navigation based on auth state");
      
      // Show success alert
      Alert.alert('Success', 'Logged in successfully');
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received from server. Check network connection.");
      } else {
        console.error("Error in request setup:", error.message);
      }
      
      Alert.alert('Error', error.response?.data?.error || 'Login failed. Please check your credentials and try again.');
    } finally {
      console.log("Login process completed (success or error)");
      setIsLoggingIn(false);
    }
  };
  
  const handleTitlePress = () => {
    setDevTapCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount >= 5) {
        setTimeout(() => setDevTapCount(0), 300);
        navigation.navigate('DeveloperSettings');
        return 0;
      }
      setTimeout(() => setDevTapCount(0), 3000);
      return newCount;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableWithoutFeedback onPress={handleTitlePress}>
        <Text style={[styles.title, { color: textColor }]}>Login</Text>
      </TouchableWithoutFeedback>
      
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Email"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity
        onPress={() => console.log('Forgot password')}
        style={styles.forgotPassword}
      >
        <Text style={{ color: textColor, textDecorationLine: 'underline' }}>Forgot Password?</Text>
      </TouchableOpacity>
      
      {isLoggingIn ? (
        <ActivityIndicator size="large" color="#893030" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => {
              console.log('Login button clicked');
              handleLogin();
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.registerButton, { marginTop: 10 }]}
            onPress={() => {
              console.log('Create Account button clicked');
              navigation.navigate('AuthRegister');
            }}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: '#893030',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#893030',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthLogin;
