const SwaggerParser = require('@apidevtools/swagger-parser');
import { OpenAPIV3 } from 'openapi-types';
import { existsSync, readFileSync } from 'fs';
import { extname } from 'path';
import * as yaml from 'js-yaml';

/**
 * Parses and dereferences an OpenAPI 3.0+ schema from a file path
 * 
 * @param filePath - Path to the OpenAPI schema file (YAML or JSON)
 * @returns Promise<OpenAPIV3.Document> - The parsed and dereferenced OpenAPI document
 * @throws {Error} If the schema is invalid, unreadable, or unsupported format
 */
export async function parseSchema(filePath: string): Promise<OpenAPIV3.Document> {
  try {
    if (!existsSync(filePath)) {
      throw new Error(`Schema file not found: ${filePath}`);
    }
    const ext = extname(filePath).toLowerCase();
    if (!['.yaml', '.yml', '.json'].includes(ext)) {
      throw new Error(`Unsupported file format: ${ext}. Only .yaml, .yml, and .json are supported.`);
    }
    
    // 1. Read file content
    const fileContent = readFileSync(filePath, 'utf8');
    
    // 2. Parse content based on file extension
    let parsed;
    if (ext === '.json') {
      parsed = JSON.parse(fileContent);
    } else {
      parsed = yaml.load(fileContent);
    }

    // 3. Dereference using JS object
    const api = await SwaggerParser.dereference(parsed);
    const document = api as OpenAPIV3.Document;
    
    if (!document.openapi || !document.openapi.startsWith('3.')) {
      throw new Error(`Invalid OpenAPI version: ${document.openapi}. Only OpenAPI 3.0+ is supported.`);
    }
    
    return document;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse OpenAPI schema from ${filePath}: ${error.message}`);
    }
    throw new Error(`Failed to parse OpenAPI schema from ${filePath}: Unknown error`);
  }
}

/**
 * Validates an OpenAPI schema without dereferencing
 * 
 * @param filePath - Path to the OpenAPI schema file (YAML or JSON)
 * @returns Promise<boolean> - True if valid, false otherwise
 */
export async function validateSchema(filePath: string): Promise<boolean> {
  try {
    await SwaggerParser.validate(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Parses an OpenAPI schema and returns basic information
 * 
 * @param filePath - Path to the OpenAPI schema file (YAML or JSON)
 * @returns Promise<SchemaInfo> - Basic schema information
 */
export interface SchemaInfo {
  title: string;
  version: string;
  description?: string;
  openApiVersion: string;
  servers?: OpenAPIV3.ServerObject[];
  paths: string[];
  components?: {
    schemas?: string[];
    parameters?: string[];
    responses?: string[];
  };
}

export async function getSchemaInfo(filePath: string): Promise<SchemaInfo> {
  const document = await parseSchema(filePath);
  
  const info: SchemaInfo = {
    title: document.info.title,
    version: document.info.version,
    description: document.info.description,
    openApiVersion: document.openapi,
    servers: document.servers,
    paths: Object.keys(document.paths || {}),
  };

  if (document.components) {
    info.components = {
      schemas: document.components.schemas ? Object.keys(document.components.schemas) : [],
      parameters: document.components.parameters ? Object.keys(document.components.parameters) : [],
      responses: document.components.responses ? Object.keys(document.components.responses) : [],
    };
  }

  return info;
} 