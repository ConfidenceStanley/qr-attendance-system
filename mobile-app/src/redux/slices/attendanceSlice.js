import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchDashboard = createAsyncThunk(
  'attendance/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/student/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load dashboard'
      );
    }
  }
);

export const fetchMyCourses = createAsyncThunk(
  'attendance/fetchMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/student/courses');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load courses'
      );
    }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/fetchAttendanceHistory',
  async (courseId = null, { rejectWithValue }) => {
    try {
      const url = courseId
        ? `/student/attendance/history?courseId=${courseId}`
        : '/student/attendance/history';
      const response = await axiosInstance.get(url);
      console.log('📥 HISTORY RESPONSE:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log('❌ HISTORY ERROR:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load history'
      );
    }
  }
);

export const scanQRCode = createAsyncThunk(
  'attendance/scanQRCode',
  async ({ qrToken, latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/student/scan', {
        qrToken,
        latitude,
        longitude,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Scan failed. Please try again.'
      );
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    dashboard: null,
    courses: [],
    history: [],
    scanResult: null,
    isLoading: false,
    isScanLoading: false,
    error: null,
  },
  reducers: {
    clearScanResult: (state) => {
      state.scanResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.dashboard = action.payload;
    });
    builder.addCase(fetchDashboard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchMyCourses.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMyCourses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.courses = action.payload.courses || [];
    });
    builder.addCase(fetchMyCourses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchAttendanceHistory.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.history = action.payload.records || action.payload.history || [];
    });
    builder.addCase(fetchAttendanceHistory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(scanQRCode.pending, (state) => {
      state.isScanLoading = true;
      state.scanResult = null;
    });
    builder.addCase(scanQRCode.fulfilled, (state, action) => {
      state.isScanLoading = false;
      state.scanResult = { success: true, data: action.payload };
    });
    builder.addCase(scanQRCode.rejected, (state, action) => {
      state.isScanLoading = false;
      state.scanResult = { success: false, message: action.payload };
    });
  },
});

export const { clearScanResult, clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;