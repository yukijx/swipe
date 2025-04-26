import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL } from '../utils/network';


const Login = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      console.log("Login validation failed: Email or password empty");
      return Alert.alert('Error', 'Please enter your email and password');
    }

    try {
        console.log("Starting login process...");
        setIsLoggingIn(true);
        const backendUrl = `${getBackendURL()}/login`; 
        console.log("Login URL:", backendUrl);
        
        const response = await axios.post(backendUrl, { email, password });

        console.log("Login response received, status:", response.status);
        console.log("Login Response:", response.data);
        
        if (!response.data || !response.data.token) {
            console.log("No token in response");
            throw new Error("No token received from the backend");
        }

        await AsyncStorage.setItem('token', response.data.token);
        console.log("Saved Token:", await AsyncStorage.getItem('token'));

        // Check if user needs to complete profile setup
        const user = response.data.user;
        const isFaculty = user && user.isFaculty;
        
        console.log("User type:", isFaculty ? "Faculty" : "Student");
        
        // Check if profile is incomplete
        const needsProfileSetup = isFaculty 
            ? (!user.university || !user.department)
            : (!user.university || !user.major || !user.skills);
            
        console.log("Needs profile setup:", needsProfileSetup);
        console.log("User profile data:", {
          university: user.university,
          department: user.department,
          major: user.major,
          skills: user.skills
        });
        
        if (needsProfileSetup) {
            console.log("Navigating to profile setup");
            Alert.alert('Welcome', 'Please complete your profile setup');
            if (isFaculty) {
                console.log("Navigating to ProfessorSetup");
                navigation.navigate('ProfessorSetup');
            } else {
                console.log("Navigating to StudentSetup");
                navigation.navigate('StudentSetup');
            }
        } else {
            console.log("User profile is complete");
            Alert.alert('Success', 'Logged in successfully');
            if (isFaculty) {
                console.log("Navigating to FacultyHome");
                navigation.navigate('FacultyHome');
            } else {
                console.log("Navigating to Home");
                navigation.navigate('Home');
            }
        }
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
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Login</Text>
      
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
              navigation.navigate('Register');
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
  }
});

export default Login;
