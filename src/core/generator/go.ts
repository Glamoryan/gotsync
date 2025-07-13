import * as ejs from 'ejs';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
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
  SchemaCollection,
  TypeGuards,
} from '../types/OpenAPISchema';

/**
 * Configuration for Go code generation
 */
export interface GoGeneratorConfig {
  /** Output directory for generated files */
  outputDir: string;
  /** Output file name */
  fileName?: string;
  /** Package name for generated Go files */
  packageName: string;
  /** Whether to generate JSON tags */
  includeJsonTags?: boolean;
  /** Whether to generate validation tags */
  includeValidationTags?: boolean;
  /** Whether to export all types (capitalize names) */
  exportTypes?: boolean;
  /** Additional imports to include */
  additionalImports?: string[];
  /** Header comment for generated file */
  fileHeader?: string;
  /** Whether to use pointers for optional fields */
  usePointersForOptional?: boolean;
  /** Whether to generate omitempty tags */
  omitEmptyTags?: boolean;
}

/**
 * Context for template rendering
 */
export interface GoRenderContext {
  types: TypeDefinition[];
  config: GoGeneratorConfig;
  utils: GoTemplateUtils;
}

/**
 * Template utilities for Go code generation
 */
export interface GoTemplateUtils {
  formatTypeName: (name: string) => string;
  formatFieldName: (name: string) => string;
  formatPackageName: (name: string) => string;
  generateJsonTag: (name: string, required: boolean) => string;
  generateValidationTag: (constraints?: ValidationConstraints) => string;
  generateComment: (description?: string, deprecated?: boolean) => string;
  escapeString: (str: string) => string;
}

/**
 * Go code generator class
 */
export class GoGenerator {
  private config: GoGeneratorConfig;
  private utils: GoTemplateUtils;

  constructor(config: GoGeneratorConfig) {
    this.config = {
      includeJsonTags: true,
      includeValidationTags: false,
      exportTypes: true,
      usePointersForOptional: true,
      omitEmptyTags: true,
      ...config,
    };
    this.utils = this.createTemplateUtils();
  }

  /**
   * Generate Go code from type definitions
   */
  public generateTypes(types: TypeDefinition[]): string {
    const context: GoRenderContext = {
      types,
      config: this.config,
      utils: this.utils,
    };

    return this.renderTemplate(context);
  }

  /**
   * Generate Go code from schema collection
   */
  public generateFromSchema(schema: SchemaCollection): string {
    const types = Object.values(schema.types);
    return this.generateTypes(types);
  }

  /**
   * Generate Go code and write to file
   */
  public async generateToFile(types: TypeDefinition[]): Promise<void> {
    const code = this.generateTypes(types);
    const outputPath = join(this.config.outputDir, this.config.fileName || 'types.go');
    
    // Ensure output directory exists
    if (!existsSync(dirname(outputPath))) {
      mkdirSync(dirname(outputPath), { recursive: true });
    }

    writeFileSync(outputPath, code, 'utf8');
  }

  /**
   * Generate Go code from schema and write to file
   */
  public async generateSchemaToFile(schema: SchemaCollection): Promise<void> {
    const types = Object.values(schema.types);
    await this.generateToFile(types);
  }

  /**
   * Render template with context
   */
  private renderTemplate(context: GoRenderContext): string {
    const template = this.getMainTemplate();
    const rendered = ejs.render(template, context, { escape: (str: string) => str });
    // Replace placeholder with actual backticks
    return rendered.replace(/BACKTICK/g, '`');
  }

  /**
   * Create template utility functions
   */
  private createTemplateUtils(): GoTemplateUtils {
    return {
      formatTypeName: (name: string) => {
        // Ensure PascalCase for exported types
        if (this.config.exportTypes) {
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name.charAt(0).toLowerCase() + name.slice(1);
      },

      formatFieldName: (name: string) => {
        // Ensure PascalCase for exported fields
        return name.charAt(0).toUpperCase() + name.slice(1);
      },

      formatPackageName: (name: string) => {
        // Package names should be lowercase
        return name.toLowerCase();
      },

      generateJsonTag: (name: string, required: boolean) => {
        if (!this.config.includeJsonTags) return '';
        
        const omitEmpty = this.config.omitEmptyTags && !required ? ',omitempty' : '';
        return `json:"${name}${omitEmpty}"`;
      },

      generateValidationTag: (constraints?: ValidationConstraints) => {
        if (!this.config.includeValidationTags || !constraints) return '';
        
        const validations: string[] = [];
        if (constraints.minimum !== undefined) validations.push(`min=${constraints.minimum}`);
        if (constraints.maximum !== undefined) validations.push(`max=${constraints.maximum}`);
        if (constraints.minLength !== undefined) validations.push(`min=${constraints.minLength}`);
        if (constraints.maxLength !== undefined) validations.push(`max=${constraints.maxLength}`);
        if (constraints.pattern) validations.push(`regexp=${constraints.pattern}`);
        
        return validations.length > 0 ? `validate:"${validations.join(',')}"` : '';
      },

      generateComment: (description?: string, deprecated?: boolean) => {
        if (!description && !deprecated) return '';
        
        let comment = '';
        if (description) {
          comment += `// ${description}\n`;
        }
        if (deprecated) {
          comment += '// Deprecated: This field is deprecated\n';
        }
        return comment;
      },

      escapeString: (str: string) => {
        return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      },
    };
  }

  /**
   * Main template for generating Go code
   */
  private getMainTemplate(): string {
    return `<% if (config.fileHeader) { %>
<%= config.fileHeader %>

<% } %>
package <%= utils.formatPackageName(config.packageName) %>

<% 
// Only add imports if they are actually needed
const needsImports = config.additionalImports && config.additionalImports.length > 0;
if (needsImports) { 
%>
import (
<% config.additionalImports.forEach(imp => { %>
	<%= imp %>
<% }) %>
)

<% } %>
<% types.forEach(type => { %>
<%= renderType(type, utils, config) %>

<% }) %>

<%
/**
 * Render a single type definition
 */
function renderType(type, utils, config) {
  if (type.kind === 'primitive') {
    return renderPrimitive(type, utils, config);
  } else if (type.kind === 'enum') {
    return renderEnum(type, utils, config);
  } else if (type.kind === 'array') {
    return renderArray(type, utils, config);
  } else if (type.kind === 'object') {
    return renderObject(type, utils, config);
  } else if (type.kind === 'union') {
    return renderUnion(type, utils, config);
  } else if (type.kind === 'reference') {
    return renderReference(type, utils, config);
  } else if (type.kind === 'map') {
    return renderMap(type, utils, config);
  }
  return '';
}

/**
 * Render primitive type (usually as type alias)
 */
function renderPrimitive(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const goType = mapPrimitiveType(type.primitiveType);
  const nullable = type.nullable ? '*' : '';
  
  return comment + 'type ' + typeName + ' ' + nullable + goType;
}

/**
 * Render enum type
 */
function renderEnum(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const baseType = mapPrimitiveType(type.baseType);
  
  let enumDeclaration = comment + 'type ' + typeName + ' ' + baseType + '\\n\\n';
  enumDeclaration += 'const (\\n';
  
  type.values.forEach((value, index) => {
    const enumName = typeName + value.label;
    const enumValue = typeof value.value === 'string' ? '"' + utils.escapeString(value.value) + '"' : value.value;
    const iota = index === 0 ? ' ' + typeName + ' = iota' : '';
    const deprecatedComment = value.deprecated ? ' // Deprecated' : '';
    
    if (typeof value.value === 'string') {
      enumDeclaration += '\\t' + enumName + ' ' + typeName + ' = ' + enumValue + deprecatedComment + '\\n';
    } else {
      enumDeclaration += '\\t' + enumName + iota + deprecatedComment + '\\n';
    }
  });
  
  enumDeclaration += ')';
  return enumDeclaration;
}

/**
 * Render array type
 */
function renderArray(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const itemType = renderTypeReference(type.items, utils, config);
  const nullable = type.nullable ? '*' : '';
  
  return comment + 'type ' + typeName + ' ' + nullable + '[]' + itemType;
}

/**
 * Render object type as struct
 */
function renderObject(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  
  let structDeclaration = comment + 'type ' + typeName + ' struct {\\n';
  
  type.properties.forEach(prop => {
    const propComment = utils.generateComment(prop.description, prop.deprecated);
    const fieldName = utils.formatFieldName(prop.name);
    const fieldType = renderTypeReference(prop.type, utils, config);
    const optional = config.usePointersForOptional && !prop.required ? '*' : '';
    const jsonTag = utils.generateJsonTag(prop.name, prop.required);
    const validationTag = utils.generateValidationTag(prop.type.constraints);
    
    // Combine tags into single backtick string
    const tags = [jsonTag, validationTag].filter(tag => tag).join(' ');
    const tagString = tags ? ' BACKTICK' + tags + 'BACKTICK' : '';
    
    if (propComment) {
      structDeclaration += '\\t' + propComment.replace(/\\n/g, '\\n\\t');
    }
    structDeclaration += '\\t' + fieldName + ' ' + optional + fieldType + tagString + '\\n';
  });
  
  structDeclaration += '}';
  return structDeclaration;
}

/**
 * Render union type (as interface{} since Go doesn't have union types)
 */
function renderUnion(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const nullable = type.nullable ? '*' : '';
  
  // Go doesn't have union types, so we use interface{}
  return comment + 'type ' + typeName + ' ' + nullable + 'interface{}';
}

/**
 * Render reference type
 */
function renderReference(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const referenceName = utils.formatTypeName(type.reference);
  
  return comment + 'type ' + typeName + ' ' + referenceName;
}

/**
 * Render map/dictionary type
 */
function renderMap(type, utils, config) {
  const comment = utils.generateComment(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const keyType = type.keyType ? renderTypeReference(type.keyType, utils, config) : 'string';
  const valueType = renderTypeReference(type.valueType, utils, config);
  const nullable = type.nullable ? '*' : '';
  
  return comment + 'type ' + typeName + ' ' + nullable + 'map[' + keyType + ']' + valueType;
}

/**
 * Render type reference (inline type without declaration)
 */
function renderTypeReference(type, utils, config) {
  if (type.kind === 'primitive') {
    const primitiveType = mapPrimitiveType(type.primitiveType);
    return type.nullable ? '*' + primitiveType : primitiveType;
  } else if (type.kind === 'reference') {
    return utils.formatTypeName(type.reference);
  } else if (type.kind === 'array') {
    const itemType = renderTypeReference(type.items, utils, config);
    const arrayType = '[]' + itemType;
    return type.nullable ? '*' + arrayType : arrayType;
  } else if (type.kind === 'union') {
    return type.nullable ? '*interface{}' : 'interface{}';
  } else if (type.kind === 'map') {
    const keyType = type.keyType ? renderTypeReference(type.keyType, utils, config) : 'string';
    const valueType = renderTypeReference(type.valueType, utils, config);
    const mapType = 'map[' + keyType + ']' + valueType;
    return type.nullable ? '*' + mapType : mapType;
  } else {
    // For object and enum, use the type name
    return utils.formatTypeName(type.name);
  }
}

/**
 * Map primitive types to Go types
 */
function mapPrimitiveType(primitiveType) {
  switch (primitiveType) {
    case 'string': return 'string';
    case 'number': return 'float64';
    case 'integer': return 'int64';
    case 'boolean': return 'bool';
    case 'null': return 'interface{}';
    default: return 'interface{}';
  }
}
%>`;
  }
}

/**
 * Utility function to create Go generator with default config
 */
export function createGoGenerator(
  outputDir: string,
  packageName: string,
  options: Partial<GoGeneratorConfig> = {}
): GoGenerator {
  return new GoGenerator({
    outputDir,
    packageName,
    ...options,
  });
}

/**
 * Quick generation function for convenience
 */
export async function generateGoTypes(
  types: TypeDefinition[],
  outputDir: string,
  packageName: string,
  options: Partial<GoGeneratorConfig> = {}
): Promise<void> {
  const generator = createGoGenerator(outputDir, packageName, options);
  await generator.generateToFile(types);
}

/**
 * Quick generation function from schema collection
 */
export async function generateGoFromSchema(
  schema: SchemaCollection,
  outputDir: string,
  packageName: string,
  options: Partial<GoGeneratorConfig> = {}
): Promise<void> {
  const generator = createGoGenerator(outputDir, packageName, options);
  await generator.generateSchemaToFile(schema);
} 