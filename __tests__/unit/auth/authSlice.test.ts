import authReducer, { loginAction, logoutAction } from '@/lib/features/auth/authSlice';

describe('Auth Slice', () => {
  const initialState = { user: null };
  
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: '' as any })).toEqual(initialState);
  });
  
  it('should handle user login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'student',
      name: 'John Doe',
      lastSignIn: '2023-01-01T00:00:00.000Z',
      created_at: '2023-01-01T00:00:00.000Z',
      roleDetails: { student_id: '12345' }
    };
    
    const action = loginAction({ data: { user: mockUser } });
    const state = authReducer(initialState, action);
    
    expect(state.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'student',
      name: 'John Doe',
      lastSignIn: '2023-01-01T00:00:00.000Z',
      createdAt: '2023-01-01T00:00:00.000Z',
      details: { student_id: '12345' }
    });
  });
  
  it('should handle user logout', () => {
    const loggedInState = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        name: 'John Doe',
        lastSignIn: '',
        createdAt: '',
        details: null
      }
    };
    
    const action = logoutAction();
    const state = authReducer(loggedInState, action);
    
    expect(state.user).toBeNull();
  });
}); 