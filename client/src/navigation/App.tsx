import * as React from 'react';
import { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BackArrow from '../components/BackArrow'; // adjust path if needed

// Theme + Auth context
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuthContext } from '../context/AuthContext';

// Components
import NavBar from '../components/NavBar';

// Auth pages
import AuthLogin from '../pages/AuthLogin';
import AuthRegister from '../pages/AuthRegister';
import AuthChangePassword from '../pages/AuthChangePassword';

// Profile pages
import ProfileSetupStudent from '../pages/ProfileSetupStudent';
import ProfileSetupFaculty from '../pages/ProfileSetupFaculty';
import ProfileManagement from '../pages/ProfileManagement';
import ProfileView from '../pages/ProfileView';

// Home pages
import HomeStudent from '../pages/HomeStudent';
import HomeFaculty from '../pages/HomeFaculty';

// Listing pages
import ListingCreate from '../pages/ListingCreate';
import ListingManagement from '../pages/ListingManagement';
import ListingDetail from '../pages/ListingDetail';
import ListingFilter from '../pages/ListingFilter';

// Match & Swipe pages
import SwipeCards from '../pages/SwipeCards';
import StudentMatches from '../pages/StudentMatches';
import FacultyInterestedStudents from '../pages/FacultyInterestedStudents';
import StudentSwipeHistory from '../pages/StudentSwipeHistory';

// Settings pages
import SettingsMain from '../pages/SettingsMain';
import SettingsApplication from '../pages/SettingsApplication';
import SettingsSecurity from '../pages/SettingsSecurity';
import SettingsPrivacy from '../pages/SettingsPrivacy';

// Developer tools
import DeveloperSettings from '../components/DeveloperSettings';

// Navigation
// import { StackParamList } from './types';
import { navigationRef } from './navigationRef';

// Using `any` to fix TypeScript errors after file renaming
const Stack = createStackNavigator<any>();

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

  // Use string type without explicit type checking
  const initialRoute = isAuthenticated ? (isFaculty ? 'HomeFaculty' : 'HomeStudent') : 'AuthLogin';

  // Define which routes should hide the NavBar
  const hideNavBarRoutes = ['AuthLogin', 'AuthRegister', 'ProfileSetupFaculty', 'ProfileSetupStudent'];
  
  const showBackArrowRoutes = [
    'SettingsMain',
    'SettingsApplication',
    'SettingsSecurity',
    'SettingsPrivacy',
    'ListingCreate',
    'ListingDetail',
    'ListingFilter',
    'ProfileManagement',
    'ProfileView',
    'StudentMatches',
    'FacultyInterestedStudents',
    'StudentSwipeHistory',
    'DeveloperSettings',
    'AuthChangePassword',
    'ListingManagement',
    // Add others where back nav is appropriate
  ];
  
  return (
    <View style={{ flex: 1 }}>
      {/* Conditionally render NavBar */}
      {!hideNavBarRoutes.includes(currentRoute ?? '') && (
        <NavBar navigation={navigationRef.current} />
      )}

      <View style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          {/* Auth Screens */}
          <Stack.Screen name="AuthLogin" component={AuthLogin} />
          <Stack.Screen name="AuthRegister" component={AuthRegister} />
          <Stack.Screen name="AuthChangePassword" component={AuthChangePassword} />
          
          {/* Profile Setup & Management */}
          <Stack.Screen name="ProfileSetupStudent" component={ProfileSetupStudent} />
          <Stack.Screen name="ProfileSetupFaculty" component={ProfileSetupFaculty} />
          <Stack.Screen name="ProfileManagement" component={ProfileManagement} />
          <Stack.Screen name="ProfileView" component={ProfileView} />
          
          {/* Home Screens */}
          <Stack.Screen name="HomeStudent" component={HomeStudent} />
          <Stack.Screen name="HomeFaculty" component={HomeFaculty} />
          
          {/* Listing Management */}
          <Stack.Screen name="ListingCreate" component={ListingCreate} />
          <Stack.Screen name="ListingManagement" component={ListingManagement} />
          <Stack.Screen name="ListingDetail" component={ListingDetail} />
          <Stack.Screen name="ListingFilter" component={ListingFilter} />
          
          {/* Match & Swipe Related */}
          <Stack.Screen name="SwipeCards" component={SwipeCards} />
          <Stack.Screen name="StudentMatches" component={StudentMatches} />
          <Stack.Screen name="FacultyInterestedStudents" component={FacultyInterestedStudents} />
          <Stack.Screen name="StudentSwipeHistory" component={StudentSwipeHistory} />
          
          {/* Settings Pages */}
          <Stack.Screen name="SettingsMain" component={SettingsMain} />
          <Stack.Screen name="SettingsApplication" component={SettingsApplication} />
          <Stack.Screen name="SettingsSecurity" component={SettingsSecurity} />
          <Stack.Screen name="SettingsPrivacy" component={SettingsPrivacy} />
          
          {/* Developer Tools */}
          <Stack.Screen name="DeveloperSettings" component={DeveloperSettings} />
        </Stack.Navigator>
      </View>
    </View>
  );
}; 