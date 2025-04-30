import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DebugPanel = () => {
    const { isAuthenticated, isFaculty } = useAuthContext();

    const checkToken = async () => {
        const token = await AsyncStorage.getItem('token');
        console.log('Current Token:', token);
    };

    const checkState = () => {
        console.log('Auth State:', { isAuthenticated, isFaculty });
    };

    return process.env.NODE_ENV === 'development' ? (
        <View style={styles.container}>
            <Text style={styles.title}>Debug Panel</Text>
            <Text style={styles.info}>isAuthenticated: {String(isAuthenticated)}</Text>
            <Text style={styles.info}>isFaculty: {String(isFaculty)}</Text>
            <TouchableOpacity style={styles.button} onPress={checkToken}>
                <Text style={styles.buttonText}>Log Token</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={checkState}>
                <Text style={styles.buttonText}>Log State</Text>
            </TouchableOpacity>
        </View>
    ) : null;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        zIndex: 1000,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    info: {
        color: 'white',
        fontSize: 12,
    },
    button: {
        backgroundColor: '#893030',
        padding: 5,
        borderRadius: 3,
        marginTop: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    }
});

export default DebugPanel; 