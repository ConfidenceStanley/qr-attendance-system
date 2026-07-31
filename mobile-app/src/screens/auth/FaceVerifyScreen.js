import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useDispatch, useSelector } from 'react-redux';
import { verifyFace, cancelPendingAuth, clearFaceError } from '../../redux/slices/authSlice';

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

const MAX_ATTEMPTS = 3;

const FaceVerifyScreen = () => {
  const dispatch = useDispatch();
  const { isFaceLoading, faceError, pendingAuth } = useSelector((state) => state.auth);

  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation on the capture button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Reset captured state when error comes back
  useEffect(() => {
    if (faceError) setCaptured(false);
  }, [faceError]);

  const handleVerify = async () => {
    if (!cameraRef.current || captured || locked) return;
    setCaptured(true);
    dispatch(clearFaceError());

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: true,
      });

      const result = await dispatch(verifyFace({ imageBase64: photo.base64 }));

      if (verifyFace.rejected.match(result)) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setCaptured(false);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLocked(true);
        }
      }
      // If fulfilled, authSlice sets isAuthenticated = true and AppNavigator navigates automatically
    } catch (error) {
      setCaptured(false);
      Alert.alert('Camera Error', 'Could not capture photo. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Login?',
      'You will be returned to the login screen.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Cancel Login',
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
            QRoll needs your camera to verify your identity before login.
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

  // Locked out after 3 failed attempts
  if (locked) {
    return (
      <View style={styles.lockedScreen}>
        <View style={styles.card}>
          <View style={styles.lockedCircle}>
            <Text style={styles.lockedIcon}>🔒</Text>
          </View>
          <Text style={styles.cardTitle}>Account Locked</Text>
          <Text style={styles.cardText}>
            Too many failed face verification attempts. Please contact your admin or try again later.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: COLORS.danger }]}
            onPress={() => dispatch(cancelPendingAuth())}
          >
            <Text style={styles.primaryBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      {/* Dark overlay */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayRow}>
        <View style={styles.overlaySide} />
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
        <Text style={styles.topTitle}>Face Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Attempt counter */}
      {attempts > 0 && (
        <View style={styles.attemptPill}>
          <Text style={styles.attemptText}>
            {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      {/* Error message */}
      {faceError && (
        <View style={styles.errorPill}>
          <Text style={styles.errorPillText}>{faceError}</Text>
        </View>
      )}

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {isFaceLoading ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.processingText}>Verifying your face...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cameraHint}>
              {attempts === 0
                ? 'Look directly at the camera'
                : 'Ensure good lighting and try again'}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={handleVerify}
                disabled={captured}
              >
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.captureLabel}>Tap to verify</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', padding: 24 },

  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '20%', backgroundColor: COLORS.overlay },
  overlayRow: { position: 'absolute', top: '20%', left: 0, right: 0, height: FACE_BOX, flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: COLORS.overlay },
  overlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, top: `calc(20% + ${FACE_BOX}px)`, backgroundColor: COLORS.overlay },

  faceBox: { width: FACE_BOX, height: FACE_BOX, borderRadius: FACE_BOX / 2, overflow: 'hidden', backgroundColor: 'transparent' },

  corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.primary },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  topBar: { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  topCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  topCloseTxt: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  topTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  attemptPill: { position: 'absolute', top: 108, left: 24, right: 24, backgroundColor: 'rgba(245,158,11,0.9)', borderRadius: 10, padding: 10, alignItems: 'center' },
  attemptText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },

  errorPill: { position: 'absolute', top: faceError => attempts > 0 ? 150 : 108, left: 24, right: 24, backgroundColor: 'rgba(244,63,94,0.9)', borderRadius: 10, padding: 12 },
  errorPillText: { color: COLORS.white, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  bottomControls: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', gap: 16 },
  cameraHint: { color: COLORS.white, fontSize: 14, opacity: 0.8 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.white },
  captureLabel: { color: COLORS.white, fontSize: 12, opacity: 0.6 },

  processingBox: { alignItems: 'center', gap: 12 },
  processingText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  lockedScreen: { flex: 1, backgroundColor: COLORS.danger, justifyContent: 'center', padding: 24 },
  lockedCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  lockedIcon: { fontSize: 40 },

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

  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 28, alignItems: 'center', gap: 14 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#18181b', letterSpacing: -0.5, textAlign: 'center' },
  cardText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },

  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  ghostBtn: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});

export default FaceVerifyScreen;