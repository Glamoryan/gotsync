import { Command } from 'commander';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { parseSchema } from '../../../../src/core/parser/parseSchema';
import { mapSchemaCollection } from '../../../../src/core/utils/typeMapper';
import { generateTypeScriptFromSchema } from '../../../../src/core/generator/ts';
import { generateGoFromSchema } from '../../../../src/core/generator/go';
import { SchemaCollection } from '../../../../src/core/types/OpenAPISchema';

const generateCommand = new Command('generate');

generateCommand
  .description('Generate Go and TypeScript types from schema')
  .option('-c, --config <path>', 'path to config file', './gotsync.config.json')
  .option('-s, --schema <path>', 'path to schema file', './schemas/learning.yaml')
  .option('--from <path>', 'path to schema file (alternative to --schema)')
  .option('--out <path>', 'output directory for generated files')
  .option('--go-only', 'generate only Go types')
  .option('--ts-only', 'generate only TypeScript types')
  .action(async (options: { 
    config?: string; 
    schema?: string; 
    from?: string;
    out?: string;
    goOnly?: boolean; 
    tsOnly?: boolean; 
  }) => {
    const cwd = process.cwd();
    const configPath = join(cwd, options.config || './gotsync.config.json');
    
    // Determine schema path - prioritize --from, then --schema, then config
    let schemaPath: string;
    if (options.from) {
      schemaPath = join(cwd, options.from);
    } else if (options.schema) {
      schemaPath = join(cwd, options.schema);
    } else {
      // Read config to get schema path
      if (!existsSync(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`);
        console.log('Run "gotsync init" to create a configuration file.');
        process.exit(1);
      }
      
      let config;
      try {
        config = JSON.parse(readFileSync(configPath, 'utf8'));
        schemaPath = join(cwd, config.schema || './schemas/learning.yaml');
      } catch (error) {
        console.error('❌ Error reading config file:', error);
        process.exit(1);
      }
    }

    // Check if schema file exists
    if (!existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      console.log('Run "gotsync init" to create an example schema.');
      process.exit(1);
    }

    // Determine output directory
    let outputDir: string;
    if (options.out) {
      outputDir = options.out;
    } else {
      outputDir = './generated';
    }

    // Log the generation message
    console.log(`🔄 Generating Go and TS code from: ${schemaPath}`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    if (options.goOnly) {
      console.log('🎯 Generating Go types only');
    } else if (options.tsOnly) {
      console.log('🎯 Generating TypeScript types only');
    } else {
      console.log('🎯 Generating both Go and TypeScript types');
    }

    // Start code generation pipeline
    try {
      // Step 1: Parse the schema
      console.log('📖 Parsing OpenAPI schema...');
      const schema = await parseSchema(schemaPath);
      
      // Step 2: Transform to intermediate types
      console.log('🔄 Transforming to intermediate types...');
      const schemas = schema.components?.schemas || {};
      
      // Filter out ReferenceObjects and keep only SchemaObjects
      const schemaObjects: Record<string, any> = {};
      for (const [name, schemaOrRef] of Object.entries(schemas)) {
        if (!('$ref' in schemaOrRef)) {
          schemaObjects[name] = schemaOrRef;
        }
      }
      
      const mappedTypes = mapSchemaCollection(schemaObjects);
      
      // Create proper SchemaCollection
      const schemaCollection: SchemaCollection = {
        types: mappedTypes,
        rootTypes: Object.keys(mappedTypes),
        metadata: {
          title: schema.info?.title || 'Generated API',
          version: schema.info?.version || '1.0.0',
          description: schema.info?.description,
          openApiVersion: schema.openapi || '3.0.0',
          servers: schema.servers?.map(server => ({
            url: server.url,
            description: server.description,
            variables: server.variables
          })),
          paths: [] // TODO: implement path mapping if needed
        }
      };
      
      // Step 3: Ensure output directory exists
      const resolvedOutputDir = resolve(outputDir);
      if (!existsSync(resolvedOutputDir)) {
        mkdirSync(resolvedOutputDir, { recursive: true });
      }
      
      // Step 4: Generate code based on flags
      const promises: Promise<void>[] = [];
      
      if (!options.goOnly) {
        // Generate TypeScript
        console.log('🟦 Generating TypeScript types...');
        promises.push(generateTypeScriptFromSchema(
          schemaCollection,
          resolvedOutputDir,
          {
            fileName: 'types.ts',
            fileHeader: '// Auto-generated TypeScript types\n// Do not edit manually',
            includeJsDoc: true,
            useOptionalProperties: true,
            exportTypes: true,
          }
        ));
      }
      
      if (!options.tsOnly) {
        // Generate Go
        console.log('🟩 Generating Go types...');
        promises.push(generateGoFromSchema(
          schemaCollection,
          resolvedOutputDir,
          'types',
          {
            fileName: 'types.go',
            fileHeader: '// Auto-generated Go types\n// Do not edit manually',
            includeJsonTags: true,
            includeValidationTags: false,
            usePointersForOptional: true,
            omitEmptyTags: true,
          }
        ));
      }
      
      // Wait for all generations to complete
      await Promise.all(promises);
      
      console.log('✅ Code generation completed successfully!');
      console.log(`📁 Output directory: ${resolvedOutputDir}`);
      
      // List generated files
      if (!options.goOnly) {
        console.log('🟦 Generated TypeScript: types.ts');
      }
      if (!options.tsOnly) {
        console.log('🟩 Generated Go: types.go');
      }
      
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
      process.exit(1);
    }
  });



export { generateCommand }; 