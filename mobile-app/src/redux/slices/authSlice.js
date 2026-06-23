import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import {
  saveToken,
  saveUser,
  clearStorage,
  getToken,
  getUser,
} from '../../utils/storage';

export const loginStudent = createAsyncThunk(
  'auth/loginStudent',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      const { token, user } = response.data;

      if (user.role !== 'student') {
        return rejectWithValue(
          'This app is for students only. Please use the web portal.'
        );
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

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const user = await getUser();
      if (token && user) {
        return { token, user };
      }
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
    isLoading: false,
    isRestoring: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginStudent.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginStudent.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginStudent.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(restoreSession.pending, (state) => {
      state.isRestoring = true;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.isRestoring = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.isRestoring = false;
      state.isAuthenticated = false;
    });

    builder.addCase(logoutStudent.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;