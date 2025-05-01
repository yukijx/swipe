import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { testBackendConnection } from '../utils/testBackendConnection';
import { useNavigation } from '@react-navigation/native';
import ThemedView from '../components/ThemedView';
import { StackActions } from '@react-navigation/native';

const DevBackendTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    runTest();
  }, []);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testBackendConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test function threw an error',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#893030" />
          <Text style={styles.loadingText}>Testing connection...</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultContainer}>
          <View style={[
            styles.statusBanner, 
            testResult?.success ? styles.successBanner : styles.errorBanner
          ]}>
            <Text style={styles.statusText}>
              {testResult?.success ? '✅ Connected' : '❌ Connection Failed'}
            </Text>
          </View>
          
          <Text style={styles.urlText}>URL: {testResult?.url || 'Unknown'}</Text>
          <Text style={styles.messageText}>{testResult?.message}</Text>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Health Endpoint Response:</Text>
            <Text style={styles.detailsText}>
              {testResult?.details ? JSON.stringify(testResult.details, null, 2) : 'No details available'}
            </Text>
          </View>
          
          {testResult?.connectionLogDetails && (
            <View style={[styles.detailsContainer, { marginTop: 15 }]}>
              <Text style={styles.detailsTitle}>Connection Log Response:</Text>
              <Text style={styles.detailsText}>
                {JSON.stringify(testResult.connectionLogDetails, null, 2)}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={runTest}>
          <Text style={styles.buttonText}>Test Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.dispatch(StackActions.popToTop())}>
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#893030',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  resultContainer: {
    flex: 1,
    marginBottom: 20,
  },
  statusBanner: {
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  errorBanner: {
    backgroundColor: '#fff0f0',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  urlText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 20,
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#893030',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DevBackendTest; 