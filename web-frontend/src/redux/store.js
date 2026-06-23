import { configureStore } from "@reduxjs/toolkit";
import authReducer            from "./slices/authSlice";
import lecturerReducer        from "./slices/lecturerSlice";
import studentReducer         from "./slices/studentSlice";
import courseReducer          from "./slices/courseSlice";
import lecturerSessionReducer from "./slices/lecturerSessionSlice";

const store = configureStore({
  reducer: {
    auth:            authReducer,
    lecturers:       lecturerReducer,
    students:        studentReducer,
    courses:         courseReducer,
    lecturerSession: lecturerSessionReducer,
  },
});

export default store;