import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/features/auth/authSlice';
import { createClient } from '@/utils/supabase/client';
import StudentRegisterPage from '@/app/(admin)/student-register/page';
import AttendanceDetails from '@/app/(home)/cms/[course_id]/attendence/studentView';

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn()
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

// Create mock store with admin user
const createMockStore = (role = 'super-admin') => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: {
          id: 'admin-123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: role,
          lastSignIn: null,
          createdAt: null,
          details: null
        },
        isAuthenticated: true,
        loading: false,
        error: null
      }
    }
  });
};

describe('Admin User Flow', () => {
  beforeEach(() => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Test University' }], error: null }),
      insert: jest.fn().mockResolvedValue({ data: { id: 'entry-123' }, error: null })
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  
  it('admin can register a new student', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <StudentRegisterPage />
      </Provider>
    );
    
    // Fill out the student registration form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'New' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Student' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText(/Roll Number/i), { target: { value: '22BSCS-54321' } });
    
    const submitButton = screen.getByRole('button', { name: /Register Student/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Verify success state (could be a toast or navigation)
      expect(screen.getByText(/Student registered successfully/i)).toBeInTheDocument();
    });
  });
  
  it('admin cannot access student-only pages', async () => {
    const store = createMockStore();
    
    // Try to render a student-only component
    // This would normally be prevented by router middleware, but we can test the component's internal checks
    render(
      <Provider store={store}>
        <AttendanceDetails />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    });
  });
}); 