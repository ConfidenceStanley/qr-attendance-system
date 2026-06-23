import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchLecturers = createAsyncThunk(
  "lecturers/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/admin/lecturers?${queryString}` : "/admin/lecturers";
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch lecturers");
    }
  }
);

export const createLecturer = createAsyncThunk(
  "lecturers/create",
  async (lecturerData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/lecturers", lecturerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create lecturer");
    }
  }
);

export const updateLecturer = createAsyncThunk(
  "lecturers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/lecturers/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update lecturer");
    }
  }
);

export const deleteLecturer = createAsyncThunk(
  "lecturers/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/lecturers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete lecturer");
    }
  }
);

const lecturerSlice = createSlice({
  name: "lecturers",
  initialState: {
    list: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
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

      .addCase(createLecturer.pending, (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(createLecturer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.list.unshift(action.payload.data);
      })
      .addCase(createLecturer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(updateLecturer.pending, (state) => { state.isSubmitting = true; })
      .addCase(updateLecturer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Use _id to find the record (MongoDB uses _id)
        const index = state.list.findIndex(
          (l) => l._id === action.payload.data._id
        );
        if (index !== -1) state.list[index] = action.payload.data;
      })
      .addCase(updateLecturer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(deleteLecturer.pending, (state) => { state.isSubmitting = true; })
      .addCase(deleteLecturer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Use _id to find the record
        const lecturer = state.list.find((l) => l._id === action.payload);
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