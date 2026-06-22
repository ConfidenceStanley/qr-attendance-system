import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ─────────────────────────────────────────────
// Async Thunks (API calls)
// ─────────────────────────────────────────────

// Fetch all lecturers
export const fetchLecturers = createAsyncThunk(
  "lecturers/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string from params object
      // e.g. { search: "john" } → "?search=john"
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/admin/lecturers?${queryString}`
        : "/admin/lecturers";

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lecturers"
      );
    }
  }
);

// Create new lecturer
export const createLecturer = createAsyncThunk(
  "lecturers/create",
  async (lecturerData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/lecturers",
        lecturerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lecturer"
      );
    }
  }
);

// Update lecturer
export const updateLecturer = createAsyncThunk(
  "lecturers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/admin/lecturers/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lecturer"
      );
    }
  }
);

// Deactivate lecturer
export const deleteLecturer = createAsyncThunk(
  "lecturers/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/lecturers/${id}`);
      return id; // return id so we can remove from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete lecturer"
      );
    }
  }
);

// ─────────────────────────────────────────────
// Slice Definition
// ─────────────────────────────────────────────
const lecturerSlice = createSlice({
  name: "lecturers",
  initialState: {
    list: [],         // array of all lecturers
    isLoading: false, // loading state for fetch
    isSubmitting: false, // loading state for create/update/delete
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchLecturers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLecturers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchLecturers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createLecturer.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createLecturer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Add new lecturer to top of list
        state.list.unshift(action.payload.data);
      })
      .addCase(createLecturer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateLecturer.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateLecturer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Replace updated lecturer in list
        const index = state.list.findIndex(
          (l) => l.id === action.payload.data.id
        );
        if (index !== -1) {
          state.list[index] = action.payload.data;
        }
      })
      .addCase(updateLecturer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteLecturer.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(deleteLecturer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Mark as inactive in our local state
        // (backend does soft delete)
        const lecturer = state.list.find((l) => l.id === action.payload);
        if (lecturer) lecturer.isActive = false;
      })
      .addCase(deleteLecturer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = lecturerSlice.actions;
export default lecturerSlice.reducer;