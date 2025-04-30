import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';


const SupportAbout = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, color: textColor }}>Support & About</Text>
      <Button title="About App" color="#893030" onPress={() => console.log('Show About App')} />
      <Button title="Feedback" color="#893030" onPress={() => console.log('Provide Feedback')} />
      <Button title="Back" color="#893030" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default SupportAbout;
