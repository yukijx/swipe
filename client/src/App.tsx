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

// this will be the normal home page but i wanted an easy way to see all the pages

export type StackParamList = {
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  ProfileSettings: undefined;
  SecuritySettings: undefined;
  AppSettings: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function App() {
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
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
