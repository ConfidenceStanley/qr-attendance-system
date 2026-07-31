import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useDispatch } from 'react-redux';
import { enrolFace, cancelPendingAuth, clearFaceError } from '../../redux/slices/authSlice';

const { width, height } = Dimensions.get('window');
const FACE_BOX = width * 0.72;      
const OVAL_HEIGHT = FACE_BOX * 1.25;
const OVAL_TOP_OFFSET = (height - OVAL_HEIGHT) / 2 - 60;

const COLORS = {
  primary: '#4f46e5',
  white: '#ffffff',
  black: '#000000',
  success: '#10b981',
  danger: '#f43f5e',
  textMuted: '#71717a',
  overlay: 'rgba(0,0,0,0.65)',
};

const FaceEnrolScreen = () => {
  const dispatch = useDispatch();

  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const cameraRef = useRef(null);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    setLocalError(null);
    dispatch(clearFaceError());

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: true,
      });

      const result = await dispatch(enrolFace({ imageBase64: photo.base64 }));

      if (enrolFace.fulfilled.match(result)) {
        // authSlice sets pendingAuth.user.faceEnrolled = true
        // AppNavigator will automatically switch to FaceVerifyScreen
        // No extra state needed here — just let Redux drive navigation
      } else {
        setLocalError(result.payload || 'Enrolment failed. Please try again.');
        setIsCapturing(false);
      }
    } catch (error) {
      setLocalError('Could not capture photo. Please try again.');
      setIsCapturing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Setup?',
      'You must set up Face ID to use QRoll. You will be logged out.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => dispatch(cancelPendingAuth()) },
      ]
    );
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📷</Text>
          </View>
          <Text style={styles.cardTitle}>Camera Access Needed</Text>
          <Text style={styles.cardText}>
            QRoll needs your camera to set up face verification.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleCancel}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Instructions before opening camera
  if (showInstructions) {
    return (
      <View style={styles.instructionScreen}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>👤</Text>
          </View>
          <Text style={styles.cardTitle}>Set Up Face ID</Text>
          <Text style={styles.cardText}>
            One-time setup. Your face verifies your identity on every login.
          </Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>For best results:</Text>
            <Text style={styles.tipItem}>• Face the camera directly</Text>
            <Text style={styles.tipItem}>• Ensure good lighting</Text>
            <Text style={styles.tipItem}>• Remove glasses if possible</Text>
            <Text style={styles.tipItem}>• Keep a neutral expression</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowInstructions(false)}>
            <Text style={styles.primaryBtnText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleCancel}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera screen — always mounted, never unmounted on error
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      {/* Overlay with oval cutout */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.faceOval} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Corner guides */}
      <View pointerEvents="none" style={styles.cornersWrapper}>
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
          <Text style={styles.closeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Enrol Face ID</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Error stays on camera — camera never goes black */}
      {localError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{localError}</Text>
        </View>
      ) : null}

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {isCapturing ? (
          <>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.bottomHint}>Enrolling your face...</Text>
          </>
        ) : (
          <>
            <Text style={styles.bottomHint}>
              {localError ? 'Try again — position face in the oval' : 'Position your face in the oval'}
            </Text>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
            <Text style={styles.captureLabel}>Tap to capture</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f5', padding: 24 },
  instructionScreen: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', padding: 24 },

  overlayTop: { height: OVAL_TOP_OFFSET, backgroundColor: COLORS.overlay },
  overlayMiddle: { flexDirection: 'row', height: OVAL_HEIGHT },
  overlaySide: { flex: 1, backgroundColor: COLORS.overlay },
  faceOval: { width: FACE_BOX, height: OVAL_HEIGHT, borderRadius: FACE_BOX / 2, backgroundColor: 'transparent', overflow: 'hidden' },
  overlayBottom: { flex: 1, backgroundColor: COLORS.overlay },

  cornersWrapper: { position: 'absolute', top: '15%', alignSelf: 'center', width: FACE_BOX, height: OVAL_HEIGHT },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: COLORS.primary },
  cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  topBar: { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  closeTxt: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  topTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  errorBanner: { position: 'absolute', top: 110, left: 20, right: 20, backgroundColor: 'rgba(244,63,94,0.92)', borderRadius: 12, padding: 14 },
  errorBannerText: { color: COLORS.white, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },

  bottomControls: { position: 'absolute', bottom: 56, left: 0, right: 0, alignItems: 'center', gap: 14 },
  bottomHint: { color: COLORS.white, fontSize: 14, opacity: 0.85, textAlign: 'center', paddingHorizontal: 32 },
  captureBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.white },
  captureLabel: { color: COLORS.white, fontSize: 12, opacity: 0.6 },

  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 32, alignItems: 'center', gap: 14, width: '100%' },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  iconEmoji: { fontSize: 38 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#18181b', letterSpacing: -0.5, textAlign: 'center' },
  cardText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 21 },
  tipBox: { backgroundColor: '#f4f4f5', borderRadius: 12, padding: 16, width: '100%', gap: 6 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#18181b', marginBottom: 4 },
  tipItem: { fontSize: 13, color: '#52525b', lineHeight: 20 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, width: '100%', alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  ghostBtn: { paddingVertical: 14, width: '100%', alignItems: 'center' },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});

export default FaceEnrolScreen;