import * as React from 'react';
import { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Theme + Auth context
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuthContext } from '../context/AuthContext';

// Components
import NavBar from '../components/NavBar';

// Pages
import AppSettings from '../pages/AppSettings';
import ChangePassword from '../pages/ChangePassword';
import CreateFacultyProfile from '../pages/CreateFacultyProfile';
import CreateListing from '../pages/CreateListing';
import FacultyHome from '../pages/FacultyHome';
import FacultyMatches from '../pages/FacultyMatches';
import Filter from '../pages/Filter';
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
import StudentSwipeHistory from '../pages/StudentSwipeHistory';
import DeveloperSettings from '../components/DeveloperSettings';

// Navigation
import { StackParamList } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';

const Stack = createStackNavigator<StackParamList>();

export default function App() {
  useEffect(() => {
    const clearToken = async () => {
      try {
        await AsyncStorage.removeItem('token');
        console.log('[App] Cleared token on app startup');
      } catch (error) {
        console.error('[App] Error clearing token:', error);
      }
    };
    clearToken();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </ThemeProvider>
  );
}

const RootNavigator = () => {
  const { isAuthenticated, isFaculty, loading } = useAuthContext();
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(undefined);

  // Track navigation changes and update currentRoute
  useEffect(() => {
    const updateRoute = () => {
      const route = navigationRef.current?.getCurrentRoute();
      if (route?.name) {
        setCurrentRoute(route.name);
      }
    };

    const unsubscribe = navigationRef.current?.addListener('state', updateRoute);
    updateRoute(); // set on initial mount

    return () => unsubscribe?.();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#893030' }}>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold', marginBottom: 20 }}>Swipe</Text>
        <Text style={{ color: '#fff', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  const initialRoute: keyof StackParamList =
    isAuthenticated ? (isFaculty ? 'FacultyHome' : 'Home') : 'Login';

  // Define which routes should hide the NavBar
  const hideNavBarRoutes = ['Login', 'Register', 'ProfessorSetup', 'StudentSetup'];

  return (
    <View style={{ flex: 1 }}>
      {/* Conditionally render NavBar */}
      {!hideNavBarRoutes.includes(currentRoute ?? '') && (
        <NavBar navigation={navigationRef.current} />
      )}

      <View style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ProfessorSetup" component={ProfessorSetup} />
          <Stack.Screen name="StudentSetup" component={StudentSetup} />
          <Stack.Screen name="FacultyHome" component={FacultyHome} />
          <Stack.Screen name="Swipe" component={Swipe} />
          <Stack.Screen name="Matches" component={Matches} />
          <Stack.Screen name="FacultyMatches" component={FacultyMatches} />
          <Stack.Screen name="ListListings" component={ListListings} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
          <Stack.Screen name="AppSettings" component={AppSettings} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="CreateFacultyProfile" component={CreateFacultyProfile} />
          <Stack.Screen name="CreateListing" component={CreateListing} />
          <Stack.Screen name="Filter" component={Filter} />
          <Stack.Screen name="Listing" component={Listing} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="StudentInfo" component={StudentInfo} />
          <Stack.Screen name="Home" component={Swipe} />
          <Stack.Screen name="StudentSwipeHistory" component={StudentSwipeHistory} />
          <Stack.Screen name="DeveloperSettings" component={DeveloperSettings} />
        </Stack.Navigator>
      </View>
    </View>
  );
};
