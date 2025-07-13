/**
 * Test helper utilities
 * Common functions used across multiple test files
 */

import { OpenAPIV3 } from 'openapi-types';
import { TypeDefinition, SchemaCollection, PrimitiveDefinition } from '../../core/types/OpenAPISchema';
import { expect } from 'vitest';

/**
 * Create a minimal valid OpenAPI schema for testing
 */
export function createMinimalSchema(): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Test API',
      version: '1.0.0'
    },
    paths: {},
    components: {
      schemas: {}
    }
  };
}

/**
 * Create a comprehensive test schema with various types
 */
export function createComprehensiveSchema(): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Comprehensive Test API',
      version: '1.0.0',
      description: 'A comprehensive schema for testing all type mappings'
    },
    paths: {},
    components: {
      schemas: {
        // Primitive types
        SimpleString: {
          type: 'string',
          description: 'A simple string'
        },
        SimpleNumber: {
          type: 'number',
          description: 'A simple number'
        },
        SimpleInteger: {
          type: 'integer',
          description: 'A simple integer'
        },
        SimpleBoolean: {
          type: 'boolean',
          description: 'A simple boolean'
        },
        
        // Enum type
        Status: {
          type: 'string',
          enum: ['active', 'inactive', 'pending'],
          description: 'Status enumeration'
        },
        
        // Array type
        StringArray: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Array of strings'
        },
        
        // Object type
        User: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
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
            },
            metadata: {
              type: 'object',
              additionalProperties: {
                type: 'string'
              }
            }
          }
        },
        
        // Reference type
        UserRef: {
          $ref: '#/components/schemas/User'
        }
      }
    }
  };
}

/**
 * Create a mock TypeDefinition for testing
 */
export function createMockTypeDefinition(overrides: Partial<TypeDefinition> = {}): TypeDefinition {
  const base: PrimitiveDefinition = {
    kind: 'primitive',
    name: 'TestType',
    primitiveType: 'string',
    description: 'A test type'
  };
  
  return { ...base, ...overrides } as TypeDefinition;
}

/**
 * Create a mock SchemaCollection for testing
 */
export function createMockSchemaCollection(types: Record<string, TypeDefinition> = {}): SchemaCollection {
  return {
    types: {
      TestType: createMockTypeDefinition(),
      ...types
    },
    rootTypes: Object.keys(types).length > 0 ? Object.keys(types) : ['TestType'],
    metadata: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test schema collection',
      openApiVersion: '3.0.3',
      paths: []
    }
  };
}

/**
 * Assert that generated code contains expected patterns
 */
export function assertCodeContains(code: string, patterns: string[]): void {
  patterns.forEach(pattern => {
    expect(code).toContain(pattern);
  });
}

/**
 * Assert that generated code matches certain structure
 */
export function assertCodeStructure(code: string, options: {
  hasExports?: boolean;
  hasInterfaces?: boolean;
  hasTypes?: boolean;
  hasEnums?: boolean;
  hasComments?: boolean;
}): void {
  if (options.hasExports) {
    expect(code).toMatch(/export\s+(interface|type|enum|const)/);
  }
  
  if (options.hasInterfaces) {
    expect(code).toMatch(/interface\s+\w+/);
  }
  
  if (options.hasTypes) {
    expect(code).toMatch(/type\s+\w+\s*=/);
  }
  
  if (options.hasEnums) {
    expect(code).toMatch(/enum\s+\w+/);
  }
  
  if (options.hasComments) {
    expect(code).toMatch(/(\/\*\*|\/\/)/);
  }
}

/**
 * Mock file system operations for testing
 */
export function createMockFS() {
  const files: Record<string, string> = {};
  
  return {
    files,
    writeFile: (path: string, content: string) => {
      files[path] = content;
    },
    readFile: (path: string) => {
      return files[path] || null;
    },
    exists: (path: string) => {
      return path in files;
    },
    clear: () => {
      Object.keys(files).forEach(key => delete files[key]);
    }
  };
}

/**
 * Create temporary test data for snapshots
 */
export function createSnapshotData(name: string, data: any) {
  return {
    name,
    timestamp: '2023-01-01T00:00:00.000Z', // Fixed timestamp for consistent snapshots
    data
  };
}

/**
 * Normalize whitespace in generated code for testing
 */
export function normalizeCode(code: string): string {
  return code
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '  ') // Normalize tabs to spaces
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Extract all type names from generated TypeScript code
 */
export function extractTypeNames(code: string): string[] {
  const typeRegex = /(?:interface|type|enum)\s+(\w+)/g;
  const matches: string[] = [];
  let match;
  
  while ((match = typeRegex.exec(code)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Extract all struct names from generated Go code
 */
export function extractGoStructNames(code: string): string[] {
  const structRegex = /type\s+(\w+)\s+struct/g;
  const matches: string[] = [];
  let match;
  
  while ((match = structRegex.exec(code)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
} 