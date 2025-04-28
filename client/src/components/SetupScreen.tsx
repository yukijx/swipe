import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import ThemedView from './ThemedView';

interface SetupScreenProps {
    children: React.ReactNode;
    navigation: any;
    scrollable?: boolean;
    contentContainerStyle?: any;
}

/**
 * A responsive screen container without navigation bar for setup pages
 */
export const SetupScreen = ({ 
    children, 
    navigation, 
    scrollable = true,
    contentContainerStyle 
}: SetupScreenProps) => {
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

export default SetupScreen; 