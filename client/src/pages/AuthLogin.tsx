//This is the login page

// React and React Native Hooks and Components
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';

// Theme context to toggle between light and dark modes
import { useTheme } from '../context/ThemeContext';

// Used for storing the JWT token securely on the device
import AsyncStorage from '@react-native-async-storage/async-storage';

// Axios is used for HTTP requests to the backend
import axios from 'axios';

// Utility function to dynamically determine the base backend URL
import { getBackendURL } from '../utils/network';

// Custom authentication context to refresh login state globally
import { useAuthContext } from '../context/AuthContext';

// Touchable component to detect taps without visual feedback (used for dev trigger)
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

// Main login component
const AuthLogin = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();                 // Current theme (light/dark)
  const { refreshAuth } = useAuthContext();     // Function to refresh auth state

  // Theme-based dynamic styles
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';

  // Local state for form fields and UI logic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);  // Hidden tap count to trigger dev screen

  // Function to handle login logic
  const handleLogin = async () => {
    // Input validation
    if (!email.trim() || !password.trim()) {
      console.log("Login validation failed: Email or password empty");
      return Alert.alert('Error', 'Please enter your email and password');
    }

    try {
      console.log("Starting login process...");
      setIsLoggingIn(true);  // Show loading spinner

      // Dynamically resolve the backend API URL
      const backendURL = await getBackendURL();
      const loginUrl = `${backendURL}/login`;
      console.log("Login URL:", loginUrl);

      // Make a POST request with user credentials
      const response = await axios.post(loginUrl, { email, password });
      console.log("Login response received, status:", response.status);

      // Validate that token was returned
      if (!response.data || !response.data.token) {
        console.log("No token in response");
        throw new Error("No token received from the backend");
      }

      // Store the token securely in device storage
      await AsyncStorage.setItem('token', response.data.token);
      console.log("Saved Token:", await AsyncStorage.getItem('token'));

      // Trigger global auth refresh
      await refreshAuth();

      // Determine if user needs profile completion (faculty vs student logic)
      const user = response.data.user;
      const isFaculty = user && user.isFaculty;

      console.log("User type:", isFaculty ? "Faculty" : "Student");

      const needsProfileSetup = isFaculty
        ? (!user.university || !user.department)
        : (!user.university || !user.major || !user.skills);

      console.log("Needs profile setup:", needsProfileSetup);

      // Note: navigation is not triggered here; handled by parent router
      Alert.alert('Success', 'Logged in successfully');
    } catch (error: any) {
      // Log and alert different error types
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
      setIsLoggingIn(false);  // Hide loading spinner
    }
  };

  // Handles 5 rapid taps on the title to open a hidden Developer Settings screen
  const handleTitlePress = () => {
    setDevTapCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount >= 5) {
        setTimeout(() => setDevTapCount(0), 300);  // Reset immediately
        navigation.navigate('DeveloperSettings');   // Navigate to dev screen
        return 0;
      }
      setTimeout(() => setDevTapCount(0), 3000);  // Reset after 3 sec if not completed
      return newCount;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Hidden dev trigger on title */}
      <TouchableWithoutFeedback onPress={handleTitlePress}>
        <Text style={[styles.title, { color: textColor }]}>Login</Text>
      </TouchableWithoutFeedback>

      {/* Email input field */}
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Email"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password input field */}
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot password link */}
      <TouchableOpacity
        onPress={() => console.log('Forgot password')}
        style={styles.forgotPassword}
      >
        <Text style={{ color: textColor, textDecorationLine: 'underline' }}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Show loader if logging in */}
      {isLoggingIn ? (
        <ActivityIndicator size="large" color="#893030" style={styles.loader} />
      ) : (
        <>
          {/* Login button */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => {
              console.log('Login button clicked');
              handleLogin();
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Navigation to registration screen */}
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
