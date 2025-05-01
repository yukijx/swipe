import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import ThemedView from '../components/ThemedView';
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
        <ThemedView style={styles.container}>
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
