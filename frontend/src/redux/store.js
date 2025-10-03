import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardReducer from './boardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer
  }
});

export default store;
