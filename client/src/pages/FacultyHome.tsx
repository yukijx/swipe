import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { useTheme } from '../context/ThemeContext';

const FacultyHome = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const textColor = theme === 'light' ? '#893030' : '#ffffff';

    return (
        <ResponsiveScreen navigation={navigation}>
            <Text style={[styles.title, { color: textColor }]}>Faculty Dashboard</Text>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('CreateListing')}
                >
                    <Text style={styles.buttonText}>Create New Listing</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('ListListings')}
                >
                    <Text style={styles.buttonText}>View My Listings</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('ProfileSettings')}
                >
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
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
    buttonContainer: {
        padding: 20,
        gap: 15,
    },
    button: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default FacultyHome; 