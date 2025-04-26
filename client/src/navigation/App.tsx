import * as React from 'react';
import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, TouchableOpacity, Text } from 'react-native';

//Import Theme
import { ThemeProvider } from '../context/ThemeContext';

//Import Components
import DebugPanel from '../components/DebugPanel';
import NavBar from '../components/NavBar';

//Import Screens
import AppSettings from '../pages/AppSettings';
import ChangePassword from '../pages/ChangePassword';
import CreateFacultyProfile from '../pages/CreateFacultyProfile';
import CreateListing from '../pages/CreateListing';
import FacultyHome from '../pages/FacultyHome';
import FacultyMatches from '../pages/FacultyMatches';
import Filter from '../pages/Filter';
import Home from '../pages/Home';
import Listing from '../pages/Listing';
import ListListings from '../pages/ListListings';
import Login from '../pages/Login';
import Matches from '../pages/Matches';
import PrivacySettings from '../pages/PrivacySettings';
import ProfessorSetup from '../pages/ProfessorSetup';
import ProfileSettings from '../pages/ProfileSettings';
import Register from '../pages/Register'; 
import Settings from '../pages/Settings';
import SecuritySettings from '../pages/SecuritySettings';
import StudentInfo from '../pages/StudentInfo';
import StudentSetup from '../pages/StudentSetup';
import Swipe from '../pages/Swipe';

//Import StackParamList 
import { StackParamList } from '../navigation/types'

//Import Navigation ref for external navigation actions
import { navigationRef } from '../navigation/navigationRef'

import { StackNavigationProp } from '@react-navigation/stack';

const Stack = createStackNavigator<StackParamList>();

export default function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && Platform.OS === 'web') {
      const handleKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'h':
            if (event.ctrlKey) navigationRef.current?.navigate('Home');
            break;
          case 'l':
            if (event.ctrlKey) navigationRef.current?.navigate('Login');
            break;
          case 's':
            if (event.ctrlKey) navigationRef.current?.navigate('Settings');
            break;
        }
      };
  
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  // Consistent header navigation options for main screens
  const getCommonHeaderRight = (navigation: any) => {
    return (
      <View style={{ flexDirection: 'row', marginRight: 15 }}>
        <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => navigation.navigate('Home')}>
          <Text style={{ color: '#fff' }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => navigation.navigate('Swipe')}>
          <Text style={{ color: '#fff' }}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => navigation.navigate('ProfileSettings')}>
          <Text style={{ color: '#fff' }}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => navigation.navigate('Settings')}>
          <Text style={{ color: '#fff' }}>Settings</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Common header style for consistency
  const commonHeaderStyle = {
    headerStyle: { backgroundColor: '#893030' },
    headerTitleStyle: { 
      color: '#fff', 
      fontWeight: 'bold' as const, 
      fontSize: 20 
    },
    headerTintColor: '#fff',
  };

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={Register} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ProfessorSetup" 
            component={ProfessorSetup} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="StudentSetup" 
            component={StudentSetup} 
            options={{ headerShown: false }}
          />
          
          {/* Main screens with consistent headers */}
          <Stack.Screen 
            name="Home" 
            component={Home} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "HOME",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          <Stack.Screen 
            name="FacultyHome" 
            component={FacultyHome} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "FACULTY HOME",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          <Stack.Screen 
            name="Swipe" 
            component={Swipe} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "SWIPE",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          <Stack.Screen 
            name="Matches" 
            component={Matches} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "MATCHES",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          <Stack.Screen 
            name="FacultyMatches" 
            component={FacultyMatches} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "FACULTY MATCHES",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          <Stack.Screen 
            name="ListListings" 
            component={ListListings} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "LISTINGS",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          <Stack.Screen 
            name="ProfileSettings" 
            component={ProfileSettings} 
            options={({ navigation }) => ({ 
              ...commonHeaderStyle,
              headerTitle: "PROFILE",
              headerRight: () => getCommonHeaderRight(navigation)
            })} 
          />
          
          {/* Other screens with standard headers */}
          <Stack.Screen 
            name="AppSettings" 
            component={AppSettings} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePassword} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="CreateFacultyProfile" 
            component={CreateFacultyProfile} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="CreateListing" 
            component={CreateListing} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="Filter" 
            component={Filter} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="Listing" 
            component={Listing} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="PrivacySettings" 
            component={PrivacySettings} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="SecuritySettings" 
            component={SecuritySettings} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="Settings" 
            component={Settings} 
            options={{ ...commonHeaderStyle }}
          />
          <Stack.Screen 
            name="StudentInfo" 
            component={StudentInfo} 
            options={{ ...commonHeaderStyle }}
          />
        </Stack.Navigator>
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </NavigationContainer>
    </ThemeProvider>
  );
}