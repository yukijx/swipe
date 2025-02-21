import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveScreen } from '../components/ResponsiveScreen';

const AppSettings = ({ navigation }: { navigation: any }) => {
    const { theme, toggleTheme } = useTheme();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';

    const settingsOptions = [
        {
            title: 'Theme',
            description: 'Toggle Dark/Light Mode',
            onPress: toggleTheme,
            icon: '🎨'
        },
        {
            title: 'Language',
            description: 'Change application language',
            onPress: () => console.log('Change Language'),
            icon: '🌐'
        },
        {
            title: 'Notifications',
            description: 'Manage notification settings',
            onPress: () => navigation.navigate('NotificationSettings'),
            icon: '🔔'
        },
        {
            title: 'Display',
            description: 'Adjust display settings',
            onPress: () => console.log('Display Settings'),
            icon: '📱'
        }
    ];

    return (
        <ResponsiveScreen navigation={navigation}>
            <Text style={[styles.title, { color: textColor }]}>App Settings</Text>
            
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
                        <View style={styles.optionTextContainer}>
                            <Text style={[
                                styles.optionTitle,
                                { color: theme === 'light' ? '#893030' : '#ffffff' }
                            ]}>
                                {option.title}
                            </Text>
                            <Text style={[
                                styles.optionDescription,
                                { color: theme === 'light' ? '#666666' : '#cccccc' }
                            ]}>
                                {option.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
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

export default AppSettings;
