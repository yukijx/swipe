import React from 'react';
import { ScrollView, StyleSheet, Platform, View } from 'react-native';
import { ThemedView } from './ThemedView';
import NavBar from './NavBar';

interface ResponsiveScreenProps {
    children: React.ReactNode;
    navigation: any;
    scrollable?: boolean;
    contentContainerStyle?: any;
}

export const ResponsiveScreen = ({ 
    children, 
    navigation, 
    scrollable = true,
    contentContainerStyle 
}: ResponsiveScreenProps) => {
    return (
        <ThemedView>
            <NavBar navigation={navigation} />
            <ScrollView 
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    contentContainerStyle
                ]}
            >
                {children}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 1200 : undefined,
        marginHorizontal: 'auto',
        padding: 20,
    },
}); 