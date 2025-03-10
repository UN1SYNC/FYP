import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}));

// Mock createClient from supabase
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Global setup for common mocks
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Global cleanup
afterEach(() => {
  jest.clearAllMocks();
}); 