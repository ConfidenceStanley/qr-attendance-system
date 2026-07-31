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

const { width, height } = Dimensions.get('window');
const FACE_BOX = width * 0.72;         // bigger
const OVAL_HEIGHT = FACE_BOX * 1.25;
const MAX_ATTEMPTS = 3;

const COLORS = {
  primary: '#4f46e5',
  white: '#ffffff',
  black: '#000000',
  success: '#10b981',
  danger: '#f43f5e',
  textMuted: '#71717a',
  overlay: 'rgba(0,0,0,0.65)',
};

const FaceVerifyScreen = () => {
  const dispatch = useDispatch();

  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [cameraKey, setCameraKey] = useState(Date.now()); // forces remount
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleStartCamera = () => {
    // Force a fresh camera mount by changing the key
    setCameraKey(Date.now());
    setShowIntro(false);
  };

  const handleVerify = async () => {
    if (!cameraRef.current || isCapturing || locked) return;
    setIsCapturing(true);
    setLocalError(null);
    dispatch(clearFaceError());

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: true,
      });

      const result = await dispatch(verifyFace({ imageBase64: photo.base64 }));

      if (verifyFace.fulfilled.match(result)) {
        // Redux updates isAuthenticated → AppNavigator switches to Dashboard
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setIsCapturing(false);
        if (newAttempts >= MAX_ATTEMPTS) {
          setLocked(true);
        } else {
          setLocalError(result.payload || 'Face does not match. Please try again.');
        }
      }
    } catch (error) {
      setIsCapturing(false);
      setLocalError('Could not capture photo. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Login?',
      'You will be returned to the login screen.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Cancel Login', style: 'destructive', onPress: () => dispatch(cancelPendingAuth()) },
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
            QRoll needs your camera to verify your identity before login.
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

  if (locked) {
    return (
      <View style={styles.lockedScreen}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: '#fff1f2' }]}>
            <Text style={styles.iconEmoji}>🔒</Text>
          </View>
          <Text style={styles.cardTitle}>Too Many Attempts</Text>
          <Text style={styles.cardText}>
            Face verification failed {MAX_ATTEMPTS} times. Please contact your admin or try again later.
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

  // Intro screen forces fresh camera mount when user clicks continue
  if (showIntro) {
    return (
      <View style={styles.introScreen}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>
          <Text style={styles.cardTitle}>Verify Your Face</Text>
          <Text style={styles.cardText}>
            Position your face inside the oval and tap the capture button to log in.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStartCamera}>
            <Text style={styles.primaryBtnText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleCancel}>
            <Text style={styles.ghostBtnText}>Cancel Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* key forces full remount so camera activates cleanly */}
      <CameraView
        key={cameraKey}
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      {/* Overlay with centered oval */}
      <View pointerEvents="none" style={styles.overlayWrapper}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.faceOval} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Corner guides positioned over the oval */}
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
        <Text style={styles.topTitle}>Face Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {attempts > 0 && !localError && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningBannerText}>
            {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      {localError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{localError}</Text>
          {attempts > 0 && (
            <Text style={styles.errorBannerSub}>
              {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
            </Text>
          )}
        </View>
      ) : null}

      <View style={styles.bottomControls}>
        {isCapturing ? (
          <>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.bottomHint}>Verifying your face...</Text>
          </>
        ) : (
          <>
            <Text style={styles.bottomHint}>
              {localError ? 'Ensure good lighting and try again' : 'Look directly at the camera'}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleVerify}>
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

// Calculate positions to center the oval vertically on visible screen
const OVAL_TOP_OFFSET = (height - OVAL_HEIGHT) / 2 - 60; // slight shift up to leave room for buttons

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f5', padding: 24 },
  introScreen: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', padding: 24 },
  lockedScreen: { flex: 1, backgroundColor: COLORS.danger, justifyContent: 'center', padding: 24 },

  // Overlay — oval is now vertically centered on visible screen
  overlayWrapper: { ...StyleSheet.absoluteFillObject },
  overlayTop: { height: OVAL_TOP_OFFSET, backgroundColor: COLORS.overlay },
  overlayMiddle: { flexDirection: 'row', height: OVAL_HEIGHT },
  overlaySide: { flex: 1, backgroundColor: COLORS.overlay },
  faceOval: {
    width: FACE_BOX,
    height: OVAL_HEIGHT,
    borderRadius: FACE_BOX / 2,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  overlayBottom: { flex: 1, backgroundColor: COLORS.overlay },

  cornersWrapper: {
    position: 'absolute',
    top: OVAL_TOP_OFFSET,
    alignSelf: 'center',
    width: FACE_BOX,
    height: OVAL_HEIGHT,
  },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.primary },
  cornerTL: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  topBar: {
    position: 'absolute', top: 52, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, zIndex: 10,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeTxt: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  topTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  warningBanner: {
    position: 'absolute', top: 110, left: 20, right: 20,
    backgroundColor: 'rgba(245,158,11,0.92)',
    borderRadius: 12, padding: 12, alignItems: 'center', zIndex: 10,
  },
  warningBannerText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  errorBanner: {
    position: 'absolute', top: 110, left: 20, right: 20,
    backgroundColor: 'rgba(244,63,94,0.92)',
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 4, zIndex: 10,
  },
  errorBannerText: { color: COLORS.white, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  errorBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },

  bottomControls: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    alignItems: 'center', gap: 14, zIndex: 10,
  },
  bottomHint: {
    color: COLORS.white, fontSize: 14, opacity: 0.85,
    textAlign: 'center', paddingHorizontal: 32,
  },
  captureBtn: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.white,
  },
  captureBtnInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: COLORS.white,
  },
  captureLabel: { color: COLORS.white, fontSize: 12, opacity: 0.6 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 14, width: '100%',
  },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#eff6ff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  iconEmoji: { fontSize: 38 },
  cardTitle: {
    fontSize: 22, fontWeight: '800', color: '#18181b',
    letterSpacing: -0.5, textAlign: 'center',
  },
  cardText: {
    fontSize: 14, color: COLORS.textMuted,
    textAlign: 'center', lineHeight: 21,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, width: '100%',
    alignItems: 'center', marginTop: 4,
  },
  primaryBtnText: {
    color: COLORS.white, fontSize: 15, fontWeight: '700',
    letterSpacing: -0.2,
  },
  ghostBtn: { paddingVertical: 14, width: '100%', alignItems: 'center' },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});

export default FaceVerifyScreen;