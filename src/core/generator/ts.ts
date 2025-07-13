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
 * Configuration for TypeScript code generation
 */
export interface TypeScriptGeneratorConfig {
  /** Output directory for generated files */
  outputDir: string;
  /** Output file name */
  fileName?: string;
  /** Whether to generate enums as const assertions */
  useConstEnums?: boolean;
  /** Whether to export all types */
  exportTypes?: boolean;
  /** Whether to add JSDoc comments */
  includeJsDoc?: boolean;
  /** Additional imports to include */
  additionalImports?: string[];
  /** Header comment for generated file */
  fileHeader?: string;
  /** Whether to use optional properties (?) */
  useOptionalProperties?: boolean;
  /** Whether to generate strict types */
  strictTypes?: boolean;
}

/**
 * Context for template rendering
 */
export interface RenderContext {
  types: TypeDefinition[];
  config: TypeScriptGeneratorConfig;
  utils: TemplateUtils;
}

/**
 * Template utility functions
 */
export interface TemplateUtils {
  formatTypeName: (name: string) => string;
  formatPropertyName: (name: string) => string;
  generateJsDoc: (description?: string, deprecated?: boolean) => string;
  generateValidationComment: (constraints?: ValidationConstraints) => string;
  escapeString: (str: string) => string;
}

/**
 * Main TypeScript generator class
 */
export class TypeScriptGenerator {
  private config: TypeScriptGeneratorConfig;
  private utils: TemplateUtils;

  constructor(config: TypeScriptGeneratorConfig) {
    this.config = {
      fileName: 'types.ts',
      useConstEnums: false,
      exportTypes: true,
      includeJsDoc: true,
      useOptionalProperties: true,
      strictTypes: true,
      ...config,
    };
    
    this.utils = this.createTemplateUtils();
  }

  /**
   * Generate TypeScript code from TypeDefinition array
   */
  public generateTypes(types: TypeDefinition[]): string {
    const context: RenderContext = {
      types,
      config: this.config,
      utils: this.utils,
    };

    return this.renderTemplate(context);
  }

  /**
   * Generate TypeScript code from SchemaCollection
   */
  public generateFromSchema(schema: SchemaCollection): string {
    const types = Object.values(schema.types);
    return this.generateTypes(types);
  }

  /**
   * Generate and write TypeScript files
   */
  public async generateToFile(types: TypeDefinition[]): Promise<void> {
    const code = this.generateTypes(types);
    const filePath = join(this.config.outputDir, this.config.fileName!);
    
    // Ensure output directory exists
    if (!existsSync(this.config.outputDir)) {
      mkdirSync(this.config.outputDir, { recursive: true });
    }

    // Write file
    writeFileSync(filePath, code, 'utf8');
  }

  /**
   * Generate and write TypeScript files from SchemaCollection
   */
  public async generateSchemaToFile(schema: SchemaCollection): Promise<void> {
    const types = Object.values(schema.types);
    return this.generateToFile(types);
  }

  /**
   * Render template with context
   */
  private renderTemplate(context: RenderContext): string {
    const template = this.getMainTemplate();
    return ejs.render(template, context, { escape: (str: string) => str });
  }

  /**
   * Create template utility functions
   */
  private createTemplateUtils(): TemplateUtils {
    return {
      formatTypeName: (name: string) => {
        // Ensure PascalCase for type names
        return name.charAt(0).toUpperCase() + name.slice(1);
      },

      formatPropertyName: (name: string) => {
        // Keep original property names but escape if needed
        const reservedWords = ['default', 'class', 'interface', 'type', 'enum'];
        return reservedWords.includes(name) ? `"${name}"` : name;
      },

      generateJsDoc: (description?: string, deprecated?: boolean) => {
        if (!this.config.includeJsDoc || (!description && !deprecated)) {
          return '';
        }

        let jsDoc = '/**\n';
        if (description) {
          jsDoc += ` * ${description}\n`;
        }
        if (deprecated) {
          jsDoc += ' * @deprecated\n';
        }
        jsDoc += ' */\n';
        return jsDoc;
      },

      generateValidationComment: (constraints?: ValidationConstraints) => {
        if (!constraints || !this.config.includeJsDoc) return '';
        
        const validations: string[] = [];
        if (constraints.minimum !== undefined) validations.push(`min: ${constraints.minimum}`);
        if (constraints.maximum !== undefined) validations.push(`max: ${constraints.maximum}`);
        if (constraints.minLength !== undefined) validations.push(`minLength: ${constraints.minLength}`);
        if (constraints.maxLength !== undefined) validations.push(`maxLength: ${constraints.maxLength}`);
        if (constraints.pattern) validations.push(`pattern: ${constraints.pattern}`);
        
        return validations.length > 0 ? ` // ${validations.join(', ')}` : '';
      },

      escapeString: (str: string) => {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
      },
    };
  }

  /**
   * Main template for generating TypeScript code
   */
  private getMainTemplate(): string {
    return `<% if (config.fileHeader) { %>
<%= config.fileHeader %>

<% } %>
<% if (config.additionalImports && config.additionalImports.length > 0) { %>
<% config.additionalImports.forEach(imp => { %>
<%= imp %>
<% }) %>

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
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const validationComment = utils.generateValidationComment(type.constraints);
  const typeName = utils.formatTypeName(type.name);
  const primitiveType = mapPrimitiveType(type.primitiveType);
  const nullable = type.nullable ? ' | null' : '';
  const exportKeyword = config.exportTypes ? 'export ' : '';
  
  return jsDoc + exportKeyword + 'type ' + typeName + ' = ' + primitiveType + nullable + ';' + validationComment;
}

/**
 * Render enum type
 */
function renderEnum(type, utils, config) {
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const exportKeyword = config.exportTypes ? 'export ' : '';
  const enumKeyword = config.useConstEnums ? 'const enum' : 'enum';
  
  let enumBody = type.values.map(value => {
    const label = typeof value.value === 'string' ? value.label || value.value : value.label || 'Value' + value.value;
    const enumValue = typeof value.value === 'string' ? "'" + utils.escapeString(value.value) + "'" : value.value;
    const deprecatedComment = value.deprecated ? ' // @deprecated' : '';
    return '  ' + label + ' = ' + enumValue + ',' + deprecatedComment;
  }).join('\\n');
  
  return jsDoc + exportKeyword + enumKeyword + ' ' + typeName + ' {\\n' + enumBody + '\\n}';
}

/**
 * Render array type
 */
function renderArray(type, utils, config) {
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const itemType = renderTypeReference(type.items, utils, config);
  const nullable = type.nullable ? ' | null' : '';
  const exportKeyword = config.exportTypes ? 'export ' : '';
  
  return jsDoc + exportKeyword + 'type ' + typeName + ' = Array<' + itemType + '>' + nullable + ';';
}

/**
 * Render object type as interface
 */
function renderObject(type, utils, config) {
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const exportKeyword = config.exportTypes ? 'export ' : '';
  
  let properties = type.properties.map(prop => {
    const propJsDoc = utils.generateJsDoc(prop.description, prop.deprecated);
    const propName = utils.formatPropertyName(prop.name);
    const optional = config.useOptionalProperties && !prop.required ? '?' : '';
    const propType = renderTypeReference(prop.type, utils, config);
    const readonly = prop.readOnly ? 'readonly ' : '';
    const validationComment = utils.generateValidationComment(prop.type.constraints);
    
    return (propJsDoc ? '  ' + propJsDoc.replace(/\\n/g, '\\n  ') : '') +
           '  ' + readonly + propName + optional + ': ' + propType + ';' + validationComment;
  }).join('\\n');
  
  // Handle additional properties
  if (type.additionalProperties === true) {
    properties += '\\n  [key: string]: any;';
  } else if (typeof type.additionalProperties === 'object') {
    const additionalType = renderTypeReference(type.additionalProperties, utils, config);
    properties += '\\n  [key: string]: ' + additionalType + ';';
  }
  
  return jsDoc + exportKeyword + 'interface ' + typeName + ' {\\n' + properties + '\\n}';
}

/**
 * Render union type
 */
function renderUnion(type, utils, config) {
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const unionTypes = type.types.map(t => renderTypeReference(t, utils, config)).join(' | ');
  const nullable = type.nullable ? ' | null' : '';
  const exportKeyword = config.exportTypes ? 'export ' : '';
  
  return jsDoc + exportKeyword + 'type ' + typeName + ' = ' + unionTypes + nullable + ';';
}

/**
 * Render reference type
 */
function renderReference(type, utils, config) {
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const referenceName = utils.formatTypeName(type.reference);
  const exportKeyword = config.exportTypes ? 'export ' : '';
  
  return jsDoc + exportKeyword + 'type ' + typeName + ' = ' + referenceName + ';';
}

/**
 * Render map/dictionary type
 */
function renderMap(type, utils, config) {
  const jsDoc = utils.generateJsDoc(type.description, type.deprecated);
  const typeName = utils.formatTypeName(type.name);
  const keyType = type.keyType ? renderTypeReference(type.keyType, utils, config) : 'string';
  const valueType = renderTypeReference(type.valueType, utils, config);
  const nullable = type.nullable ? ' | null' : '';
  const exportKeyword = config.exportTypes ? 'export ' : '';
  
  return jsDoc + exportKeyword + 'type ' + typeName + ' = Record<' + keyType + ', ' + valueType + '>' + nullable + ';';
}

/**
 * Render type reference (inline type without declaration)
 */
function renderTypeReference(type, utils, config) {
  if (type.kind === 'primitive') {
    const primitiveType = mapPrimitiveType(type.primitiveType);
    return type.nullable ? '(' + primitiveType + ' | null)' : primitiveType;
  } else if (type.kind === 'reference') {
    return utils.formatTypeName(type.reference);
  } else if (type.kind === 'array') {
    const itemType = renderTypeReference(type.items, utils, config);
    const arrayType = 'Array<' + itemType + '>';
    return type.nullable ? '(' + arrayType + ' | null)' : arrayType;
  } else if (type.kind === 'union') {
    const unionTypes = type.types.map(t => renderTypeReference(t, utils, config)).join(' | ');
    return type.nullable ? '(' + unionTypes + ' | null)' : unionTypes;
  } else if (type.kind === 'map') {
    const keyType = type.keyType ? renderTypeReference(type.keyType, utils, config) : 'string';
    const valueType = renderTypeReference(type.valueType, utils, config);
    const recordType = 'Record<' + keyType + ', ' + valueType + '>';
    return type.nullable ? '(' + recordType + ' | null)' : recordType;
  } else {
    // For object and enum, use the type name
    return utils.formatTypeName(type.name);
  }
}

/**
 * Map primitive types to TypeScript types
 */
function mapPrimitiveType(primitiveType) {
  switch (primitiveType) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'integer': return 'number';
    case 'boolean': return 'boolean';
    case 'null': return 'null';
    default: return 'any';
  }
}
%>`;
  }
}

/**
 * Utility function to create TypeScript generator with default config
 */
export function createTypeScriptGenerator(
  outputDir: string,
  options: Partial<TypeScriptGeneratorConfig> = {}
): TypeScriptGenerator {
  return new TypeScriptGenerator({
    outputDir,
    ...options,
  });
}

/**
 * Quick generation function for convenience
 */
export async function generateTypeScriptTypes(
  types: TypeDefinition[],
  outputDir: string,
  options: Partial<TypeScriptGeneratorConfig> = {}
): Promise<void> {
  const generator = createTypeScriptGenerator(outputDir, options);
  await generator.generateToFile(types);
}

/**
 * Quick generation function from schema collection
 */
export async function generateTypeScriptFromSchema(
  schema: SchemaCollection,
  outputDir: string,
  options: Partial<TypeScriptGeneratorConfig> = {}
): Promise<void> {
  const generator = createTypeScriptGenerator(outputDir, options);
  await generator.generateSchemaToFile(schema);
} 