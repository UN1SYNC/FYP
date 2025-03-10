import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/features/auth/authSlice';

// Create a type for the wrapper props
interface AllTheProvidersProps {
  children: React.ReactNode;
  initialState?: any;
}

// Create wrapper with Redux store
const AllTheProviders = ({ children, initialState = {} }: AllTheProvidersProps) => {
  const store = configureStore({
    reducer: {
      auth: authReducer as any,
      // Add other reducers as needed
    },
    preloadedState: initialState
  });

  // Mock router context if needed for many tests
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {}
  };

  return (
    <Provider store={store}>
      {/* Add other providers if necessary */}
      {children}
    </Provider>
  );
};

// Custom render function that includes the wrapper
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: any }
) => {
  const { initialState, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} initialState={initialState} />
    ),
    ...renderOptions
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the render method
export { customRender as render }; 