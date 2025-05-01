import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { deleteAccount } from '../utils/accountManagement';
import { useAuthContext } from '../context/AuthContext';
import WebAlert from '../components/WebAlert';

const SettingsSecurity = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { logout } = useAuthContext();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';
    const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

    const handleDeleteAccount = async () => {
        const success = await deleteAccount();
        if (success) {
            Alert.alert('Success', 'Your account has been deleted successfully.', [
                { text: 'OK', onPress: async () => {
                    await logout();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'AuthLogin' }],
                    });
                }}
            ]);
        } else {
            Alert.alert('Error', 'Failed to delete your account. Please try again later.');
        }
    };

    const confirmDeleteAccount = () => {
        if (Platform.OS === 'web') {
            setShowDeleteAlert(true);
        } else {
            Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Delete', 
                        onPress: handleDeleteAccount,
                        style: 'destructive'
                    }
                ]
            );
        }
    };

    const securityOptions = [
        {
            title: 'Change Password',
            description: 'Update your account password',
            onPress: () => navigation.navigate('AuthChangePassword'),
            icon: '🔑'
        },
        {
            title: 'Two-Factor Authentication',
            description: 'Add an extra layer of security',
            onPress: () => console.log('2FA Settings'),
            icon: '🔐'
        },
        {
            title: 'Login History',
            description: 'View your recent login activity',
            onPress: () => console.log('Login History'),
            icon: '📱'
        },
        {
            title: 'Privacy Settings',
            description: 'Control what others can see',
            onPress: () => navigation.navigate('SettingsPrivacy'),
            icon: '🔒'
        },
        {
            title: 'Connected Accounts',
            description: 'Manage linked accounts and services',
            onPress: () => console.log('Connected Accounts'),
            icon: '🔗'
        },
        {
            title: 'Data & Storage',
            description: 'Manage your data and storage settings',
            onPress: () => console.log('Data Settings'),
            icon: '💾'
        },
        {
            title: 'Delete Account',
            description: 'Permanently delete your account and all data',
            onPress: confirmDeleteAccount,
            icon: '⚠️'
        }
    ];

    return (
        <ResponsiveScreen navigation={navigation}>
            <Text style={[styles.title, { color: textColor }]}>Security Settings</Text>
            
            <View style={styles.optionsContainer}>
                {securityOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.option,
                            { backgroundColor: theme === 'light' ? '#ffffff' : '#333' },
                            option.title === 'Delete Account' && styles.dangerOption
                        ]}
                        onPress={option.onPress}
                    >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <View style={styles.optionTextContainer}>
                            <Text style={[
                                styles.optionTitle,
                                { color: option.title === 'Delete Account' ? 
                                    '#e74c3c' : (theme === 'light' ? '#893030' : '#ffffff') }
                            ]}>
                                {option.title}
                            </Text>
                            <Text style={[
                                styles.optionDescription,
                                { color: option.title === 'Delete Account' ?
                                    '#e74c3c99' : (theme === 'light' ? '#666666' : '#cccccc') }
                            ]}>
                                {option.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <WebAlert
                visible={showDeleteAlert}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone."
                buttons={[
                    {
                        text: 'Cancel',
                        onPress: () => setShowDeleteAlert(false),
                        style: 'cancel'
                    },
                    {
                        text: 'Delete',
                        onPress: () => {
                            setShowDeleteAlert(false);
                            handleDeleteAccount();
                        },
                        style: 'destructive'
                    }
                ]}
                onClose={() => setShowDeleteAlert(false)}
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
        } : {}),
    },
    dangerOption: {
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    optionIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
    }
});

export default SettingsSecurity;