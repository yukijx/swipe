//import React from 'react';
import React, {useState} from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';
// import { useRouter } from 'expo-router'; // Use useRouter for navigation

interface LoginResponse{
  success: boolean
  message: string
  userId?: number
  token?: string
}

export default function LoginScreen() {
  
  // const router = useRouter(); // Initialize router
  
  //state for username and passowrd
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handelLogin = async() => {
    try{
      ///for app
      //const response = await fetch('http://10.0.2.2:3000/login', 
      /// for browser
      const response = await fetch('http://localhost:3000/login',
      {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
      })
    
    if (!response.ok){
      throw new Error ('Invalid creds')
    }
    const data = (await response.json()) as LoginResponse

    console.log('Login success')
    //Home page
  } catch(error:any){
    console.log('login error', error.message)
  }
}
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

      <Button title="Enter" onPress={(handelLogin)} />
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
