/**
 * Jest configuration for PacketTime Debugger
 *
 * - testEnvironment: node  — no browser DOM needed for scenarios + main
 * - Collects coverage from src/ and main.js
 * - Ignores dist/, node_modules/, and Electron internals
 */

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Look for tests in the tests/ folder only
  testMatch: ['<rootDir>/tests/**/*.test.js'],

  // Coverage collection
  collectCoverageFrom: [
    'src/scenarios.js',
    'main.js',
    '!src/index.html',      // UI file — not directly testable with Jest
    '!**/node_modules/**',
    '!**/dist/**',
  ],

  // Coverage thresholds — build fails if these aren't met
  coverageThreshold: {
    global: {
      statements: 70,
      branches:   60,
      functions:  70,
      lines:      70,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',

  // Show individual test results
  verbose: true,

  // Fail fast on first suite failure in CI
  bail: false,

  // Clear mocks between each test file
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,

  // Transform nothing — pure CommonJS, no transpilation needed
  transform: {},

  // Timeout per test (ms)
  testTimeout: 10000,
};
