import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import {
  scanQRCode,
  clearScanResult,
} from '../../redux/slices/attendanceSlice';

const { width, height } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.7;

const COLORS = {
  primary: '#4f46e5',
  white: '#ffffff',
  black: '#000000',
  success: '#10b981',
  danger: '#f43f5e',
  warning: '#f59e0b',
  overlay: 'rgba(0, 0, 0, 0.7)',
  textMuted: '#a1a1aa',
};

const ScannerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { scanResult, isScanLoading } = useSelector(
    (state) => state.attendance
  );

  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Animation refs
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  // ── Request location permission on mount ──
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  // ── Reset scan state when screen focuses ──
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setShowResult(false);
      setIsProcessing(false);
      dispatch(clearScanResult());
    });
    return unsubscribe;
  }, [navigation]);

  // ── Animate scan line ──
  useEffect(() => {
    if (!scanned && !isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: SCAN_BOX_SIZE,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [scanned, isProcessing]);

  // ── Animate result modal ──
  useEffect(() => {
    if (showResult) {
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      resultAnim.setValue(0);
    }
  }, [showResult]);

  // ── Handle QR scan ──
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Check location permission
      if (!locationPermission) {
        Alert.alert(
          'Location Required',
          'QRoll needs your location to verify you are in the classroom. Please enable location access.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        setIsProcessing(false);
        return;
      }

      // Get current GPS
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Send to backend
      const result = await dispatch(
        scanQRCode({
          qrToken: data,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      );

      // Show result
      setShowResult(true);
      setIsProcessing(false);

      // Haptic for result
      if (result.meta.requestStatus === 'fulfilled') {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } else {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        'Location Error',
        'Could not get your location. Please ensure GPS is enabled.',
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  // ── Handle scan again ──
  const handleScanAgain = () => {
    setShowResult(false);
    setScanned(false);
    setIsProcessing(false);
    dispatch(clearScanResult());
  };

  // ── Handle done ──
  const handleDone = () => {
    setShowResult(false);
    dispatch(clearScanResult());
    navigation.navigate('Dashboard');
  };

  // ── Permission states ──
  if (!permission) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            QRoll needs your camera to scan attendance QR codes shown by your
            lecturer.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Scan QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Dark Overlay with Cutout */}
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            {/* Corners */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated Scan Line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineAnim }] },
                ]}
              />
            )}
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Instructions */}
      {!showResult && !isProcessing && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionTitle}>
            Point camera at the QR code
          </Text>
          <Text style={styles.instructionText}>
            Make sure the QR fits inside the square
          </Text>

          {!locationPermission && (
            <View style={styles.warningPill}>
              <Text style={styles.warningPillText}>
                ⚠ Location permission required
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Processing State */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingTitle}>Verifying...</Text>
            <Text style={styles.processingText}>
              Checking your location and marking attendance
            </Text>
          </View>
        </View>
      )}

      {/* Result Modal */}
      {showResult && scanResult && (
        <View style={styles.resultOverlay}>
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: resultAnim,
                transform: [
                  {
                    scale: resultAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {scanResult.success ? (
              <>
                {/* Success */}
                <View style={[styles.resultIcon, styles.successIcon]}>
                  <Text style={styles.resultIconText}>✓</Text>
                </View>
                <Text style={styles.resultTitle}>Attendance Marked!</Text>
                <Text style={styles.resultSubtitle}>
                  Your presence has been recorded
                </Text>

                <View style={styles.resultDetails}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Course</Text>
                    <Text style={styles.resultValue}>
                      {scanResult.data?.courseCode}
                    </Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Topic</Text>
                    <Text style={styles.resultValue} numberOfLines={1}>
                      {scanResult.data?.topic || '—'}
                    </Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Distance</Text>
                    <Text style={styles.resultValue}>
                      {scanResult.data?.distance}
                    </Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Time</Text>
                    <Text style={styles.resultValue}>
                      {new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleDone}
                >
                  <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Error */}
                <View style={[styles.resultIcon, styles.errorIcon]}>
                  <Text style={styles.resultIconText}>✕</Text>
                </View>
                <Text style={styles.resultTitle}>Scan Failed</Text>
                <Text style={styles.resultErrorMessage}>
                  {scanResult.message || 'Something went wrong'}
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleScanAgain}
                >
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleDone}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    padding: 24,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
  },
  topTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.overlay,
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
  },
  overlaySide: {
    flex: 1,
    height: SCAN_BOX_SIZE,
    backgroundColor: COLORS.overlay,
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.overlay,
  },
  scanArea: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  instructionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  warningPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.warning,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  warningPillText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  processingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 240,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  processingText: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 6,
    textAlign: 'center',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  resultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: COLORS.success,
  },
  errorIcon: {
    backgroundColor: COLORS.danger,
  },
  resultIconText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '800',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 4,
    textAlign: 'center',
  },
  resultErrorMessage: {
    fontSize: 14,
    color: COLORS.danger,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resultLabel: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 14,
    color: '#18181b',
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#e4e4e7',
    marginVertical: 2,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelButtonText: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ScannerScreen;