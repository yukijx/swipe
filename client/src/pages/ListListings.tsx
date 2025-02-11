import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ListListings(){

     return (
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Listings</Text>
          </View>
        </View>
    );
};
          
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#893030',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    titleContainer: {
        marginTop: 10,
        marginBottom: 50,
        alignItems: 'center',
    }, 
    title: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#fff7d5',
        textAlign: 'center',
        paddingBottom: 5,
        borderBottomWidth: 3,
        borderBottomColor: '#4d231f',
    },           
});