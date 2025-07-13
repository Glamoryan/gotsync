/**
 * Global test setup for Vitest
 * This file runs before all tests
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies that might cause issues in tests
vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises');
  return {
    ...actual,
    // Add mocks if needed
  };
});

// Global test utilities
global.testUtils = {
  // Common test data
  sampleOpenAPISchema: {
    openapi: '3.0.3',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'A test API for unit testing'
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier'
            },
            name: {
              type: 'string',
              description: 'User name',
              minLength: 1,
              maxLength: 100
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            age: {
              type: 'integer',
              minimum: 0,
              maximum: 150
            },
            isActive: {
              type: 'boolean',
              default: true
            }
          }
        },
        UserStatus: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended'],
          description: 'User account status'
        }
      }
    }
  },

  // Helper functions
  createMockSchema: (overrides = {}) => ({
    ...global.testUtils.sampleOpenAPISchema,
    ...overrides
  }),

  // Async helpers
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // File system helpers
  createTempDir: async () => {
    const tmpDir = `/tmp/gotsync-test-${Date.now()}`;
    // In real implementation, you'd create actual temp directories
    return tmpDir;
  }
};

// Extend global types for TypeScript
declare global {
  var testUtils: {
    sampleOpenAPISchema: any;
    createMockSchema: (overrides?: any) => any;
    delay: (ms: number) => Promise<void>;
    createTempDir: () => Promise<string>;
  };
}

// Console spy setup for cleaner test output
beforeEach(() => {
  // Spy on console methods to prevent noise in test output
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods after each test
  vi.restoreAllMocks();
});

// Global test timeout
vi.setConfig({ testTimeout: 10000 }); 