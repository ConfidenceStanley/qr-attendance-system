import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../redux/slices/attendanceSlice';

const COLORS = {
  primary: '#4f46e5',
  primaryDark: '#3730a3',
  primaryLight: '#e0e7ff',
  white: '#ffffff',
  background: '#fafafa',
  card: '#ffffff',
  border: '#e4e4e7',
  text: '#18181b',
  textMuted: '#71717a',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
};

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const { dashboard, isLoading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, []);

  const onRefresh = useCallback(() => {
    dispatch(fetchDashboard());
  }, []);

  // Extract data using your backend's actual shape
  const overallPercentage = dashboard?.overallPercentage || 0;
  const totalClasses = dashboard?.totalClasses || 0;
  const totalPresent = dashboard?.totalPresent || 0;
  const courseStats = dashboard?.courseStats || [];
  const totalCourses = courseStats.length;

  const getStatusColor = (percent) => {
    if (percent >= 75) return COLORS.success;
    if (percent >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const getStatusLabel = (percent) => {
    if (percent >= 75) return 'Excellent';
    if (percent >= 50) return 'Warning';
    return 'Critical';
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.8}
        >
          <Text style={styles.scanButtonText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Overall Attendance Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Overall Attendance</Text>
          <View style={styles.heroPercentRow}>
            <Text
              style={[
                styles.heroPercent,
                { color: getStatusColor(overallPercentage) },
              ]}
            >
              {overallPercentage}
            </Text>
            <Text style={styles.heroPercentSymbol}>%</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: getStatusColor(overallPercentage) + '20' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(overallPercentage) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(overallPercentage) },
              ]}
            >
              {getStatusLabel(overallPercentage)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${overallPercentage}%`,
                  backgroundColor: getStatusColor(overallPercentage),
                },
              ]}
            />
          </View>

          <Text style={styles.heroSubtext}>
            {totalPresent} of {totalClasses} sessions attended
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCourses}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalClasses}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPresent}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
        </View>

        {/* Warning Banner if low */}
        {overallPercentage < 75 && totalClasses > 0 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>Attendance Below Threshold</Text>
            <Text style={styles.warningText}>
              Your attendance is below 75%. Please attend more classes to avoid
              being barred from exams.
            </Text>
          </View>
        )}

        {/* Course Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Breakdown</Text>
          <Text style={styles.sectionSubtitle}>
            Attendance per registered course
          </Text>
        </View>

        {courseStats.length > 0 ? (
          courseStats.map((stat) => (
            <View key={stat.course._id} style={styles.courseCard}>
              <View style={styles.courseCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseCode}>
                    {stat.course.courseCode}
                  </Text>
                  <Text style={styles.courseTitle} numberOfLines={1}>
                    {stat.course.courseTitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.percentBadge,
                    {
                      backgroundColor:
                        getStatusColor(stat.percentage) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.percentBadgeText,
                      { color: getStatusColor(stat.percentage) },
                    ]}
                  >
                    {stat.percentage}%
                  </Text>
                </View>
              </View>

              <View style={styles.courseProgressBg}>
                <View
                  style={[
                    styles.courseProgressFill,
                    {
                      width: `${stat.percentage}%`,
                      backgroundColor: getStatusColor(stat.percentage),
                    },
                  ]}
                />
              </View>

              <Text style={styles.courseStat}>
                {stat.present} of {stat.total} sessions
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {isLoading
                ? 'Loading your courses...'
                : 'No courses registered yet. Contact your admin.'}
            </Text>
          </View>
        )}

        {/* Recent Scans Section */}
        {dashboard?.recentScans && dashboard.recentScans.length > 0 && (
          <>
            <View style={[styles.section, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>Your last 5 scans</Text>
            </View>

            {dashboard.recentScans.map((scan) => (
              <View key={scan._id} style={styles.scanCard}>
                <View style={styles.scanDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanCourse}>
                    {scan.course?.courseCode}
                  </Text>
                  <Text style={styles.scanTopic} numberOfLines={1}>
                    {scan.session?.topic || 'Attendance marked'}
                  </Text>
                </View>
                <Text style={styles.scanDate}>
                  {new Date(scan.scannedAt || scan.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  )}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  scroll: {
    flex: 1,
    marginTop: -16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroPercentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 12,
  },
  heroPercent: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -3,
    lineHeight: 64,
  },
  heroPercentSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  heroSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  warningBanner: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9a3412',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#9a3412',
    lineHeight: 17,
  },
  section: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  courseTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  percentBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  courseProgressBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseStat: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  scanCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 12,
  },
  scanCourse: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  scanTopic: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scanDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});

export default DashboardScreen;