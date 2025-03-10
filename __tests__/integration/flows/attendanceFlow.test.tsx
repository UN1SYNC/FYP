import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/features/auth/authSlice';
import MarkAttendancePage from '@/app/(home)/cms/[course_id]/attendence/teacherView';
import AttendanceDetails from '@/app/(home)/cms/[course_id]/attendence/studentView';
import { createClient } from '@/utils/supabase/client';

// Mock dependencies
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), query: { course_id: 'course-123' } }))
}));

describe('Attendance Management Flow', () => {
  const mockStudents = [
    { id: 'student-1', name: 'John Doe', roll_number: '21BSCS-12345' },
    { id: 'student-2', name: 'Jane Smith', roll_number: '21BSCS-67890' }
  ];
  
  const mockAttendance = [
    { 
      id: 'attendance-1', 
      date: '2023-09-01', 
      student_id: 'student-1', 
      status: 'present', 
      course_id: 'course-123' 
    }
  ];
  
  beforeEach(() => {
    const mockSupabase = {
      from: jest.fn((table) => {
        if (table === 'students_enrolled') {
          return {
            select: jest.fn().mockResolvedValue({ 
              data: mockStudents.map(s => ({ student_id: s.id, student: s })), 
              error: null 
            })
          };
        }
        if (table === 'attendance') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockAttendance, error: null }),
            insert: jest.fn().mockResolvedValue({ data: { id: 'attendance-2' }, error: null }),
            upsert: jest.fn().mockResolvedValue({ data: { id: 'attendance-2' }, error: null })
          };
        }
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null })
        };
      })
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  
  it('instructor can mark attendance', async () => {
    const store = configureStore({
      reducer: {
        auth: authReducer as any
      },
      preloadedState: {
        auth: {
          user: {
            id: 'instructor-123',
            name: 'Instructor User',
            email: 'instructor@example.com',
            role: 'instructor',
            lastSignIn: '',
            createdAt: '',
            details: ''
          }
        }
      }
    });
    
    render(
      <Provider store={store}>
        <MarkAttendancePage />
      </Provider>
    );
    
    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Mark attendance for a student
    const presentButton = screen.getAllByText('Present')[0];
    fireEvent.click(presentButton);
    
    // Submit attendance
    const submitButton = screen.getByRole('button', { name: /Save Attendance/i });
    fireEvent.click(submitButton);
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/Attendance (recorded|saved|marked) successfully/i)).toBeInTheDocument();
    });
  });
  
  it('student can view their attendance', async () => {
    const store = configureStore({
      reducer: {
        auth: authReducer as any
      },
      preloadedState: {
        auth: {
          user: {
            id: 'student-1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            lastSignIn: '',
            createdAt: '',
            details: ''
          }
        }
      }
    });
    
    render(
      <Provider store={store}>
        <AttendanceDetails />
      </Provider>
    );
    
    // Wait for attendance data to load
    await waitFor(() => {
      expect(screen.getByText('09/01/2023')).toBeInTheDocument();
      expect(screen.getByText('Present')).toBeInTheDocument();
    });
  });
}); 