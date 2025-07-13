/**
 * Language-agnostic intermediate representation of OpenAPI schemas
 * Used for code generation to Go and TypeScript
 */

/**
 * Base metadata that all type definitions can have
 */
export interface BaseTypeMetadata {
  /** Original OpenAPI field name */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Whether the field can be null */
  nullable?: boolean;
  /** Default value if any */
  default?: any;
  /** Whether this field is required */
  required?: boolean;
  /** Whether this field is deprecated */
  deprecated?: boolean;
  /** Example value for documentation */
  example?: any;
  /** Custom format (e.g., 'date-time', 'email', 'uuid') */
  format?: string;
  /** Validation constraints */
  constraints?: ValidationConstraints;
}

/**
 * Validation constraints for types
 */
export interface ValidationConstraints {
  /** Minimum value (numbers) */
  minimum?: number;
  /** Maximum value (numbers) */
  maximum?: number;
  /** Minimum length (strings, arrays) */
  minLength?: number;
  /** Maximum length (strings, arrays) */
  maxLength?: number;
  /** Pattern for string validation */
  pattern?: string;
  /** Minimum number of items (arrays) */
  minItems?: number;
  /** Maximum number of items (arrays) */
  maxItems?: number;
  /** Whether array items should be unique */
  uniqueItems?: boolean;
}

/**
 * Primitive type definition
 */
export interface PrimitiveDefinition extends BaseTypeMetadata {
  kind: 'primitive';
  /** Primitive type name */
  primitiveType: 'string' | 'number' | 'integer' | 'boolean' | 'null';
}

/**
 * Enum type definition
 */
export interface EnumDefinition extends BaseTypeMetadata {
  kind: 'enum';
  /** Enum values */
  values: EnumValue[];
  /** Base type of enum values */
  baseType: 'string' | 'number' | 'integer';
}

/**
 * Individual enum value
 */
export interface EnumValue {
  /** The actual value */
  value: string | number;
  /** Optional label/description for the value */
  label?: string;
  /** Whether this enum value is deprecated */
  deprecated?: boolean;
}

/**
 * Array type definition
 */
export interface ArrayDefinition extends BaseTypeMetadata {
  kind: 'array';
  /** Type of array items */
  items: TypeDefinition;
}

/**
 * Union type definition (oneOf, anyOf)
 */
export interface UnionDefinition extends BaseTypeMetadata {
  kind: 'union';
  /** Types that can be in the union */
  types: TypeDefinition[];
  /** Whether this is a discriminated union */
  discriminated?: boolean;
  /** Discriminator property name if discriminated */
  discriminator?: string;
}

/**
 * Object type definition
 */
export interface ObjectDefinition extends BaseTypeMetadata {
  kind: 'object';
  /** Object properties */
  properties: PropertyDefinition[];
  /** Names of required properties */
  requiredProperties: string[];
  /** Whether additional properties are allowed */
  additionalProperties?: boolean | TypeDefinition;
  /** Whether this object extends another object */
  extends?: string[];
}

/**
 * Property definition within an object
 */
export interface PropertyDefinition {
  /** Property name */
  name: string;
  /** Property type */
  type: TypeDefinition;
  /** Whether this property is required */
  required: boolean;
  /** Property description */
  description?: string;
  /** Whether this property is deprecated */
  deprecated?: boolean;
  /** Example value */
  example?: any;
  /** Whether this property is read-only */
  readOnly?: boolean;
  /** Whether this property is write-only */
  writeOnly?: boolean;
}

/**
 * Reference to another type definition
 */
export interface ReferenceDefinition extends BaseTypeMetadata {
  kind: 'reference';
  /** Reference target name */
  reference: string;
  /** Original reference path (e.g., '#/components/schemas/User') */
  originalRef?: string;
}

/**
 * Map/dictionary type definition
 */
export interface MapDefinition extends BaseTypeMetadata {
  kind: 'map';
  /** Type of map values */
  valueType: TypeDefinition;
  /** Type of map keys (usually string) */
  keyType?: TypeDefinition;
}

/**
 * Main type definition union
 */
export type TypeDefinition = 
  | PrimitiveDefinition
  | EnumDefinition
  | ArrayDefinition
  | UnionDefinition
  | ObjectDefinition
  | ReferenceDefinition
  | MapDefinition;

/**
 * Schema collection containing all type definitions
 */
export interface SchemaCollection {
  /** All type definitions indexed by name */
  types: Record<string, TypeDefinition>;
  /** Main/root types (typically from paths) */
  rootTypes: string[];
  /** API metadata */
  metadata: ApiMetadata;
}

/**
 * API metadata extracted from OpenAPI spec
 */
export interface ApiMetadata {
  /** API title */
  title: string;
  /** API version */
  version: string;
  /** API description */
  description?: string;
  /** OpenAPI version */
  openApiVersion: string;
  /** Base URL servers */
  servers?: ServerInfo[];
  /** Available paths/endpoints */
  paths: PathInfo[];
}

/**
 * Server information
 */
export interface ServerInfo {
  /** Server URL */
  url: string;
  /** Server description */
  description?: string;
  /** Server variables */
  variables?: Record<string, ServerVariable>;
}

/**
 * Server variable definition
 */
export interface ServerVariable {
  /** Default value */
  default: string;
  /** Possible values */
  enum?: string[];
  /** Variable description */
  description?: string;
}

/**
 * Path/endpoint information
 */
export interface PathInfo {
  /** Path pattern (e.g., '/users/{id}') */
  path: string;
  /** HTTP methods available */
  methods: HttpMethod[];
  /** Path description */
  description?: string;
  /** Path parameters */
  parameters?: ParameterInfo[];
}

/**
 * HTTP method information
 */
export interface HttpMethod {
  /** HTTP method name */
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  /** Operation description */
  description?: string;
  /** Operation ID */
  operationId?: string;
  /** Request body type */
  requestBody?: TypeDefinition;
  /** Response types by status code */
  responses: Record<string, TypeDefinition>;
  /** Method-specific parameters */
  parameters?: ParameterInfo[];
}

/**
 * Parameter information
 */
export interface ParameterInfo {
  /** Parameter name */
  name: string;
  /** Parameter location */
  in: 'query' | 'header' | 'path' | 'cookie';
  /** Parameter type */
  type: TypeDefinition;
  /** Whether parameter is required */
  required: boolean;
  /** Parameter description */
  description?: string;
  /** Whether parameter is deprecated */
  deprecated?: boolean;
}

/**
 * Utility type to check if a type is a specific kind
 */
export type TypeOfKind<T extends TypeDefinition['kind']> = Extract<TypeDefinition, { kind: T }>;

/**
 * Utility functions for type checking
 */
export const TypeGuards = {
  isPrimitive: (type: TypeDefinition): type is PrimitiveDefinition => type.kind === 'primitive',
  isEnum: (type: TypeDefinition): type is EnumDefinition => type.kind === 'enum',
  isArray: (type: TypeDefinition): type is ArrayDefinition => type.kind === 'array',
  isUnion: (type: TypeDefinition): type is UnionDefinition => type.kind === 'union',
  isObject: (type: TypeDefinition): type is ObjectDefinition => type.kind === 'object',
  isReference: (type: TypeDefinition): type is ReferenceDefinition => type.kind === 'reference',
  isMap: (type: TypeDefinition): type is MapDefinition => type.kind === 'map',
}; 