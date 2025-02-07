import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SecuritySettings = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  return (
    <View style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, color: textColor }}>Security & Privacy</Text>
      <Button title="Change Password" color="#893030" onPress={() => console.log('Change Password')} />
      <Button title="Enable 2FA" color="#893030" onPress={() => console.log('Enable 2FA')} />
      <Button title="Linked Accounts" color="#893030" onPress={() => console.log('Manage Linked Accounts')} />
      <Button title="Back" color="#893030" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default SecuritySettings;