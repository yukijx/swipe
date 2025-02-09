import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function CreateAccountScreen() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subheading}>Please Enter a Username</Text>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#893030" />

        <Text style={styles.subheading}>Please Enter a Password</Text>
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#893030" secureTextEntry />

        <Text style={styles.subheading}>Re-Enter Password</Text>
        <TextInput style={styles.input} placeholder="Re-Enter Password" placeholderTextColor="#893030" secureTextEntry />

        <View style={styles.checkboxContainer}>
          <BouncyCheckbox
            size={25} 
            fillColor="#4d231f"
            unFillColor="#fff"
            iconStyle={{ borderColor: "#4d231f", borderWidth:4 }}
            innerIconStyle={{ borderWidth: 2 }}
            text="Student"
            textStyle={{ color: "#fff7d5", fontSize: 16 }}
            onPress={(checked) => setIsChecked(checked)}
          />
        </View>
        <View style={styles.checkboxContainer}>
          <BouncyCheckbox
            size={25} 
            fillColor="#4d231f"
            unFillColor="#fff"
            iconStyle={{ borderColor: "#4d231f", borderWidth:4 }}
            innerIconStyle={{ borderWidth: 2 }}
            text="Faculty"
            textStyle={{ color: "#fff7d5", fontSize: 16 }}
            onPress={(checked) => setIsChecked(checked)}
          />
        </View>
        <Text style={styles.text}>Select the one you are</Text>

        <TouchableOpacity style={styles.button} onPress={() => console.log('Account created, Checkbox:', isChecked)}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#893030',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff7d5',
    textAlign: 'center',
    paddingBottom: 5,
    borderBottomWidth: 3,
    borderBottomColor: '#4d231f',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  subheading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff7d5',
    marginBottom: 10,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#4d231f',
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  text:{
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4d231f',
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    left: 100,
  },
  button: {
    backgroundColor: '#fff7d5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#893030',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

