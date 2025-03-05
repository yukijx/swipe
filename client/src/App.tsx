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
import StudentProfileSettings from './pages/StudentProfileSettings';
import UpdateStudentProfile from './pages/UpdateStudentProfile';
import Home from './pages/Home';
import CreateFacultyProfile from './pages/CreateFacultyProfile';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import ListListings from './pages/ListListings';

// this will be the normal home page but i wanted an easy way to see all the pages

export type StackParamList = {
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  ProfileSettings: undefined;
  SecuritySettings: undefined;
  AppSettings: undefined;
  StudentInfo: undefined;
  StudentProfileSettings: undefined;
  UpdateStudentProfile: undefined;
  Home: undefined;
  CreateFacultyProfile: undefined;
  CreateListing: undefined;
  Listing: undefined;
  ListListings: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
          <Stack.Navigator initialRouteName="Settings">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
          <Stack.Screen name="AppSettings" component={AppSettings} />
          <Stack.Screen name="StudentInfo" component={StudentInfo} />
          <Stack.Screen name="StudentProfileSettings" component={StudentProfileSettings} />
          <Stack.Screen name="UpdateStudentProfile" component={UpdateStudentProfile} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="CreateFacultyProfile" component={CreateFacultyProfile} />
          <Stack.Screen name="CreateListing" component={CreateListing} />
          <Stack.Screen name="Listing" component={Listing} />
          <Stack.Screen name="ListListings" component={ListListings} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
