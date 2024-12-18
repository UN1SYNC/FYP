import { combineReducers } from "redux";
import authReducer from "./features/auth/authSlice"; // Import the auth reducer

const rootReducer = combineReducers({
  auth: authReducer, // Add the auth reducer
  // Add more reducers if needed
});

export default rootReducer;
