import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    style?: any;
}

export const ResponsiveContainer = ({ children, style }: ResponsiveContainerProps) => {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxWidth: Platform.OS === 'web' ? 1200 : undefined,
        width: '100%',
        marginHorizontal: 'auto',
        padding: Platform.OS === 'web' ? 20 : 0,
    },
}); 