import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Camera Permission Required',
      'QRoll needs camera access to scan attendance QR codes. Please enable it in your device settings.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Location Permission Required',
      'QRoll needs your location to verify you are physically in the classroom. Please enable location access in settings.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw new Error('Could not get your location. Please ensure GPS is enabled.');
  }
};