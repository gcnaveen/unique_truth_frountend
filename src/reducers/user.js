import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  id: "",
  name: "",
  role: "",
  email_id: "",
  access_token: "",
  refresh_token: "",
  venueId: null,
  is_change_password: false,
  is_logged_in: false,
  venue: null,
  venueProfile: null,
  canAccessDashboard: false,
  advancePayment: null,
  counselingLevel: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: initialValue,
    loading: false,
    error: null,
  },
  reducers: {
    login: (state, action) => {
      state.value = action.payload;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.value = initialValue;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
    passwordChanged: (state) => {
      state.value.is_change_password = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  login,
  logout,
  updateUser,
  passwordChanged,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
