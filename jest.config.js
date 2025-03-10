const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/__tests__/utils/'],
  globals: {
    'TextEncoder': require('util').TextEncoder,
    'TextDecoder': require('util').TextDecoder,
  }
};

module.exports = createJestConfig(customJestConfig); 