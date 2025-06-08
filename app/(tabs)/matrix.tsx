import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MatrixScreen() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f5fe',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: '#000000',
    },
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Eisenhower Matrix</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
} 