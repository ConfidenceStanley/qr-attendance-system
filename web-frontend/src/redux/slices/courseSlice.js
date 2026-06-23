import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchCourses = createAsyncThunk(
  "courses/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/admin/courses?${queryString}` : "/admin/courses";
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch courses");
    }
  }
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/courses", courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create course");
    }
  }
);

export const updateCourse = createAsyncThunk(
  "courses/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/courses/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update course");
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "courses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/courses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete course");
    }
  }
);

export const assignLecturerToCourse = createAsyncThunk(
  "courses/assignLecturer",
  async ({ courseId, lecturerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/admin/courses/${courseId}/assign-lecturer`,
        { lecturerId }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign lecturer");
    }
  }
);

export const assignStudentsToCourse = createAsyncThunk(
  "courses/assignStudents",
  async ({ courseId, studentIds }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/admin/courses/${courseId}/assign-students`,
        { studentIds }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign students");
    }
  }
);

const courseSlice = createSlice({
  name: "courses",
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
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createCourse.pending, (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.list.unshift(action.payload.data);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(updateCourse.pending, (state) => { state.isSubmitting = true; })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Fixed: use _id instead of id
        const index = state.list.findIndex(
          (c) => c._id === action.payload.data._id
        );
        if (index !== -1) state.list[index] = action.payload.data;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(deleteCourse.pending, (state) => { state.isSubmitting = true; })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Fixed: use _id instead of id
        const course = state.list.find((c) => c._id === action.payload);
        if (course) course.isActive = false;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(assignLecturerToCourse.pending, (state) => { state.isSubmitting = true; })
      .addCase(assignLecturerToCourse.fulfilled, (state) => { state.isSubmitting = false; })
      .addCase(assignLecturerToCourse.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(assignStudentsToCourse.pending, (state) => { state.isSubmitting = true; })
      .addCase(assignStudentsToCourse.fulfilled, (state) => { state.isSubmitting = false; })
      .addCase(assignStudentsToCourse.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;