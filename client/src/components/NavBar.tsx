import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const NavBar = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const { isFaculty } = useAuthContext();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();


  // Font size and container width logic
  const fontSize = Platform.OS === 'web' ? width * 0.016 : width * 0.055;
  const containerWidth = Platform.OS === 'web' ? 1000 : width * 0.92;

  // Handle the back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme === 'light' ? '#893030' : '#893030',
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={[styles.inner, { width: containerWidth }]}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleBackPress}
        >
          <Text style={[styles.backIcon, { fontSize: fontSize * 1.8 }]}>‹</Text>
        </TouchableOpacity>
        
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate(isFaculty ? 'FacultyInterestedStudents' : 'StudentMatches')}
        >
          <Text style={[styles.logo, { fontSize: fontSize * 1.2 }]}>SWIPE</Text>
        </TouchableOpacity>
  
        {/* Menu Icon (☰) */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate(isFaculty ? 'HomeFaculty' : 'HomeStudent')}
        >
          <Text style={[styles.menuIcon, { fontSize: fontSize * 1.5 }]}>☰</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
};

const HoverableNavItem = ({
  title,
  onPress,
  fontSize,
}: {
  title: string;
  onPress: () => void;
  fontSize: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        Platform.OS === 'web' && isHovered ? styles.hoveredItem : null,
      ]}
      onPress={onPress}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      })}
    >
      <Text style={[styles.navText, { fontSize }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#893030',
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 20 : 10,
    paddingRight: 10,
  },
  navItem: {
    padding: 10,
    borderRadius: 5,
  },
  hoveredItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  menuIcon: {
    color: '#ffffff',
    fontWeight: 'bold',
  },  
});

export default NavBar;
