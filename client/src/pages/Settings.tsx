import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import WebAlert from '../components/WebAlert';
import { deleteAccount } from '../utils/deleteAccount';

const Settings = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { logout, isFaculty } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [showAlert, setShowAlert] = useState(false);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await logout();
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
                    { text: 'Logout', onPress: handleLogout, style: 'destructive' }
                ]
            );
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = Platform.OS === 'web'
            ? window.confirm('Are you sure you want to delete your account? This cannot be undone.')
            : true;

        if (!confirmed) return;

        const success = await deleteAccount();

        if (success) {
            await AsyncStorage.removeItem('token');
            await logout();
            navigation.replace('Login');
        } else {
            Alert.alert('Error', 'Failed to delete account. Please try again later.');
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
        },
        {
            title: 'Delete Account',
            onPress: () => {
              if (Platform.OS === 'web') {
                setShowAlert(true);
              } else {
                Alert.alert(
                  'Confirm Delete',
                  'Are you sure you want to permanently delete your account?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount }
                  ]
                );
              }
            },
            icon: '🗑️'
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
                    { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                    { text: 'Logout', onPress: handleLogout, style: 'destructive' }
                ]}
                onClose={() => setShowAlert(false)}
            />
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    optionsContainer: {
        padding: 20,
        gap: 15,
        ...(Platform.OS === 'web'
            ? { display: 'grid' as any, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }
            : { display: 'flex' }),
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        elevation: 3,
        ...(Platform.OS === 'web'
            ? {
                cursor: 'pointer' as any,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
            }
            : {}),
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
