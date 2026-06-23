import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'present':
        return { bg: '#d1fae5', text: '#065f46', label: 'Present' };
      case 'absent':
        return { bg: '#fee2e2', text: '#991b1b', label: 'Absent' };
      case 'late':
        return { bg: '#fef3c7', text: '#92400e', label: 'Late' };
      default:
        return { bg: '#f4f4f5', text: '#71717a', label: status };
    }
  };

  const { bg, text, label } = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default StatusBadge;