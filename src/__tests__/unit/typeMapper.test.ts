/**
 * Unit tests for Type Mapper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  mapOpenAPISchemaToType, 
  mapSchemaCollection, 
  createMappingContext,
  mapPrimitiveType,
  mapEnumType,
  mapArrayType,
  mapObjectType
} from '../../core/utils/typeMapper';
import { createComprehensiveSchema } from '../utils/testHelpers';
import { OpenAPIV3 } from 'openapi-types';

describe('Type Mapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Primitive Types', () => {
    it('should map string type correctly', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'string',
        description: 'A simple string'
      };

      const result = mapOpenAPISchemaToType(schema, 'TestString');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'TestString',
        description: 'A simple string',
        primitiveType: 'string',
        nullable: undefined,
        default: undefined,
        example: undefined,
        format: undefined,
        constraints: {},
        deprecated: undefined
      });
    });

    it('should map boolean type correctly', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'boolean',
        default: true
      };

      const result = mapOpenAPISchemaToType(schema, 'TestBoolean');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'TestBoolean',
        description: undefined,
        primitiveType: 'boolean',
        nullable: undefined,
        default: true,
        example: undefined,
        format: undefined,
        constraints: {},
        deprecated: undefined
      });
    });

    it('should map integer type correctly', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'integer',
        minimum: 0,
        maximum: 100
      };

      const result = mapOpenAPISchemaToType(schema, 'TestInteger');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'TestInteger',
        description: undefined,
        primitiveType: 'integer',
        nullable: undefined,
        default: undefined,
        example: undefined,
        format: undefined,
        constraints: {
          minimum: 0,
          maximum: 100
        },
        deprecated: undefined
      });
    });

    it('should map number type correctly', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'number',
        format: 'float'
      };

      const result = mapOpenAPISchemaToType(schema, 'TestNumber');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'TestNumber',
        description: undefined,
        primitiveType: 'number',
        nullable: undefined,
        default: undefined,
        example: undefined,
        format: 'float',
        constraints: {},
        deprecated: undefined
      });
    });

    it('should handle nullable primitive types', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'string',
        nullable: true
      };

      const result = mapOpenAPISchemaToType(schema, 'NullableString');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'NullableString',
        description: undefined,
        primitiveType: 'string',
        nullable: true,
        default: undefined,
        example: undefined,
        format: undefined,
        constraints: {},
        deprecated: undefined
      });
    });
  });

  describe('Object Types', () => {
    it('should map object with nested properties', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'string',
            description: 'User ID'
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100
          },
          email: {
            type: 'string',
            format: 'email'
          },
          age: {
            type: 'integer',
            minimum: 0
          },
          isActive: {
            type: 'boolean',
            default: true
          }
        }
      };

      const result = mapOpenAPISchemaToType(schema, 'User');

      expect(result).toEqual({
        kind: 'object',
        name: 'User',
        description: undefined,
        nullable: undefined,
        default: undefined,
        example: undefined,
        deprecated: undefined,
        properties: [
          {
            name: 'id',
            type: {
              kind: 'primitive',
              name: 'User_id',
              description: 'User ID',
              primitiveType: 'string',
              nullable: undefined,
              default: undefined,
              example: undefined,
              format: undefined,
              constraints: {
                maxItems: undefined,
                maxLength: undefined,
                maximum: undefined,
                minItems: undefined,
                minLength: undefined,
                minimum: undefined,
                pattern: undefined,
                uniqueItems: undefined,
              },
              deprecated: undefined
            },
            required: true,
            description: 'User ID',
            deprecated: undefined,
            example: undefined,
            readOnly: undefined,
            writeOnly: undefined
          },
          {
            name: 'name',
            type: {
              kind: 'primitive',
              name: 'User_name',
              description: undefined,
              primitiveType: 'string',
              nullable: undefined,
              default: undefined,
              example: undefined,
              format: undefined,
              constraints: {
                maxItems: undefined,
                maxLength: 100,
                maximum: undefined,
                minItems: undefined,
                minLength: 1,
                minimum: undefined,
                pattern: undefined,
                uniqueItems: undefined,
              },
              deprecated: undefined
            },
            required: true,
            description: undefined,
            deprecated: undefined,
            example: undefined,
            readOnly: undefined,
            writeOnly: undefined
          },
          {
            name: 'email',
            type: {
              kind: 'primitive',
              name: 'User_email',
              description: undefined,
              primitiveType: 'string',
              nullable: undefined,
              default: undefined,
              example: undefined,
              format: 'email',
              constraints: {
                maxItems: undefined,
                maxLength: undefined,
                maximum: undefined,
                minItems: undefined,
                minLength: undefined,
                minimum: undefined,
                pattern: undefined,
                uniqueItems: undefined,
              },
              deprecated: undefined
            },
            required: false,
            description: undefined,
            deprecated: undefined,
            example: undefined,
            readOnly: undefined,
            writeOnly: undefined
          },
          {
            name: 'age',
            type: {
              kind: 'primitive',
              name: 'User_age',
              description: undefined,
              primitiveType: 'integer',
              nullable: undefined,
              default: undefined,
              example: undefined,
              format: undefined,
              constraints: {
                maxItems: undefined,
                maxLength: undefined,
                maximum: undefined,
                minItems: undefined,
                minLength: undefined,
                minimum: 0,
                pattern: undefined,
                uniqueItems: undefined,
              },
              deprecated: undefined
            },
            required: false,
            description: undefined,
            deprecated: undefined,
            example: undefined,
            readOnly: undefined,
            writeOnly: undefined
          },
          {
            name: 'isActive',
            type: {
              kind: 'primitive',
              name: 'User_isActive',
              description: undefined,
              primitiveType: 'boolean',
              nullable: undefined,
              default: true,
              example: undefined,
              format: undefined,
              constraints: {
                maxItems: undefined,
                maxLength: undefined,
                maximum: undefined,
                minItems: undefined,
                minLength: undefined,
                minimum: undefined,
                pattern: undefined,
                uniqueItems: undefined,
              },
              deprecated: undefined
            },
            required: false,
            description: undefined,
            deprecated: undefined,
            example: undefined,
            readOnly: undefined,
            writeOnly: undefined
          }
        ],
        requiredProperties: ['id', 'name'],
        additionalProperties: false
      });
    });

    it('should handle object with additional properties', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object',
        additionalProperties: {
          type: 'string'
        }
      };

      const result = mapOpenAPISchemaToType(schema, 'FlexibleObject');

      expect(result).toEqual({
        kind: 'object',
        name: 'FlexibleObject',
        description: undefined,
        nullable: undefined,
        default: undefined,
        example: undefined,
        deprecated: undefined,
        properties: [],
        requiredProperties: [],
        additionalProperties: {
          kind: 'primitive',
          name: 'FlexibleObject_AdditionalProperty',
          description: undefined,
          primitiveType: 'string',
          nullable: undefined,
          default: undefined,
          example: undefined,
          format: undefined,
          constraints: {
            maxItems: undefined,
            maxLength: undefined,
            maximum: undefined,
            minItems: undefined,
            minLength: undefined,
            minimum: undefined,
            pattern: undefined,
            uniqueItems: undefined,
          },
          deprecated: undefined
        }
      });
    });
  });

  describe('Array Types', () => {
    it('should map array of primitives', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1,
        maxItems: 10
      };

      const result = mapOpenAPISchemaToType(schema, 'StringArray');

      expect(result).toEqual({
        kind: 'array',
        name: 'StringArray',
        description: undefined,
        nullable: undefined,
        default: undefined,
        example: undefined,
        constraints: {
          minItems: 1,
          maxItems: 10
        },
        deprecated: undefined,
        items: {
          kind: 'primitive',
          name: 'StringArrayItem',
          description: undefined,
          primitiveType: 'string',
          nullable: undefined,
          default: undefined,
          example: undefined,
          format: undefined,
          constraints: {},
          deprecated: undefined
        }
      });
    });

    it('should map array of objects', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            value: { type: 'number' }
          }
        }
      };

      const result = mapOpenAPISchemaToType(schema, 'ObjectArray');

      expect(result).toEqual({
        kind: 'array',
        name: 'ObjectArray',
        description: undefined,
        nullable: undefined,
        default: undefined,
        example: undefined,
        constraints: {
          maxItems: undefined,
          maxLength: undefined,
          maximum: undefined,
          minItems: undefined,
          minLength: undefined,
          minimum: undefined,
          pattern: undefined,
          uniqueItems: undefined,
        },
        deprecated: undefined,
        items: {
          kind: 'object',
          name: 'ObjectArrayItem',
          description: undefined,
          nullable: undefined,
          default: undefined,
          example: undefined,
          deprecated: undefined,
          properties: [
            {
              name: 'id',
              type: {
                kind: 'primitive',
                name: 'ObjectArrayItem_id',
                description: undefined,
                primitiveType: 'string',
                nullable: undefined,
                default: undefined,
                example: undefined,
                format: undefined,
                constraints: {
                  maxItems: undefined,
                  maxLength: undefined,
                  maximum: undefined,
                  minItems: undefined,
                  minLength: undefined,
                  minimum: undefined,
                  pattern: undefined,
                  uniqueItems: undefined,
                },
                deprecated: undefined
              },
              required: false,
              description: undefined,
              deprecated: undefined,
              example: undefined,
              readOnly: undefined,
              writeOnly: undefined
            },
            {
              name: 'value',
              type: {
                kind: 'primitive',
                name: 'ObjectArrayItem_value',
                description: undefined,
                primitiveType: 'number',
                nullable: undefined,
                default: undefined,
                example: undefined,
                format: undefined,
                constraints: {
                  maxItems: undefined,
                  maxLength: undefined,
                  maximum: undefined,
                  minItems: undefined,
                  minLength: undefined,
                  minimum: undefined,
                  pattern: undefined,
                  uniqueItems: undefined,
                },
                deprecated: undefined
              },
              required: false,
              description: undefined,
              deprecated: undefined,
              example: undefined,
              readOnly: undefined,
              writeOnly: undefined
            }
          ],
          requiredProperties: [],
          additionalProperties: false
        }
      });
    });
  });

  describe('Enum Types', () => {
    it('should map string enum correctly', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'string',
        enum: ['active', 'inactive', 'pending'],
        description: 'Status enumeration'
      };

      const result = mapOpenAPISchemaToType(schema, 'Status');

      expect(result).toEqual({
        kind: 'enum',
        name: 'Status',
        description: 'Status enumeration',
        nullable: undefined,
        default: undefined,
        example: undefined,
        deprecated: undefined,
        values: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' }
        ],
        baseType: 'string'
      });
    });

    it('should map numeric enum correctly', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'integer',
        enum: [1, 2, 3],
        description: 'Numeric status'
      };

      const result = mapOpenAPISchemaToType(schema, 'NumericStatus');

      expect(result).toEqual({
        kind: 'enum',
        name: 'NumericStatus',
        description: 'Numeric status',
        nullable: undefined,
        default: undefined,
        example: undefined,
        deprecated: undefined,
        values: [
          { value: 1, label: 'Value1' },
          { value: 2, label: 'Value2' },
          { value: 3, label: 'Value3' }
        ],
        baseType: 'integer'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing or unknown type', () => {
      const schema: OpenAPIV3.SchemaObject = {
        description: 'Unknown type schema'
      };

      const result = mapOpenAPISchemaToType(schema, 'UnknownType');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'UnknownType',
        description: 'Unknown type schema',
        primitiveType: 'string',
        nullable: undefined,
        default: undefined,
        example: undefined,
        format: undefined,
        constraints: {},
        deprecated: undefined
      });
    });

    it('should handle empty object schema', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'object'
      };

      const result = mapOpenAPISchemaToType(schema, 'EmptyObject');

      expect(result).toEqual({
        kind: 'object',
        name: 'EmptyObject',
        description: undefined,
        nullable: undefined,
        default: undefined,
        example: undefined,
        deprecated: undefined,
        properties: [],
        requiredProperties: [],
        additionalProperties: false
      });
    });

    it('should handle deprecated types', () => {
      const schema: OpenAPIV3.SchemaObject = {
        type: 'string',
        deprecated: true,
        description: 'Deprecated field'
      };

      const result = mapOpenAPISchemaToType(schema, 'DeprecatedField');

      expect(result).toEqual({
        kind: 'primitive',
        name: 'DeprecatedField',
        description: 'Deprecated field',
        primitiveType: 'string',
        nullable: undefined,
        default: undefined,
        example: undefined,
        format: undefined,
        constraints: {},
        deprecated: true
      });
    });
  });

  describe('Schema Collection', () => {
    it('should map multiple schemas to type definitions', () => {
      const schemas: Record<string, OpenAPIV3.SchemaObject> = {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Status: {
          type: 'string',
          enum: ['active', 'inactive']
        }
      };

      const result = mapSchemaCollection(schemas);

      expect(Object.keys(result)).toEqual(['User', 'Status']);
      expect(result.User.kind).toBe('object');
      expect(result.Status.kind).toBe('enum');
    });

    it('should handle empty schema collections', () => {
      const result = mapSchemaCollection({});

      expect(result).toEqual({});
    });
  });

  describe('Mapping Context', () => {
    it('should create mapping context correctly', () => {
      const context = createMappingContext();

      expect(context).toEqual({
        processingStack: [],
        processedTypes: new Map(),
        resolveReference: undefined
      });
    });

    it('should create mapping context with reference resolver', () => {
      const resolver = vi.fn();
      const context = createMappingContext(resolver);

      expect(context).toEqual({
        processingStack: [],
        processedTypes: new Map(),
        resolveReference: resolver
      });
    });
  });
}); 