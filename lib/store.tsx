import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // LocalStorage
import rootReducer from './rootReducer'; // Import your rootReducer (which combines reducers)

// Redux Persist configuration
const persistConfig = {
  key: 'root', // Key for storing the state
  storage, // Use localStorage (you can also use sessionStorage)
  whitelist: ['auth'], // Only persist the 'auth' slice of the state (you can add other slices here)
};

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with persisted reducer
const store = configureStore({
  reducer: persistedReducer, // Apply persisted reducer
});

// Create the persistor
const persistor = persistStore(store);

// RootState type
export type RootState = ReturnType<typeof store.getState>;

export { store, persistor };
