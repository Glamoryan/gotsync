import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const generateCommand = new Command('generate');

generateCommand
  .description('Generate Go and TypeScript types from schema')
  .option('-c, --config <path>', 'path to config file', './gotsync.config.json')
  .option('-s, --schema <path>', 'path to schema file', './schemas/learning.yaml')
  .option('--from <path>', 'path to schema file (alternative to --schema)')
  .option('--out <path>', 'output directory for generated files')
  .option('--go-only', 'generate only Go types')
  .option('--ts-only', 'generate only TypeScript types')
  .action((options: { 
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

    // TODO: Connect to codegen packages
    console.log('⚠️  Code generation will be implemented when codegen packages are connected.');
    console.log('✅ Generation setup completed!');
  });



export { generateCommand }; 