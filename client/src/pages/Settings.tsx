import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedView from '../components/ThemedView';
import NavBar from '../components/NavBar';
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import WebAlert from '../components/WebAlert';

const Settings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { logout, isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [showAlert, setShowAlert] = useState(false);

    const handleLogout = async () => {
        try {
            // First remove the token
            await AsyncStorage.removeItem('token');
            // Then call logout to update auth state
            await logout();
            // Finally navigate to login using replace instead of reset
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
        }
    };

    const confirmLogout = () => {
        if (Platform.OS === 'web') {
            setShowAlert(true);
        } else {
            Alert.alert(
                'Confirm Logout',
                'Are you sure you want to logout?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Logout', 
                        onPress: handleLogout,
                        style: 'destructive'
                    }
                ]
            );
        }
    };

    const settingsOptions = [
        {
            title: 'Profile Settings',
            onPress: () => navigation.navigate('ProfileSettings'),
            icon: '👤'
        },
        {
            title: 'App Settings',
            onPress: () => navigation.navigate('AppSettings'),
            icon: '⚙️'
        },
        {
            title: 'Security Settings',
            onPress: () => navigation.navigate('SecuritySettings'),
            icon: '🔒'
        },
        {
            title: isFaculty ? 'Manage Listings' : 'Manage Applications',
            onPress: () => navigation.navigate(isFaculty ? 'ListListings' : 'StudentInfo'),
            icon: '📋'
        },
        {
            title: 'Logout',
            onPress: confirmLogout,
            icon: '🚪'
        }
    ];

    return (
        <ResponsiveScreen navigation={navigation}>
            <Text style={[styles.title, { color: textColor }]}>Settings</Text>
            
            <View style={styles.optionsContainer}>
                {settingsOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.option,
                            { backgroundColor: theme === 'light' ? '#ffffff' : '#333' }
                        ]}
                        onPress={option.onPress}
                    >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text style={[
                            styles.optionText,
                            { color: theme === 'light' ? '#893030' : '#ffffff' }
                        ]}>
                            {option.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <WebAlert
                visible={showAlert}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                buttons={[
                    {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel'
                    },
                    {
                        text: 'Logout',
                        onPress: handleLogout,
                        style: 'destructive'
                    }
                ]}
                onClose={() => setShowAlert(false)}
            />
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: "#2E1512",
        borderWidth: Platform.OS === 'web' ? 0 : 10,
        borderRadius: Platform.OS === 'web' ? 0 : 30,
    },
    contentWrapper: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    optionsContainer: {
        padding: 20,
        gap: 15,
        ...(Platform.OS === 'web' ? {
            display: 'grid' as any,
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        } : {
            display: 'flex'
        }),
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        elevation: 3,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer' as any,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
        } : {}),
    },
    optionIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '500',
    }
});

export default Settings;