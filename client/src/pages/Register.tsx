import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';

const Register = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';
  const inputBackground = theme === 'light' ? '#ffffff' : '#333';
  const inputTextColor = theme === 'light' ? '#000' : '#ffffff';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isFaculty: false
  });

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
  
    try {
      const response = await axios.post('http://localhost:5000/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        isFaculty: form.isFaculty
      });

      Alert.alert('Success', 'Account created! Please complete your profile setup.');
      
      // Navigate to appropriate setup page
      if (form.isFaculty) {
        navigation.navigate('ProfessorSetup');
      } else {
        navigation.navigate('StudentSetup');
      }

    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Create Account</Text>
      
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Full Name"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Email"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />
      
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />
      
      <TextInput
        style={[styles.input, { backgroundColor: inputBackground, color: inputTextColor }]}
        placeholder="Confirm Password"
        placeholderTextColor={theme === 'light' ? '#666' : '#bbb'}
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
      />

      <TouchableOpacity
        style={[styles.roleButton, form.isFaculty && styles.roleButtonActive]}
        onPress={() => setForm({ ...form, isFaculty: !form.isFaculty })}
      >
        <Text style={styles.roleButtonText}>
          Register as: {form.isFaculty ? 'Professor' : 'Student'}
        </Text>
      </TouchableOpacity>

      <Button title="Register" color="#893030" onPress={handleRegister} />
      <Button title="Back to Login" color="#893030" onPress={() => navigation.navigate('Login')} />
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
  roleButton: {
    backgroundColor: '#893030',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#621010',
  },
  roleButtonText: {
    color: '#ffffff',
    fontSize: 16,
  }
});

export default Register;
