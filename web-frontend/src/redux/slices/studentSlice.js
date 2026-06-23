import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/admin/students?${queryString}` : "/admin/students";
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch students");
    }
  }
);

export const createStudent = createAsyncThunk(
  "students/create",
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/students", studentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create student");
    }
  }
);

export const updateStudent = createAsyncThunk(
  "students/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/students/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update student");
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/students/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete student");
    }
  }
);

const studentSlice = createSlice({
  name: "students",
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
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createStudent.pending, (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.list.unshift(action.payload.data);
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(updateStudent.pending, (state) => { state.isSubmitting = true; })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Fixed: use _id instead of id
        const index = state.list.findIndex(
          (s) => s._id === action.payload.data._id
        );
        if (index !== -1) state.list[index] = action.payload.data;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(deleteStudent.pending, (state) => { state.isSubmitting = true; })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Fixed: use _id instead of id
        const student = state.list.find((s) => s._id === action.payload);
        if (student) student.isActive = false;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = studentSlice.actions;
export default studentSlice.reducer;