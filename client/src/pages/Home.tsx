import React from 'react';
import { View, Text, Button } from 'react-native';
import useAuth from '../hooks/useAuth';

const Home = ({ navigation }: { navigation: any }) => {
  useAuth(); // Ensures authentication

  return (
    <View>
      <Text>Welcome to Home Page!</Text>
      <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
};

export default Home;
