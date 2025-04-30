import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const StudentProfileSettings = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#222';
  const textColor = theme === 'light' ? '#893030' : '#ffffff';

  const [showProfilePic, setShowProfilePic] = useState(true);
  const [showResume, setShowResume] = useState(true);
  const [publicPosts, setPublicPosts] = useState(true);

  const handleSaveSettings = () => {
    // Logic to save privacy settings
    console.log('Privacy settings saved', { showProfilePic, showResume, publicPosts });
    navigation.goBack();
  };

  return (
    <ScrollView style={{ backgroundColor, flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, color: textColor, textAlign: 'center', marginBottom: 20 }}>Profile Settings</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: textColor }}>Show Profile Picture</Text>
        <Switch
          value={showProfilePic}
          onValueChange={setShowProfilePic}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: textColor }}>Show Resume</Text>
        <Switch
          value={showResume}
          onValueChange={setShowResume}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: textColor }}>Public Posts</Text>
        <Switch
          value={publicPosts}
          onValueChange={setPublicPosts}
        />
      </View>

      <Button title="Save Settings" color="#893030" onPress={handleSaveSettings} />
      <Button title="Back" color="#893030" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

export default StudentProfileSettings;