import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/student/DashboardScreen';
import ScannerScreen from '../screens/student/ScannerScreen';
import CoursesScreen from '../screens/student/CoursesScreen';
import HistoryScreen from '../screens/student/HistoryScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4f46e5',
  white: '#ffffff',
  textMuted: '#71717a',
  border: '#e4e4e7',
};

const TabIcon = ({ label, focused }) => {
  const icons = {
    Dashboard: '▣',
    Scan: '⬡',
    Courses: '▤',
    History: '◉',
    Profile: '◈',
  };

  return (
    <View style={styles.iconContainer}>
      <Text
        style={[
          styles.iconText,
          { color: focused ? COLORS.primary : COLORS.textMuted },
        ]}
      >
        {icons[label] || '•'}
      </Text>
    </View>
  );
};

const StudentTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{ tabBarLabel: 'Courses' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
});

export default StudentTabs;