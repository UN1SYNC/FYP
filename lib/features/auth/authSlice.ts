import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Define the type for the authentication state
interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    lastSignIn: string;
    createdAt: string;
    details: any;
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
    loginAction(state, action: PayloadAction<{ data: { user: any } }>) {
      console.log("action.payload.data:", action.payload.data);
      const { user } = action.payload.data;
    
      state.user = {
        id: user.id,
        email: user.email,
        role: user.role || "unknown",
        name: user.name || "Anonymous",
        lastSignIn: user.lastSignIn,
        createdAt: user.created_at,
        details: user.roleDetails
      };
    
      console.log("User logged in:", state.user);
    }
    ,
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
