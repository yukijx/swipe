import React from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';
// import { useRouter } from 'expo-router'; // Use useRouter for navigation


export default function Listings_Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please insert a username and password.</Text>

      <TextInput
        style={styles.input}
        placeholder="Listing"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Create New Listing"
        placeholderTextColor="#888"
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Re-Enter Password"
        placeholderTextColor="#888"
        secureTextEntry
      />

      <Button title="Enter" onPress={() => console.log('Account created')} />
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
    fontSize: 20,
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
