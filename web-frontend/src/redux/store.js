import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import lecturerReducer from "./slices/lecturerSlice";
import studentReducer from "./slices/studentSlice";
import courseReducer from "./slices/courseSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    lecturers: lecturerReducer,
    students: studentReducer,
    courses: courseReducer,
  },
});

export default store;