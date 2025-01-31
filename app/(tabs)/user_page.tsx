import React from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';
// import { useRouter } from 'expo-router'; // Use useRouter for navigation


export default function userPageScreen() {
  // const router = useRouter(); // Initialize router
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME USER!</Text>
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
});
