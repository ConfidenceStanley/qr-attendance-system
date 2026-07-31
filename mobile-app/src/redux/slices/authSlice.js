import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import {
  saveToken,
  saveUser,
  clearStorage,
  getToken,
  getUser,
  updateStoredUser,
} from '../../utils/storage';

export const loginStudent = createAsyncThunk(
  'auth/loginStudent',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (user.role !== 'student') {
        return rejectWithValue('This app is for students only. Please use the web portal.');
      }

      await saveToken(token);
      await saveUser(user);
      return { token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Check your credentials.'
      );
    }
  }
);

export const enrolFace = createAsyncThunk(
  'auth/enrolFace',
  async ({ imageBase64 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/face/enrol', { imageBase64 });
      // Update stored user so next session restore knows face is enrolled
      await updateStoredUser({ faceEnrolled: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Face enrolment failed. Please try again.'
      );
    }
  }
);

export const verifyFace = createAsyncThunk(
  'auth/verifyFace',
  async ({ imageBase64 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/face/verify', { imageBase64 });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Face verification failed. Please try again.'
      );
    }
  }
);

// Restore session — puts user into pendingAuth so face verify always runs
// Face is NOT skipped on app reopen
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const user = await getUser();
      if (token && user) return { token, user };
      return rejectWithValue('No saved session');
    } catch (error) {
      return rejectWithValue('Session restore failed');
    }
  }
);

export const logoutStudent = createAsyncThunk(
  'auth/logoutStudent',
  async () => {
    await clearStorage();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isRestoring: true,
    isLoading: false,
    isFaceLoading: false,
    pendingAuth: null,
    error: null,
    faceError: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearFaceError: (state) => { state.faceError = null; },
    cancelPendingAuth: (state) => {
      state.pendingAuth = null;
      state.error = null;
      state.faceError = null;
    },
  },
  extraReducers: (builder) => {
    // Password login — sets pendingAuth only, not isAuthenticated
    builder
      .addCase(loginStudent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingAuth = action.payload;
      })
      .addCase(loginStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Face enrolment — update pendingAuth user so AppNavigator switches to FaceVerify
    builder
      .addCase(enrolFace.pending, (state) => {
        state.isFaceLoading = true;
        state.faceError = null;
      })
      .addCase(enrolFace.fulfilled, (state) => {
        state.isFaceLoading = false;
        if (state.pendingAuth?.user) {
          state.pendingAuth.user.faceEnrolled = true;
        }
      })
      .addCase(enrolFace.rejected, (state, action) => {
        state.isFaceLoading = false;
        state.faceError = action.payload;
      });

    // Face verify — only here does isAuthenticated become true
    builder
      .addCase(verifyFace.pending, (state) => {
        state.isFaceLoading = true;
        state.faceError = null;
      })
      .addCase(verifyFace.fulfilled, (state) => {
        state.isFaceLoading = false;
        if (state.pendingAuth) {
          state.user = state.pendingAuth.user;
          state.token = state.pendingAuth.token;
          state.isAuthenticated = true;
          state.pendingAuth = null;
        }
      })
      .addCase(verifyFace.rejected, (state, action) => {
        state.isFaceLoading = false;
        state.faceError = action.payload;
      });

    // Restore session — goes to pendingAuth NOT isAuthenticated
    // This forces face verify every time the app opens
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isRestoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isRestoring = false;
        // Put into pendingAuth — face verify will run before dashboard
        state.pendingAuth = action.payload;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isRestoring = false;
        state.isAuthenticated = false;
        state.pendingAuth = null;
      });

    builder.addCase(logoutStudent.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.pendingAuth = null;
    });
  },
});

export const { clearError, clearFaceError, cancelPendingAuth } = authSlice.actions;
export default authSlice.reducer;