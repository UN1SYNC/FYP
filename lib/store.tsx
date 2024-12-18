import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import rootReducer from "./rootReducer"; // Import combined reducers


export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
