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
    const Content = () => (
        <View style={[styles.content, contentContainerStyle]}>
            {children}
        </View>
    );

    return (
        <ThemedView>
            <NavBar navigation={navigation} />
            {scrollable ? (
                <ScrollView 
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Content />
                </ScrollView>
            ) : (
                <Content />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: Platform.OS === 'web' ? undefined : 1,
        maxWidth: Platform.OS === 'web' ? 1200 : undefined,
        width: '100%',
        marginHorizontal: 'auto',
        padding: 20,
        minHeight: Platform.OS === 'web' ? 'calc(100vh - 60px)' : undefined, // Account for navbar height
    },
}); 