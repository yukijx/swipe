import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth';

const NavBar = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    
    const navItems = [
        {
            title: 'Home',
            onPress: () => navigation.navigate(isFaculty ? 'FacultyHome' : 'Home')
        },
        {
            title: isFaculty ? 'My Listings' : 'Browse',
            onPress: () => navigation.navigate(isFaculty ? 'ListListings' : 'Swipe')
        },
        {
            title: 'Profile',
            onPress: () => navigation.navigate('ProfileSettings')
        },
        {
            title: 'Settings',
            onPress: () => navigation.navigate('Settings')
        }
    ];

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme === 'light' ? '#893030' : '#222' },
            Platform.OS === 'web' && styles.webContainer
        ]}>
            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.logoContainer}
                    onPress={() => navigation.navigate(isFaculty ? 'FacultyHome' : 'Home')}
                >
                    <Text style={styles.logo}>SWIPE</Text>
                </TouchableOpacity>

                <View style={styles.navItems}>
                    {navItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.navItem,
                                Platform.OS === 'web' && styles.webNavItem
                            ]}
                            onPress={item.onPress}
                        >
                            <Text style={styles.navText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#893030',
    },
    webContainer: {
        position: 'sticky' as const,
        top: 0,
        zIndex: 1000,
    },
    content: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        padding: 10,
    },
    logo: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    navItems: {
        flexDirection: 'row',
        gap: Platform.OS === 'web' ? 20 : 10,
    },
    navItem: {
        padding: 10,
        borderRadius: 5,
    },
    webNavItem: {
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
        },
    },
    navText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default NavBar;
