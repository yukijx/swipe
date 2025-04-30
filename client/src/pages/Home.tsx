import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { useTheme } from '../context/ThemeContext';

const Home = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();

  return (
    <ResponsiveScreen navigation={navigation}>
      <View style={styles.container}>
        {/* Updated Title */}
        <Text style={styles.title}>MENU</Text>

        {/* Updated Button Order */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Swipe')}
          >
            <Text style={styles.buttonText}>Browse Opportunities</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Matches')}
          >
            <Text style={styles.buttonText}>View My Matches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ResponsiveScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#893030',
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#893030',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;
