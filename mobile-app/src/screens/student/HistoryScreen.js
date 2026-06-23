import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAttendanceHistory,
  fetchMyCourses,
} from '../../redux/slices/attendanceSlice';

const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#e0e7ff',
  white: '#ffffff',
  background: '#fafafa',
  border: '#e4e4e7',
  text: '#18181b',
  textMuted: '#71717a',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
};

const HistoryScreen = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { history, courses, isLoading } = useSelector(
    (state) => state.attendance
  );

  const [filterCourse, setFilterCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchAttendanceHistory());
    dispatch(fetchMyCourses());
  }, []);

  const onRefresh = useCallback(() => {
    dispatch(fetchAttendanceHistory(filterCourse));
  }, [filterCourse]);

  const handleFilterCourse = (courseId) => {
    setFilterCourse(courseId);
    dispatch(fetchAttendanceHistory(courseId));
  };

  // Group records by date
  const groupedRecords = history.reduce((acc, record) => {
    const date = new Date(record.scannedAt || record.createdAt).toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }
    );
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  const presentCount = history.filter((r) => r.status === 'present').length;
  const absentCount = history.filter((r) => r.status === 'absent').length;
  const totalCount = history.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <Text style={styles.headerSubtitle}>
          All your class attendance records
        </Text>
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
        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {presentCount}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>
              {absentCount}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Course Filter */}
        {courses.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by course</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPills}
            >
              <TouchableOpacity
                style={[
                  styles.pill,
                  filterCourse === null && styles.pillActive,
                ]}
                onPress={() => handleFilterCourse(null)}
              >
                <Text
                  style={[
                    styles.pillText,
                    filterCourse === null && styles.pillTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {courses.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[
                    styles.pill,
                    filterCourse === c._id && styles.pillActive,
                  ]}
                  onPress={() => handleFilterCourse(c._id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      filterCourse === c._id && styles.pillTextActive,
                    ]}
                  >
                    {c.courseCode}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Grouped Records */}
        {Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([date, records]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {records.map((record) => (
                <View key={record._id} style={styles.recordCard}>
                  <View
                    style={[
                      styles.statusBar,
                      {
                        backgroundColor:
                          record.status === 'present'
                            ? COLORS.success
                            : COLORS.danger,
                      },
                    ]}
                  />
                  <View style={styles.recordContent}>
                    <View style={styles.recordTopRow}>
                      <Text style={styles.recordCourse}>
                        {record.course?.courseCode || '—'}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              record.status === 'present'
                                ? '#d1fae5'
                                : '#fee2e2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                record.status === 'present'
                                  ? '#065f46'
                                  : '#991b1b',
                            },
                          ]}
                        >
                          {record.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recordTopic} numberOfLines={1}>
                      {record.session?.topic || 'No topic'}
                    </Text>
                    <Text style={styles.recordTime}>
                      {new Date(
                        record.scannedAt || record.createdAt
                      ).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No attendance records yet</Text>
            <Text style={styles.emptyText}>
              {isLoading
                ? 'Loading your history...'
                : 'Scan QR codes to start tracking your attendance.'}
            </Text>
          </View>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.primaryLight,
    marginTop: 4,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
    marginTop: -16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
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
    marginTop: 2,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.white,
  },
  dateGroup: {
    marginBottom: 12,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusBar: {
    width: 4,
  },
  recordContent: {
    flex: 1,
    padding: 14,
  },
  recordTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordCourse: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordTopic: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HistoryScreen;