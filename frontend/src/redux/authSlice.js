import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const tokenFromStorage = localStorage.getItem('token') ? localStorage.getItem('token') : null;
const userFromStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.register(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.login(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: tokenFromStorage,
    user: userFromStorage,
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = { _id: a.payload._id, name: a.payload.name, email: a.payload.email };
        localStorage.setItem('token', a.payload.token);
        localStorage.setItem('user', JSON.stringify(s.user));
      })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = { _id: a.payload._id, name: a.payload.name, email: a.payload.email };
        localStorage.setItem('token', a.payload.token);
        localStorage.setItem('user', JSON.stringify(s.user));
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
