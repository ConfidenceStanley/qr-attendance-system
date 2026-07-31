import React, { useState, useRef, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { enrolFace, cancelPendingAuth, clearFaceError } from '../../redux/slices/authSlice';

const { width } = Dimensions.get('window');
const FACE_BOX = width * 0.65;

const COLORS = {
  primary: '#4f46e5',
  white: '#ffffff',
  black: '#000000',
  success: '#10b981',
  danger: '#f43f5e',
  textMuted: '#71717a',
  overlay: 'rgba(0,0,0,0.6)',
};

const FaceEnrolScreen = () => {
  const dispatch = useDispatch();
  const { isFaceLoading, faceError, pendingAuth } = useSelector((state) => state.auth);

  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState(false);
  const [step, setStep] = useState('instructions'); // instructions | camera | processing | success
  const cameraRef = useRef(null);

  useEffect(() => {
    if (faceError) {
      // Reset so they can try again
      setCaptured(false);
      setStep('camera');
    }
  }, [faceError]);

  const handleCapture = async () => {
    if (!cameraRef.current || captured) return;
    setCaptured(true);
    setStep('processing');
    dispatch(clearFaceError());

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,        // lower quality = smaller payload
        skipProcessing: true,
      });

      const result = await dispatch(enrolFace({ imageBase64: photo.base64 }));

      if (enrolFace.fulfilled.match(result)) {
        setStep('success');
      } else {
        setCaptured(false);
        setStep('camera');
      }
    } catch (error) {
      setCaptured(false);
      setStep('camera');
      Alert.alert('Camera Error', 'Could not capture photo. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Setup?',
      'You must set up face ID to use QRoll. You will be logged out.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => dispatch(cancelPendingAuth()),
        },
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
            <View style={styles.permissionIconCircle}>
            <Text style={styles.permissionIcon}>📷</Text>
            </View>
            <Text style={styles.cardTitle}>Camera Access Needed</Text>
            <Text style={styles.cardText}>
            QRoll needs your camera to set up face verification.
            </Text>
            <TouchableOpacity
            style={styles.primaryBtn}
            onPress={requestPermission}
            >
            <Text style={styles.primaryBtnText}>Grant Camera Access</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={handleCancel}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
  }

  // Instructions screen
  if (step === 'instructions') {
    return (
      <View style={styles.instructionScreen}>
        <View style={styles.instructionContent}>
          {/* Icon */}
          <View style={styles.faceIconCircle}>
            <Text style={styles.faceIconText}>👤</Text>
          </View>

          <Text style={styles.instructionTitle}>Set Up Face ID</Text>
          <Text style={styles.instructionSubtitle}>
            This is a one-time setup. Your face will be used to verify your identity every time you log in.
          </Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>For best results:</Text>
            <Text style={styles.tipItem}>• Face the camera directly</Text>
            <Text style={styles.tipItem}>• Ensure good lighting</Text>
            <Text style={styles.tipItem}>• Remove glasses or hats</Text>
            <Text style={styles.tipItem}>• Keep a neutral expression</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep('camera')}
          >
            <Text style={styles.primaryBtnText}>Continue to Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={handleCancel}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success screen
  if (step === 'success') {
    return (
      <View style={styles.successScreen}>
        <View style={styles.card}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.cardTitle}>Face ID Set Up!</Text>
          <Text style={styles.cardText}>
            Your face has been enrolled. You will be asked to verify your face every time you log in.
          </Text>
          {/* authSlice already set faceEnrolled = true, AppNavigator will redirect to FaceVerify */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              // Trigger re-render — AppNavigator will now show FaceVerify
              dispatch(clearFaceError());
            }}
          >
            <Text style={styles.primaryBtnText}>Continue to Verification</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera + Processing screen
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      {/* Overlay */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayRow}>
        <View style={styles.overlaySide} />
        {/* Face oval cutout */}
        <View style={styles.faceBox}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topCloseBtn} onPress={handleCancel}>
          <Text style={styles.topCloseTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Enrol Face ID</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Error message */}
      {faceError && (
        <View style={styles.errorPill}>
          <Text style={styles.errorPillText}>{faceError}</Text>
        </View>
      )}

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {step === 'processing' ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.processingText}>Enrolling your face...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cameraHint}>
              Position your face inside the frame
            </Text>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
              disabled={captured}
            >
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', padding: 24 },

  // Overlay
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '20%', backgroundColor: COLORS.overlay },
  overlayRow: { position: 'absolute', top: '20%', left: 0, right: 0, height: FACE_BOX, flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: COLORS.overlay },
  overlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, top: `calc(20% + ${FACE_BOX}px)`, backgroundColor: COLORS.overlay },

  faceBox: {
    width: FACE_BOX,
    height: FACE_BOX,
    borderRadius: FACE_BOX / 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.primary },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  topBar: { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  topCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  topCloseTxt: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  topTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  errorPill: { position: 'absolute', top: 110, left: 24, right: 24, backgroundColor: 'rgba(244,63,94,0.9)', borderRadius: 10, padding: 12 },
  errorPillText: { color: COLORS.white, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  bottomControls: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  cameraHint: { color: COLORS.white, fontSize: 14, marginBottom: 24, opacity: 0.8 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.white },

  processingBox: { alignItems: 'center', gap: 12 },
  processingText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  // Instruction screen
  instructionScreen: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', padding: 24 },
  instructionContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: 28, alignItems: 'center', gap: 16 },
  faceIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  faceIconText: { fontSize: 40 },
  instructionTitle: { fontSize: 22, fontWeight: '800', color: '#18181b', letterSpacing: -0.5 },
  instructionSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  tipBox: { backgroundColor: '#f4f4f5', borderRadius: 12, padding: 16, width: '100%', gap: 6 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#18181b', marginBottom: 4 },
  tipItem: { fontSize: 13, color: '#52525b', lineHeight: 20 },

  // Success screen
  successScreen: { flex: 1, backgroundColor: COLORS.success, justifyContent: 'center', padding: 24 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  successIcon: { fontSize: 40, color: COLORS.white, fontWeight: '800' },

  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionIcon: {
    fontSize: 36,
  },

  // Shared card
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 32, alignItems: 'center', gap: 14 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#18181b', letterSpacing: -0.5, textAlign: 'center' },
  cardText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },

  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, width: '100%', alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  ghostBtn: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});

export default FaceEnrolScreen;