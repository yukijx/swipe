import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './context/ThemeContext';
import NavBar from './components/NavBar';
import Settings from './pages/Settings';
import ProfileSettings from './pages/ProfileSettings';
import SecuritySettings from './pages/SecuritySettings';
import AppSettings from './pages/AppSettings';
import Login from './pages/Login';
import Register from './pages/Register'; 
import StudentInfo from './pages/StudentInfo';
import Home from './pages/Home';
import CreateFacultyProfile from './pages/CreateFacultyProfile';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import ListListings from './pages/ListListings';
import FacultyHome from './pages/FacultyHome';
import StudentSetup from './pages/StudentSetup';
import ProfessorSetup from './pages/ProfessorSetup';
import { useEffect } from 'react';
import DebugPanel from './components/DebugPanel';
import Swipe from './pages/Swipe';

// this will be the normal home page but i wanted an easy way to see all the pages

export type StackParamList = {
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  ProfileSettings: undefined;
  SecuritySettings: undefined;
  AppSettings: undefined;
  StudentInfo: undefined;
  Home: undefined;
  CreateFacultyProfile: undefined;
  CreateListing: undefined;
  Listing: undefined;
  ListListings: undefined;
  FacultyHome: undefined;
  StudentSetup: undefined;
  ProfessorSetup: undefined;
  Swipe: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (event: KeyboardEvent) => {
        // Add keyboard shortcuts for development
        switch(event.key) {
          case 'h':
            if (event.ctrlKey) navigation.navigate('Home');
            break;
          case 'l':
            if (event.ctrlKey) navigation.navigate('Login');
            break;
          case 's':
            if (event.ctrlKey) navigation.navigate('Settings');
            break;
          // Add more shortcuts as needed
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
          <Stack.Screen name="AppSettings" component={AppSettings} />
          <Stack.Screen name="StudentInfo" component={StudentInfo} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="CreateFacultyProfile" component={CreateFacultyProfile} />
          <Stack.Screen name="CreateListing" component={CreateListing} />
          <Stack.Screen name="Listing" component={Listing} />
          <Stack.Screen name="ListListings" component={ListListings} />
          <Stack.Screen name="FacultyHome" component={FacultyHome} />
          <Stack.Screen name="StudentSetup" component={StudentSetup} />
          <Stack.Screen name="ProfessorSetup" component={ProfessorSetup} />
          <Stack.Screen 
            name="Swipe" 
            component={Swipe}
            options={{
              headerShown: false
            }}
          />
        </Stack.Navigator>
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </NavigationContainer>
    </ThemeProvider>
  );
}
