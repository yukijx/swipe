import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth';

const NavBar = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const { isFaculty } = useAuth();
    
    const navItems = [
        { title: 'Home', onPress: () => navigation.navigate(isFaculty ? 'FacultyHome' : 'Home') },
        { title: isFaculty ? 'My Listings' : 'Browse', onPress: () => navigation.navigate(isFaculty ? 'ListListings' : 'Swipe') },
        { title: 'Profile', onPress: () => navigation.navigate('ProfileSettings') },
        { title: 'Settings', onPress: () => navigation.navigate('Settings') }
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme === 'light' ? '#893030' : '#222' }]}>
            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.logoContainer}
                    onPress={() => navigation.navigate(isFaculty ? 'FacultyHome' : 'Home')}
                >
                    <Text style={styles.logo}>SWIPE</Text>
                </TouchableOpacity>

                <View style={styles.navItems}>
                    {navItems.map((item, index) => {
                        const [isHovered, setIsHovered] = useState(false);

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.navItem,
                                    Platform.OS === 'web' && isHovered ? styles.hoveredItem : null,
                                ]}
                                onPress={item.onPress}
                                {...(Platform.OS === 'web' && {
                                    onMouseEnter: () => setIsHovered(true),
                                    onMouseLeave: () => setIsHovered(false),
                                })}
                            >
                                <Text style={styles.navText}>{item.title}</Text>
                            </TouchableOpacity>
                        );
                    })}
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
    hoveredItem: {
        backgroundColor: 'rgba(255,255,255,0.1)', // ✅ Only applies on web
    },
    navText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default NavBar;
