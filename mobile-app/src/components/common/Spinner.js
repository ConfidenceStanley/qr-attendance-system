import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

const COLORS = {
  primary: '#4f46e5',
  textMuted: '#71717a',
  background: '#fafafa',
};

const Spinner = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default Spinner;