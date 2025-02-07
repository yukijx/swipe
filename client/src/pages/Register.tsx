import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

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
    university: '',
    major: '',
    experience: '',
    skills: '',
    projects: '',
    certifications: '',
    resumeLink: ''
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    
    try {
      await axios.post('http://localhost:5000/register', form);
      Alert.alert('Success', 'Account created successfully');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <ScrollView style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, color: textColor, textAlign: 'center', marginBottom: 20 }}>Create Account</Text>
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Full Name" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} value={form.name} onChangeText={(text) => handleChange('name', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Email" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} value={form.email} onChangeText={(text) => handleChange('email', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Password" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} secureTextEntry value={form.password} onChangeText={(text) => handleChange('password', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Confirm Password" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} secureTextEntry value={form.confirmPassword} onChangeText={(text) => handleChange('confirmPassword', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="University" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} value={form.university} onChangeText={(text) => handleChange('university', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Major" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} value={form.major} onChangeText={(text) => handleChange('major', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Work Experience" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} multiline value={form.experience} onChangeText={(text) => handleChange('experience', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Skills" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} multiline value={form.skills} onChangeText={(text) => handleChange('skills', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Projects" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} multiline value={form.projects} onChangeText={(text) => handleChange('projects', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 10, borderRadius: 5 }} placeholder="Certifications" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} multiline value={form.certifications} onChangeText={(text) => handleChange('certifications', text)} />
      <TextInput style={{ backgroundColor: inputBackground, color: inputTextColor, padding: 10, marginBottom: 20, borderRadius: 5 }} placeholder="Resume Link" placeholderTextColor={theme === 'light' ? '#666' : '#bbb'} value={form.resumeLink} onChangeText={(text) => handleChange('resumeLink', text)} />
      <Button title="Register" color="#893030" onPress={handleRegister} />
      <Button title="Back to Login" color="#893030" onPress={() => navigation.navigate('Login')} />
    </ScrollView>
  );
};

export default Register;
