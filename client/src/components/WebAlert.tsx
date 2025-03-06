import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';

interface WebAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons: {
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }[];
    onClose: () => void;
}

const WebAlert = ({ visible, title, message, buttons, onClose }: WebAlertProps) => {
    return (
        <Modal
            visible={visible && Platform.OS === 'web'}
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'destructive' && styles.destructiveButton,
                                    button.style === 'cancel' && styles.cancelButton
                                ]}
                                onPress={() => {
                                    button.onPress();
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    button.style === 'destructive' && styles.destructiveText,
                                    button.style === 'cancel' && styles.cancelText
                                ]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        minWidth: 300,
        maxWidth: '90%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#000',
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        minWidth: 100,
        backgroundColor: '#893030',
    },
    destructiveButton: {
        backgroundColor: '#dc3545',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    destructiveText: {
        color: 'white',
    },
    cancelText: {
        color: 'white',
    },
});

export default WebAlert; 