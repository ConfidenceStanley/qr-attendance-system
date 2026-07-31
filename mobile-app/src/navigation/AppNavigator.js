import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import FaceEnrolScreen from '../screens/auth/FaceEnrolScreen';
import FaceVerifyScreen from '../screens/auth/FaceVerifyScreen';
import StudentTabs from './StudentTabs';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isRestoring, pendingAuth } = useSelector((state) => state.auth);

  if (isRestoring) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Fully authenticated — show main app
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
        ) : pendingAuth ? (
          // Password passed, face step next
          pendingAuth.user.faceEnrolled ? (
            <Stack.Screen name="FaceVerify" component={FaceVerifyScreen} />
          ) : (
            <Stack.Screen name="FaceEnrol" component={FaceEnrolScreen} />
          )
        ) : (
          // Not logged in at all
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;