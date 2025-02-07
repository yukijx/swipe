import React from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';


export default function swipePage() {
  return (
    <View style={styles.container}>

      {/* Rectangle with text inside */}
      <View style={styles.body}>
        <Text style={styles.title}>This is a rectangle!</Text>
      </View>


      <Text style={styles.title}>THIS IS THE SWIPE PAGE!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#893030',
    padding: 16,
  },
  body: {
    width: 300, 
    height: 600, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#fff',
  },
});
