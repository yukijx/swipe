import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const AppSettings = ({ navigation }: { navigation: any }) => {
  const { theme, toggleTheme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, color: textColor }}>App Settings</Text>
      <Button title="Toggle Dark/Light Mode" color="#893030" onPress={toggleTheme} />
      <Button title="Language" color="#893030" onPress={() => console.log('Change Language')} />
      <Button title="Notification Settings" color="#893030" onPress={() => navigation.navigate('NotificationSettings')} />
      <Button title="Back" color="#893030" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default AppSettings;