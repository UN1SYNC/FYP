import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Define the type for the authentication state
interface AuthState {
  user: {
    id: string;
    email: string;
  } | null; // User data will be null when logged out
}

// Initial state for the auth slice
const initialState: AuthState = {
  user: null,
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action to store user information
    loginAction(state, action: PayloadAction<{ id: string; email: string }>) {
      state.user = action.payload; // Store user details in the state
      console.log('User logged in:', action.payload);
    },
    // Logout action to clear user information
    logoutAction(state) {
      
      console.log('User logged out: ', state);
      state.user = null; // Reset user to null on logout
      console.log('User logged out');
    },
  },
});

export const { loginAction, logoutAction } = authSlice.actions;
export default authSlice.reducer;
