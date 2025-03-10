import * as React from 'react';
import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';

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
import Filter from '../pages/Filter';
import Home from '../pages/Home';
import Listing from '../pages/Listing';
import ListListings from '../pages/ListListings';
import Login from '../pages/Login';
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

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="AppSettings" component={AppSettings} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="CreateFacultyProfile" component={CreateFacultyProfile} />
          <Stack.Screen name="CreateListing" component={CreateListing} />
          <Stack.Screen name="FacultyHome" component={FacultyHome} />
          <Stack.Screen name="Filter" component={Filter} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Listing" component={Listing} />
          <Stack.Screen name="ListListings" component={ListListings} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
          <Stack.Screen name="ProfessorSetup" component={ProfessorSetup} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="StudentInfo" component={StudentInfo} />
          <Stack.Screen name="StudentSetup" component={StudentSetup} />
          <Stack.Screen 
            name="Swipe" 
            component={Swipe} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </NavigationContainer>
    </ThemeProvider>
  );
}