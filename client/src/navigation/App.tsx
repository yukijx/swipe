import * as React from 'react';
import { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Import Theme
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuthContext } from '../context/AuthContext';

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

// Add a wrapper component for protected routes
const ProtectedRoute = ({ component: Component, isAuthenticated, ...rest }: any) => {
  if (!isAuthenticated) {
    // Redirect to login screen
    return <Login {...rest} />;
  }
  
  return <Component {...rest} />;
};

// Main App component with correct provider hierarchy
export default function App() {
  // Clear token on app startup
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
        <AuthProvider>
          {/* Use a simpler approach with a single root navigator */}
          <RootNavigator />
          {process.env.NODE_ENV === 'development' && <DebugPanel />}
        </AuthProvider>
      </NavigationContainer>
    </ThemeProvider>
  );
}

// A simpler approach with a single root navigator
const RootNavigator = () => {
  const { isAuthenticated, isFaculty, loading } = useAuthContext();
  
  console.log('[RootNavigator] Auth state:', { isAuthenticated, isFaculty, loading });
  
  // Force initial route to always be login regardless of auth state
  // This ensures we always start at login and let the auth protection handle redirects
  const initialRoute = "Login";
  
  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#893030' 
      }}>
        <Text style={{ 
          color: '#fff', 
          fontSize: 30, 
          fontWeight: 'bold',
          marginBottom: 20 
        }}>
          Swipe
        </Text>
        <Text style={{ 
          color: '#fff', 
          fontSize: 16 
        }}>
          Loading...
        </Text>
      </View>
    );
  }
  
  // Helper function to wrap components with protection
  const protect = (Component: any) => (props: any) => (
    <ProtectedRoute 
      component={Component} 
      isAuthenticated={isAuthenticated} 
      {...props} 
    />
  );
  
  return (
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* Always define all screens */}
      {/* Unauthenticated screens */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      
      {/* Setup screens */}
      <Stack.Screen name="ProfessorSetup" component={ProfessorSetup} />
      <Stack.Screen name="StudentSetup" component={StudentSetup} />
      
      {/* Home screens */}
      <Stack.Screen 
        name="FacultyHome" 
        component={FacultyHome} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle,
          headerShown: true,
          headerTitle: "FACULTY HOME",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle,
          headerShown: true,
          headerTitle: "HOME",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      
      {/* Common screens for authenticated users */}
      <Stack.Screen 
        name="Swipe" 
        component={Swipe} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle, 
          headerShown: true,
          headerTitle: "SWIPE",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      
      <Stack.Screen 
        name="Matches" 
        component={Matches} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle, 
          headerShown: true,
          headerTitle: "MATCHES",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      
      <Stack.Screen 
        name="FacultyMatches" 
        component={FacultyMatches} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle,
          headerShown: true, 
          headerTitle: "FACULTY MATCHES",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      
      <Stack.Screen 
        name="ListListings" 
        component={ListListings} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle,
          headerShown: true, 
          headerTitle: "LISTINGS",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      
      <Stack.Screen 
        name="ProfileSettings" 
        component={ProfileSettings} 
        options={({ navigation }) => ({ 
          ...commonHeaderStyle,
          headerShown: true, 
          headerTitle: "PROFILE",
          headerRight: () => getCommonHeaderRight(navigation)
        })} 
      />
      
      <Stack.Screen name="AppSettings" component={AppSettings} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="CreateFacultyProfile" component={CreateFacultyProfile} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="CreateListing" component={CreateListing} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="Filter" component={Filter} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="Listing" component={Listing} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="Settings" component={Settings} options={{ ...commonHeaderStyle, headerShown: true }} />
      <Stack.Screen name="StudentInfo" component={StudentInfo} options={{ ...commonHeaderStyle, headerShown: true }} />
    </Stack.Navigator>
  );
};