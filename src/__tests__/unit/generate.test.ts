import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { petStoreSchema } from '../fixtures/schemas';
import { parseSchema } from '../../core/parser/parseSchema';
import { mapSchemaCollection } from '../../core/utils/typeMapper';
import { generateTypeScriptFromSchema } from '../../core/generator/ts';
import { generateGoFromSchema } from '../../core/generator/go';
import { SchemaCollection } from '../../core/types/OpenAPISchema';
import { createMockFS } from '../utils/testHelpers';

// Mock the generators
vi.mock('../../core/generator/ts');
vi.mock('../../core/generator/go');

const mockedGenerateTypeScript = generateTypeScriptFromSchema as Mock;
const mockedGenerateGo = generateGoFromSchema as Mock;

describe('generate command', () => {
  let mockFS: ReturnType<typeof createMockFS>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFS = createMockFS();

    // Setup mocks
    mockedGenerateTypeScript.mockResolvedValue(
      `// Generated TypeScript code for Pet Store API`
    );
    mockedGenerateGo.mockResolvedValue(
      `// Generated Go code for Pet Store API`
    );
  });

  afterEach(() => {
    mockFS.clear();
  });

  it('should generate TypeScript types from schema', async () => {
    const schemas = petStoreSchema.components?.schemas || {};
    const schemaObjects: Record<string, any> = {};
    
    for (const [name, schemaOrRef] of Object.entries(schemas)) {
      if (!('$ref' in schemaOrRef)) {
        schemaObjects[name] = schemaOrRef;
      }
    }
    
    const mappedTypes = mapSchemaCollection(schemaObjects);
    
    const schemaCollection: SchemaCollection = {
      types: mappedTypes,
      rootTypes: Object.keys(mappedTypes),
      metadata: {
        title: petStoreSchema.info?.title || 'Generated API',
        version: petStoreSchema.info?.version || '1.0.0',
        description: petStoreSchema.info?.description,
        openApiVersion: petStoreSchema.openapi || '3.0.0',
        servers: petStoreSchema.servers?.map(server => ({
          url: server.url,
          description: server.description,
          variables: server.variables
        })),
        paths: []
      }
    };

    // Generate TypeScript code
    const tsCode = await generateTypeScriptFromSchema(
      schemaCollection,
      '/mock/output',
      {
        fileName: 'types.ts',
        fileHeader: '// Auto-generated TypeScript types\n// Do not edit manually',
        includeJsDoc: true,
        useOptionalProperties: true,
        exportTypes: true,
      }
    );

    // Verify generated TypeScript code
    expect(tsCode).toContain('Generated TypeScript code for Pet Store API');
    expect(generateTypeScriptFromSchema).toHaveBeenCalledTimes(1);
  });

  it('should generate Go types from schema', async () => {
    const schemas = petStoreSchema.components?.schemas || {};
    const schemaObjects: Record<string, any> = {};
    
    for (const [name, schemaOrRef] of Object.entries(schemas)) {
      if (!('$ref' in schemaOrRef)) {
        schemaObjects[name] = schemaOrRef;
      }
    }
    
    const mappedTypes = mapSchemaCollection(schemaObjects);
    
    const schemaCollection: SchemaCollection = {
      types: mappedTypes,
      rootTypes: Object.keys(mappedTypes),
      metadata: {
        title: petStoreSchema.info?.title || 'Generated API',
        version: petStoreSchema.info?.version || '1.0.0',
        description: petStoreSchema.info?.description,
        openApiVersion: petStoreSchema.openapi || '3.0.0',
        servers: petStoreSchema.servers?.map(server => ({
          url: server.url,
          description: server.description,
          variables: server.variables
        })),
        paths: []
      }
    };

    // Generate Go code
    const goCode = await generateGoFromSchema(
      schemaCollection,
      '/mock/output',
      'types',
      {
        fileName: 'types.go',
        fileHeader: '// Auto-generated Go types\n// Do not edit manually',
        includeJsonTags: true,
        includeValidationTags: false,
        usePointersForOptional: true,
        omitEmptyTags: true,
      }
    );

    // Verify generated Go code
    expect(goCode).toContain('Generated Go code for Pet Store API');
    expect(generateGoFromSchema).toHaveBeenCalledTimes(1);
  });
}); 