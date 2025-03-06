import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemedView: React.FC<{ children: React.ReactNode, style?: any }> = ({ children, style }) => {
    const { theme } = useTheme();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme === 'light' ? '#fff7d5' : '#222',
                ...(Platform.OS === 'web' && {
                    minHeight: '100vh',
                    overflowX: 'hidden',
                })
            },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

