/**
 * Unit tests for OpenAPI Schema Parser
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseSchema } from '../../core/parser/parseSchema';
import { join } from 'path';
import { OpenAPIV3 } from 'openapi-types';
import { createMockFS } from '../utils/testHelpers';

describe('parseSchema', () => {
  const mockFS = createMockFS();
  const fixturesPath = join(__dirname, '..', 'fixtures');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFS.clear();
  });

  it('should parse a valid learning schema', async () => {
    const schema = await parseSchema(join(fixturesPath, 'learning.yaml')) as OpenAPIV3.Document;
    
    expect(schema.openapi).toBe('3.0.3');
    expect(schema.info.title).toBe('Learning API');
    expect(schema.components?.schemas).toHaveProperty('Course');
    expect(schema.components?.schemas).toHaveProperty('CreateCourseRequest');
    
    // Validate Course schema
    const courseSchema = schema.components?.schemas?.Course as OpenAPIV3.SchemaObject;
    expect(courseSchema.required).toEqual(['id', 'title', 'instructor']);
    expect((courseSchema.properties?.level as OpenAPIV3.SchemaObject).enum).toEqual(['beginner', 'intermediate', 'advanced']);
    expect((courseSchema.properties?.duration as OpenAPIV3.SchemaObject).minimum).toBe(30);
    expect((courseSchema.properties?.duration as OpenAPIV3.SchemaObject).maximum).toBe(480);
  });

  it('should parse a valid user schema with complex types', async () => {
    const schema = await parseSchema(join(fixturesPath, 'user.yaml')) as OpenAPIV3.Document;
    
    expect(schema.openapi).toBe('3.0.3');
    expect(schema.info.title).toBe('User Management API');
    
    // Validate User schema
    const userSchema = schema.components?.schemas?.User as OpenAPIV3.SchemaObject;
    expect(userSchema.required).toEqual(['id', 'username', 'email']);
    expect((userSchema.properties?.id as OpenAPIV3.SchemaObject).format).toBe('uuid');
    expect((userSchema.properties?.email as OpenAPIV3.SchemaObject).format).toBe('email');
    
    // Validate nested objects
    expect(schema.components?.schemas).toHaveProperty('UserPreferences');
    expect(schema.components?.schemas).toHaveProperty('Role');
    
    // Check enum values
    const roleSchema = schema.components?.schemas?.Role as OpenAPIV3.SchemaObject;
    expect((roleSchema.properties?.name as OpenAPIV3.SchemaObject).enum).toEqual(['admin', 'user', 'moderator']);
  });

  it('should throw error for invalid schema', async () => {
    await expect(
      parseSchema(join(fixturesPath, 'invalid.yaml'))
    ).rejects.toThrow();
  });

  it('should throw error for missing required fields', async () => {
    const invalidSchemaPath = '/mock/invalid-schema.yaml';
    const invalidSchema = {
      // Missing openapi version
      info: {
        title: 'Invalid Schema'
      },
      paths: {}
    };

    // Write mock invalid schema file
    mockFS.writeFile(invalidSchemaPath, JSON.stringify(invalidSchema));

    await expect(
      parseSchema(invalidSchemaPath)
    ).rejects.toThrow();
  });
}); 