import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ── Async Thunks ──────────────────────────────────────────

export const fetchLecturerDashboard = createAsyncThunk(
  "lecturerSession/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/lecturer/dashboard");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard");
    }
  }
);

export const fetchMyCourses = createAsyncThunk(
  "lecturerSession/fetchMyCourses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/lecturer/courses");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load courses");
    }
  }
);

export const createSession = createAsyncThunk(
  "lecturerSession/createSession",
  async (sessionData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/lecturer/sessions", sessionData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create session");
    }
  }
);

export const fetchMySessions = createAsyncThunk(
  "lecturerSession/fetchMySessions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/lecturer/sessions", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load sessions");
    }
  }
);

export const fetchSessionById = createAsyncThunk(
  "lecturerSession/fetchSessionById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/lecturer/sessions/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load session");
    }
  }
);

export const closeSession = createAsyncThunk(
  "lecturerSession/closeSession",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/lecturer/sessions/${id}/close`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to close session");
    }
  }
);

export const fetchSessionAttendance = createAsyncThunk(
  "lecturerSession/fetchSessionAttendance",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/lecturer/sessions/${id}/attendance`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load records");
    }
  }
);

export const updateRecord = createAsyncThunk(
  "lecturerSession/updateRecord",
  async ({ sessionId, studentId, status, editNote }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `/lecturer/sessions/${sessionId}/attendance/${studentId}`,
        { status, editNote }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update record");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────

const lecturerSessionSlice = createSlice({
  name: "lecturerSession",
  initialState: {
    dashboard:         null,
    courses:           [],
    sessions:          [],
    currentSession:    null,
    attendanceRecords: [],
    loading:           false,
    error:             null,
  },
  reducers: {
    clearCurrentSession(state) {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state)        => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // Dashboard
      .addCase(fetchLecturerDashboard.pending,   pending)
      .addCase(fetchLecturerDashboard.fulfilled, (state, action) => {
        state.loading   = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchLecturerDashboard.rejected,  rejected)

      // Courses
      .addCase(fetchMyCourses.pending,   pending)
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
      })
      .addCase(fetchMyCourses.rejected,  rejected)

      // Create Session
      .addCase(createSession.pending,   pending)
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading        = false;
        state.currentSession = action.payload.session;
      })
      .addCase(createSession.rejected,  rejected)

      // Sessions List
      .addCase(fetchMySessions.pending,   pending)
      .addCase(fetchMySessions.fulfilled, (state, action) => {
        state.loading  = false;
        state.sessions = action.payload.sessions;
      })
      .addCase(fetchMySessions.rejected,  rejected)

      // Single Session
      .addCase(fetchSessionById.pending,   pending)
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading        = false;
        state.currentSession = action.payload.session;
      })
      .addCase(fetchSessionById.rejected,  rejected)

      // Close Session
      .addCase(closeSession.pending,   pending)
      .addCase(closeSession.fulfilled, (state) => {
        state.loading = false;
        if (state.currentSession) {
          state.currentSession.status = "closed";
        }
      })
      .addCase(closeSession.rejected,  rejected)

      // Attendance Records
      .addCase(fetchSessionAttendance.pending,   pending)
      .addCase(fetchSessionAttendance.fulfilled, (state, action) => {
        state.loading           = false;
        state.attendanceRecords = action.payload.records;
      })
      .addCase(fetchSessionAttendance.rejected,  rejected)

      .addCase(updateRecord.pending,   pending)
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.attendanceRecords.findIndex(
          (r) => r._id === action.payload.record._id
        );
        if (idx !== -1) state.attendanceRecords[idx] = action.payload.record;
      })
      .addCase(updateRecord.rejected, rejected)
  },
});

export const { clearCurrentSession } = lecturerSessionSlice.actions;
export default lecturerSessionSlice.reducer;