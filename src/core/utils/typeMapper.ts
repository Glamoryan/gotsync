import { OpenAPIV3 } from 'openapi-types';
import {
  TypeDefinition,
  PrimitiveDefinition,
  EnumDefinition,
  ArrayDefinition,
  ObjectDefinition,
  UnionDefinition,
  ReferenceDefinition,
  MapDefinition,
  PropertyDefinition,
  ValidationConstraints,
  EnumValue,
} from '../types/OpenAPISchema';

/**
 * Options for type mapping
 */
export interface TypeMapperOptions {
  /** Naming strategy for types */
  namingStrategy?: 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';
  /** Whether to preserve original names */
  preserveOriginalNames?: boolean;
  /** Whether to generate additional properties for objects */
  allowAdditionalProperties?: boolean;
  /** Prefix for generated type names */
  typePrefix?: string;
  /** Suffix for generated type names */
  typeSuffix?: string;
}

/**
 * Context for type mapping to track references and avoid circular dependencies
 */
export interface MappingContext {
  /** Currently processing types to detect circular references */
  processingStack: string[];
  /** Already processed types cache */
  processedTypes: Map<string, TypeDefinition>;
  /** Reference resolver function */
  resolveReference?: (ref: string) => OpenAPIV3.SchemaObject | undefined;
}

/**
 * Main function to convert OpenAPI schema to TypeDefinition
 */
export function mapOpenAPISchemaToType(
  schema: OpenAPIV3.SchemaObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext = { processingStack: [], processedTypes: new Map() }
): TypeDefinition {
  // Handle $ref references
  if ('$ref' in schema) {
    return mapReference(schema as OpenAPIV3.ReferenceObject, name, options, context);
  }

  // Handle allOf, oneOf, anyOf
  if (schema.allOf || schema.oneOf || schema.anyOf) {
    return mapUnionType(schema, name, options, context);
  }

  // Handle enums
  if (schema.enum) {
    return mapEnumType(schema, name, options, context);
  }

  // Handle arrays
  if (schema.type === 'array') {
    return mapArrayType(schema, name, options, context);
  }

  // Handle objects
  if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
    return mapObjectType(schema, name, options, context);
  }

  // Handle primitives
  if (isPrimitiveType(schema.type)) {
    return mapPrimitiveType(schema, name, options, context);
  }

  // Fallback to string if type is unknown
  return mapPrimitiveType({ ...schema, type: 'string' }, name, options, context);
}

/**
 * Maps primitive OpenAPI types to PrimitiveDefinition
 */
export function mapPrimitiveType(
  schema: OpenAPIV3.SchemaObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext
): PrimitiveDefinition {
  const primitiveType = mapOpenAPITypeToPrimitive(schema.type, schema.format);
  
  return {
    kind: 'primitive',
    name: formatTypeName(name, options),
    description: schema.description,
    primitiveType,
    nullable: schema.nullable,
    default: schema.default,
    example: schema.example,
    format: schema.format,
    constraints: extractValidationConstraints(schema),
    deprecated: schema.deprecated,
  };
}

/**
 * Maps OpenAPI enum to EnumDefinition
 */
export function mapEnumType(
  schema: OpenAPIV3.SchemaObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext
): EnumDefinition {
  const baseType = mapOpenAPITypeToPrimitive(schema.type, schema.format);
  const enumValues: EnumValue[] = (schema.enum || []).map((value, index) => ({
    value,
    label: typeof value === 'string' ? capitalizeFirst(value) : `Value${index + 1}`,
  }));

  return {
    kind: 'enum',
    name: formatTypeName(name, options),
    description: schema.description,
    values: enumValues,
    baseType: baseType === 'integer' ? 'integer' : baseType === 'number' ? 'number' : 'string',
    nullable: schema.nullable,
    default: schema.default,
    example: schema.example,
    deprecated: schema.deprecated,
  };
}

/**
 * Maps OpenAPI array to ArrayDefinition
 */
export function mapArrayType(
  schema: OpenAPIV3.SchemaObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext
): ArrayDefinition {
  const arraySchema = schema as OpenAPIV3.ArraySchemaObject;
  
  if (!arraySchema.items) {
    throw new Error(`Array schema "${name}" must have items definition`);
  }

  const itemsSchema = arraySchema.items as OpenAPIV3.SchemaObject;
  const itemsType = mapOpenAPISchemaToType(
    itemsSchema,
    `${name}Item`,
    options,
    context
  );

  return {
    kind: 'array',
    name: formatTypeName(name, options),
    description: schema.description,
    items: itemsType,
    nullable: schema.nullable,
    default: schema.default,
    example: schema.example,
    constraints: extractValidationConstraints(schema),
    deprecated: schema.deprecated,
  };
}

/**
 * Maps OpenAPI object to ObjectDefinition
 */
export function mapObjectType(
  schema: OpenAPIV3.SchemaObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext
): TypeDefinition {
  // Check for circular reference
  if (context.processingStack.includes(name)) {
    return {
      kind: 'reference',
      name: formatTypeName(name, options),
      reference: name,
    } as ReferenceDefinition;
  }

  // Add to processing stack
  context.processingStack.push(name);

  const properties: PropertyDefinition[] = [];
  const requiredProperties = schema.required || [];

  // Map properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const propType = mapOpenAPISchemaToType(
        propSchema as OpenAPIV3.SchemaObject,
        `${name}_${propName}`,
        options,
        context
      );

      properties.push({
        name: propName,
        type: propType,
        required: requiredProperties.includes(propName),
        description: (propSchema as OpenAPIV3.SchemaObject).description,
        deprecated: (propSchema as OpenAPIV3.SchemaObject).deprecated,
        example: (propSchema as OpenAPIV3.SchemaObject).example,
        readOnly: (propSchema as OpenAPIV3.SchemaObject).readOnly,
        writeOnly: (propSchema as OpenAPIV3.SchemaObject).writeOnly,
      });
    }
  }

  // Handle additionalProperties
  let additionalProperties: boolean | TypeDefinition = false;
  if (schema.additionalProperties === true) {
    additionalProperties = true;
  } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    additionalProperties = mapOpenAPISchemaToType(
      schema.additionalProperties as OpenAPIV3.SchemaObject,
      `${name}_AdditionalProperty`,
      options,
      context
    );
  }

  // Remove from processing stack
  context.processingStack.pop();

  const objectDef: ObjectDefinition = {
    kind: 'object',
    name: formatTypeName(name, options),
    description: schema.description,
    properties,
    requiredProperties,
    additionalProperties,
    nullable: schema.nullable,
    default: schema.default,
    example: schema.example,
    deprecated: schema.deprecated,
  };

  // Cache the result
  context.processedTypes.set(name, objectDef);

  return objectDef;
}

/**
 * Maps OpenAPI union types (allOf, oneOf, anyOf) to UnionDefinition
 */
export function mapUnionType(
  schema: OpenAPIV3.SchemaObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext
): UnionDefinition {
  const types: TypeDefinition[] = [];

  // Handle allOf (intersection - we'll treat as union for now)
  if (schema.allOf) {
    schema.allOf.forEach((subSchema, index) => {
      const subType = mapOpenAPISchemaToType(
        subSchema as OpenAPIV3.SchemaObject,
        `${name}_AllOf_${index}`,
        options,
        context
      );
      types.push(subType);
    });
  }

  // Handle oneOf (discriminated union)
  if (schema.oneOf) {
    schema.oneOf.forEach((subSchema, index) => {
      const subType = mapOpenAPISchemaToType(
        subSchema as OpenAPIV3.SchemaObject,
        `${name}_OneOf_${index}`,
        options,
        context
      );
      types.push(subType);
    });
  }

  // Handle anyOf (union)
  if (schema.anyOf) {
    schema.anyOf.forEach((subSchema, index) => {
      const subType = mapOpenAPISchemaToType(
        subSchema as OpenAPIV3.SchemaObject,
        `${name}_AnyOf_${index}`,
        options,
        context
      );
      types.push(subType);
    });
  }

  return {
    kind: 'union',
    name: formatTypeName(name, options),
    description: schema.description,
    types,
    discriminated: !!schema.oneOf,
    discriminator: schema.discriminator?.propertyName,
    nullable: schema.nullable,
    default: schema.default,
    example: schema.example,
    deprecated: schema.deprecated,
  };
}

/**
 * Maps OpenAPI reference to ReferenceDefinition
 */
export function mapReference(
  ref: OpenAPIV3.ReferenceObject,
  name: string,
  options: TypeMapperOptions = {},
  context: MappingContext
): ReferenceDefinition {
  const refName = extractReferenceTypeName(ref.$ref);
  
  return {
    kind: 'reference',
    name: formatTypeName(name, options),
    reference: refName,
    originalRef: ref.$ref,
  };
}

/**
 * Utility functions
 */

function isPrimitiveType(type: string | undefined): boolean {
  return ['string', 'number', 'integer', 'boolean', 'null'].includes(type || '');
}

function mapOpenAPITypeToPrimitive(
  type: string | undefined,
  format?: string
): PrimitiveDefinition['primitiveType'] {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'integer':
      return 'integer';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    default:
      return 'string'; // Default fallback
  }
}

function extractValidationConstraints(schema: OpenAPIV3.SchemaObject): ValidationConstraints {
  return {
    minimum: schema.minimum,
    maximum: schema.maximum,
    minLength: schema.minLength,
    maxLength: schema.maxLength,
    pattern: schema.pattern,
    minItems: schema.minItems,
    maxItems: schema.maxItems,
    uniqueItems: schema.uniqueItems,
  };
}

function extractReferenceTypeName(ref: string): string {
  // Extract type name from reference like '#/components/schemas/User' -> 'User'
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

function formatTypeName(name: string, options: TypeMapperOptions): string {
  let formattedName = name;

  if (!options.preserveOriginalNames) {
    switch (options.namingStrategy) {
      case 'camelCase':
        formattedName = toCamelCase(name);
        break;
      case 'PascalCase':
        formattedName = toPascalCase(name);
        break;
      case 'snake_case':
        formattedName = toSnakeCase(name);
        break;
      case 'kebab-case':
        formattedName = toKebabCase(name);
        break;
    }
  }

  if (options.typePrefix) {
    formattedName = options.typePrefix + formattedName;
  }

  if (options.typeSuffix) {
    formattedName = formattedName + options.typeSuffix;
  }

  return formattedName;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return capitalizeFirst(camelCase);
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

/**
 * Utility to create mapping context
 */
export function createMappingContext(
  resolveReference?: (ref: string) => OpenAPIV3.SchemaObject | undefined
): MappingContext {
  return {
    processingStack: [],
    processedTypes: new Map(),
    resolveReference,
  };
}

/**
 * Bulk mapping function for multiple schemas
 */
export function mapSchemaCollection(
  schemas: Record<string, OpenAPIV3.SchemaObject>,
  options: TypeMapperOptions = {}
): Record<string, TypeDefinition> {
  const context = createMappingContext();
  const result: Record<string, TypeDefinition> = {};

  for (const [name, schema] of Object.entries(schemas)) {
    result[name] = mapOpenAPISchemaToType(schema, name, options, context);
  }

  return result;
} 