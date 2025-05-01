import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const NavBar = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuthContext();

  const navItems = [
    { title: 'Home', onPress: () => navigation.navigate(isFaculty ? 'FacultyHome' : 'Home') },
    { title: isFaculty ? 'My Listings' : 'Browse', onPress: () => navigation.navigate(isFaculty ? 'ListListings' : 'Swipe') },
    { title: 'Profile', onPress: () => navigation.navigate('ProfileSettings') },
    { title: 'Settings', onPress: () => navigation.navigate('Settings') }
  ];

  return (
    <SafeAreaView style={{ backgroundColor: theme === 'light' ? '#893030' : '#222' }}>
      <View style={styles.container}>
        <Text style={styles.logo}>SWIPE</Text>

        <View style={styles.navItems}>
          {navItems.map((item, index) => {
            const [isHovered, setIsHovered] = useState(false);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.navItem,
                  Platform.OS === 'web' && isHovered ? styles.hoveredItem : null,
                ]}
                onPress={item.onPress}
                {...(Platform.OS === 'web' && {
                  onMouseEnter: () => setIsHovered(true),
                  onMouseLeave: () => setIsHovered(false),
                })}
              >
                <Text style={styles.navText}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 1,
    paddingHorizontal: 20,
    backgroundColor: '#893030',
    borderBottomWidth: 1,
    borderBottomColor: '#772828',
    alignItems: 'center',
  },
  logo: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  navItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Platform.OS === 'web' ? 24 : 16,
  },
  navItem: {
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  hoveredItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default NavBar;
