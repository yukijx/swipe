import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ResponsiveScreen } from '../components/ResponsiveScreen';
import { useTheme } from '../context/ThemeContext';

const Home = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    
    return (
        <ResponsiveScreen navigation={navigation}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Swipe')}
                >
                    <Text style={styles.buttonText}>Browse Opportunities</Text>
                </TouchableOpacity>
            </View>
        </ResponsiveScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#893030',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        maxWidth: 500,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default Home;
