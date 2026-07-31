import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { saveToken, saveUser, clearStorage, getToken, getUser } from '../../utils/storage';

// Password login — returns token + user but does NOT set isAuthenticated yet
// Navigation will move to FaceEnrol or FaceVerify first
export const loginStudent = createAsyncThunk(
  'auth/loginStudent',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (user.role !== 'student') {
        return rejectWithValue('This app is for students only. Please use the web portal.');
      }

      // Save token immediately so face endpoints can use it
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

// Enrol face — called once on first login
export const enrolFace = createAsyncThunk(
  'auth/enrolFace',
  async ({ imageBase64 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/face/enrol', { imageBase64 });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Face enrolment failed. Please try again.'
      );
    }
  }
);

// Verify face — called on every login after enrolment
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
    isAuthenticated: false,  // true only AFTER face passes
    isRestoring: true,
    isLoading: false,
    isFaceLoading: false,
    // Holds token+user between password login and face verification
    pendingAuth: null,
    error: null,
    faceError: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearFaceError: (state) => { state.faceError = null; },
    // Called after face passes — finalise authentication
    completeAuth: (state) => {
      if (state.pendingAuth) {
        state.user = state.pendingAuth.user;
        state.token = state.pendingAuth.token;
        state.isAuthenticated = true;
        state.pendingAuth = null;
      }
    },
    // Called if user cancels face or logs out from face screen
    cancelPendingAuth: (state) => {
      state.pendingAuth = null;
      state.error = null;
      state.faceError = null;
    },
  },
  extraReducers: (builder) => {
    // Password login — only sets pendingAuth, not isAuthenticated
    builder
      .addCase(loginStudent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingAuth = action.payload; // wait for face
      })
      .addCase(loginStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Face enrolment
    builder
      .addCase(enrolFace.pending, (state) => {
        state.isFaceLoading = true;
        state.faceError = null;
      })
      .addCase(enrolFace.fulfilled, (state, action) => {
        state.isFaceLoading = false;
        // Update faceEnrolled on the pending user so navigator knows
        if (state.pendingAuth?.user) {
          state.pendingAuth.user.faceEnrolled = true;
        }
      })
      .addCase(enrolFace.rejected, (state, action) => {
        state.isFaceLoading = false;
        state.faceError = action.payload;
      });

    // Face verification
    builder
      .addCase(verifyFace.pending, (state) => {
        state.isFaceLoading = true;
        state.faceError = null;
      })
      .addCase(verifyFace.fulfilled, (state) => {
        state.isFaceLoading = false;
        // Face passed — complete login
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

    // Restore session — skip face (already verified in previous session)
    builder
      .addCase(restoreSession.pending, (state) => { state.isRestoring = true; })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isRestoring = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isRestoring = false;
        state.isAuthenticated = false;
      });

    builder.addCase(logoutStudent.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.pendingAuth = null;
    });
  },
});

export const { clearError, clearFaceError, completeAuth, cancelPendingAuth } = authSlice.actions;
export default authSlice.reducer;