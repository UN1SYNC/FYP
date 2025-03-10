// Helper functions to create Supabase mock responses

export const createMockSupabaseClient = (customResponses = {}) => {
  // Default mock implementations
  const defaultMocks = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'user-123', email: 'test@example.com' } }, 
        error: null 
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { 
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'fake-token' }
        },
        error: null
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null })
    },
    from: jest.fn().mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null })
    })),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({ data: { path: 'fake-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://fake-url.com/file.pdf' } })
    }
  };

  // Merge default mocks with custom responses
  return {
    ...defaultMocks,
    ...customResponses
  };
};

export const mockSupabaseError = (message = 'An error occurred') => ({
  error: {
    message,
    code: 'mock-error-code',
    details: 'Mock error details',
    hint: 'Mock error hint'
  }
}); 