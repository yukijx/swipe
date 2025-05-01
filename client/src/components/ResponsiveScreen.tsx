import React from 'react';
import { ScrollView, StyleSheet, Platform, View } from 'react-native';
import ThemedView from '../components/ThemedView';
import BackArrow from './BackArrow';

interface ResponsiveScreenProps {
    children: React.ReactNode;
    navigation: any;
    scrollable?: boolean;
    contentContainerStyle?: any;
    showBackArrow?: boolean;
}

export const ResponsiveScreen = ({ 
    children, 
    navigation, 
    scrollable = true,
    contentContainerStyle,
    showBackArrow = false
}: ResponsiveScreenProps) => {
    return (
        <ThemedView style={styles.container}>
            {showBackArrow && <BackArrow />}
            {scrollable ? (
                <ScrollView 
                    style={styles.scroll}
                    contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                >
                    {children}
                </ScrollView>
            ) : (
                <>{children}</>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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

export default ResponsiveScreen; // ✅ Ensure export is present
