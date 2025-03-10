import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginAction, logoutAction } from '@/lib/features/auth/authSlice';
import { LoginForm } from '@/components/login-form';
import { createClient } from '@/utils/supabase/client';
import { RootState } from '@/lib/store';

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'student',
            name: 'John Doe',
            lastSignIn: '2023-01-01T00:00:00.000Z',
            created_at: '2023-01-01T00:00:00.000Z',
            roleDetails: { student_id: '12345' }
          },
          session: {}
        },
        error: null
      })
    }
  }))
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

// Mock app/utils/auth.ts
jest.mock('@/app/utils/auth', () => ({
  login: jest.fn().mockImplementation((email, password, router, toast, dispatch) => {
    if (dispatch) {
      dispatch(loginAction({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'student',
            name: 'John Doe',
            lastSignIn: '2023-01-01T00:00:00.000Z',
            created_at: '2023-01-01T00:00:00.000Z',
            roleDetails: { student_id: '12345' }
          }
        }
      }));
    }
    return Promise.resolve({ user: { email: 'test@example.com' } });
  })
}));

describe('Authentication Flow', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer
      }
    });
  });
  
  it('user can log in and out', async () => {
    // Render login form
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    // Fill login form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit form
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Use act for state changes
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    // Wait for login to complete
    await waitFor(() => {
      const state = store.getState() as RootState;
      expect(state.auth.user).not.toBeNull();
    });
    
    // Simulate logout
    act(() => {
      store.dispatch(logoutAction());
    });
    
    // Verify user is logged out
    const finalState = store.getState() as RootState;
    expect(finalState.auth.user).toBeNull();
  });
}); 