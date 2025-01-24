import React from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';
// import { useRouter } from 'expo-router'; // Use useRouter for navigation


export default function LoginScreen() {
  // const router = useRouter(); // Initialize router
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      <TouchableOpacity>
        <Text style={styles.createAccountText}>Create a new account</Text>
      </TouchableOpacity>


      {/* <TouchableOpacity onPress={() => router.push('/create_account')}>
        <Text style={styles.createAccountText}>Create a new account</Text>
      </TouchableOpacity> */}

      <Button title="Enter" onPress={() => console.log("Login pressed")} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '90%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  createAccountText: {
    color: '#007BFF',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
});
