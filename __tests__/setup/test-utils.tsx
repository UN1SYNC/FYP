import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/features/auth/authSlice';
import { RootState } from '@/lib/store';

interface AllTheProvidersProps {
  children: React.ReactNode;
  initialState?: Partial<RootState>;
}

const AllTheProviders = ({ children, initialState = {} }: AllTheProvidersProps) => {
  const store = configureStore({
    reducer: {
      auth: authReducer as any,
    },
    preloadedState: initialState as any
  });

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialState?: Partial<RootState>;
  }
) => {
  const { initialState, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} initialState={initialState} />,
    ...renderOptions
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the render method
export { customRender as render };

// Add a test file instead of making this a test
export const customRender = () => {
  // Your rendering logic
};

// Add export to avoid empty test warnings
export const dummyExport = true; 