import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '../../redux/slices/authSlice';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#4f46e5',
  primaryDark: '#3730a3',
  white: '#ffffff',
  light: '#e0e7ff',
};

const SplashScreen = () => {
  const dispatch = useDispatch();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Restore session after animation
    const timer = setTimeout(() => {
      dispatch(restoreSession());
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>QR</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>QRoll</Text>
        <Text style={styles.tagline}>Smart Attendance System</Text>
      </Animated.View>

      {/* Bottom text */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        <Text style={styles.bottomText}>HND Computer Science</Text>
        <Text style={styles.bottomSubText}>Final Year Project</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.light,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottom: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 4,
  },
  bottomText: {
    fontSize: 13,
    color: COLORS.light,
    fontWeight: '500',
  },
  bottomSubText: {
    fontSize: 12,
    color: COLORS.light,
    opacity: 0.7,
  },
});

export default SplashScreen;