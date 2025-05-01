import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { getBackendURL } from '../utils/network';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const AuthRegister = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isFaculty: false
  });

  // Validate form fields as the user types
  useEffect(() => {
    // Only validate fields that have been touched (not empty)
    const newErrors: ValidationErrors = {};
    
    if (form.name && form.name.trim().length < 2) {
      newErrors.name = 'Name should be at least 2 characters';
    }
    
    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (form.password) {
      if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
  }, [form]);

  const handleRegister = async () => {
    console.log('Register button pressed, starting validation...');
    
    // Validate all fields
    const newErrors: ValidationErrors = {};
    
    // Validate name
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name should be at least 2 characters';
    }
    
    // Validate email
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Validate password
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate password match
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // If there are validation errors, show them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation failed:', newErrors);
      setErrors(newErrors);
      return;
    }
  
    try {
      console.log('Starting registration...');
      setIsRegistering(true);
      
      // Get the backend URL asynchronously
      const backendURL = await getBackendURL();
      console.log('Backend URL:', backendURL);
      
      // Register API call
      const registerResponse = await axios.post(`${backendURL}/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        isFaculty: form.isFaculty
      });
      
      console.log('Register response:', registerResponse.data);
      
      // Auto-login after registration
      const loginResponse = await axios.post(`${backendURL}/login`, {
        email: form.email,
        password: form.password
      });
      
      console.log('Login response received:', loginResponse.status);
      
      if (!loginResponse.data || !loginResponse.data.token) {
        throw new Error("No token received from the backend after login");
      }
      
      // Step 3: Save the auth token
      await AsyncStorage.setItem('token', loginResponse.data.token);
      console.log('Auto-login successful, token saved');
      
      // Step 4: Navigate to the appropriate setup page
      console.log('Navigating to setup page...');
      Alert.alert('Success', 'Account created! Please complete your profile setup.');
      
      if (form.isFaculty) {
        console.log('Navigating to ProfileSetupFaculty');
        navigation.navigate('ProfileSetupFaculty');
      } else {
        console.log('Navigating to ProfileSetupStudent');
        navigation.navigate('ProfileSetupStudent');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('No response received from server. Check network connection.');
      } else {
        console.error('Error in request setup:', error.message);
      }
      
      // Check for "Email already exists" error
      if (error.response?.data?.error === 'Email already exists') {
        Alert.alert(
          'Account Already Exists', 
          'An account with this email already exists. Would you like to log in instead?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Log In',
              onPress: () => navigation.navigate('AuthLogin')
            }
          ]
        );
      } else {
        // Handle other errors
        Alert.alert('Error', error.response?.data?.error || 'Registration failed. Please check your network connection and try again.');
      }
    } finally {
      console.log('Registration process completed (success or error)');
      setIsRegistering(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Create Account</Text>
      
      <TextInput
        style={[
          styles.input, 
          { backgroundColor: inputBackground, color: inputTextColor },
          errors.name ? styles.inputError : null
        ]}
        placeholder="Full Name"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      
      <TextInput
        style={[
          styles.input, 
          { backgroundColor: inputBackground, color: inputTextColor },
          errors.email ? styles.inputError : null
        ]}
        placeholder="Email"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      
      <TextInput
        style={[
          styles.input, 
          { backgroundColor: inputBackground, color: inputTextColor },
          errors.password ? styles.inputError : null
        ]}
        placeholder="Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      
      <TextInput
        style={[
          styles.input, 
          { backgroundColor: inputBackground, color: inputTextColor },
          errors.confirmPassword ? styles.inputError : null
        ]}
        placeholder="Confirm Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      
      <View style={styles.roleButtonContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            {marginRight:10},
            form.isFaculty && styles.roleButtonSelected
          ]}
          onPress={() => setForm({ ...form, isFaculty: true })}
        >
          <Text style={styles.roleButtonText}>
            Register as a Faculty
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            !form.isFaculty && styles.roleButtonSelected
          ]}
          onPress={() => setForm({ ...form, isFaculty: false })}
        >
          <Text style={styles.roleButtonText}>
            Register as a Student
          </Text>
        </TouchableOpacity>
      </View>
      
      {isRegistering ? (
        <ActivityIndicator size="large" color="#893030" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.backButton, { marginTop: 10 }]}
            onPress={() => navigation.navigate('AuthLogin')}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
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
    marginBottom: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  roleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 5,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#893030',
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#893030', 
  },
  roleButtonSelected: {
    backgroundColor: '#621010',
  },
  roleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign:'center',
  },
  loader: {
    marginVertical: 20,
  },
  registerButton: {
    backgroundColor: '#893030',
    padding: 15,
    borderRadius: 5, 
    alignItems: 'center',
  },
  backButton: {
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

export default AuthRegister; 