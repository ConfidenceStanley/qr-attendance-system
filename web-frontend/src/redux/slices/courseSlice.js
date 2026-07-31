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

// Fetches filtered students for the enrollment modal only — does not touch studentSlice
export const fetchStudentsForEnrollment = createAsyncThunk(
  "courses/fetchStudentsForEnrollment",
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

// Fetches filtered lecturers for the assign lecturer modal only — does not touch lecturerSlice
export const fetchLecturersForAssignment = createAsyncThunk(
  "courses/fetchLecturersForAssignment",
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

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    list: [],
    // Separate lists for assignment modals — keeps main lists clean
    enrollmentStudents: [],
    assignmentLecturers: [],
    isLoading: false,
    isSubmitting: false,
    isLoadingEnrollment: false,
    isLoadingAssignment: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearEnrollmentStudents: (state) => { state.enrollmentStudents = []; },
    clearAssignmentLecturers: (state) => { state.assignmentLecturers = []; },
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
        const index = state.list.findIndex((c) => c._id === action.payload.data._id);
        if (index !== -1) state.list[index] = action.payload.data;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(deleteCourse.pending, (state) => { state.isSubmitting = true; })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isSubmitting = false;
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
      })

      // Enrollment students — stored separately, only used inside the modal
      .addCase(fetchStudentsForEnrollment.pending, (state) => {
        state.isLoadingEnrollment = true;
      })
      .addCase(fetchStudentsForEnrollment.fulfilled, (state, action) => {
        state.isLoadingEnrollment = false;
        state.enrollmentStudents = action.payload.data;
      })
      .addCase(fetchStudentsForEnrollment.rejected, (state) => {
        state.isLoadingEnrollment = false;
      })

      // Assignment lecturers — stored separately, only used inside the modal
      .addCase(fetchLecturersForAssignment.pending, (state) => {
        state.isLoadingAssignment = true;
      })
      .addCase(fetchLecturersForAssignment.fulfilled, (state, action) => {
        state.isLoadingAssignment = false;
        state.assignmentLecturers = action.payload.data;
      })
      .addCase(fetchLecturersForAssignment.rejected, (state) => {
        state.isLoadingAssignment = false;
      });
  },
});

export const { clearError, clearEnrollmentStudents, clearAssignmentLecturers } = courseSlice.actions;
export default courseSlice.reducer;