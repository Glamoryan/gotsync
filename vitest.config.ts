import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Environment for tests
    environment: 'happy-dom',
    
    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'packages/*/node_modules', 'packages/*/dist'],
    
    // Global test configuration
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/**/*.{test,spec}.{js,ts}',
        'src/__tests__/**',
        'dist/',
        'packages/*/dist/',
        'templates/',
        '*.config.{js,ts}',
        'src/**/index.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Timeout for tests
    testTimeout: 10000,
    
    // Setup files
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // Watch options
    watch: false,
    
    // Reporter options
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-report.html'
    }
  },
  
  // Resolve configuration for path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@types': resolve(__dirname, './src/core/types'),
      '@parser': resolve(__dirname, './src/core/parser'),
      '@generator': resolve(__dirname, './src/core/generator'),
      '@utils': resolve(__dirname, './src/core/utils'),
      '@templates': resolve(__dirname, './templates'),
      '@tests': resolve(__dirname, './src/__tests__'),
      '@cli': resolve(__dirname, './packages/cli/src')
    }
  },
  
  // Define global constants for tests
  define: {
    __TEST__: true
  }
}); 