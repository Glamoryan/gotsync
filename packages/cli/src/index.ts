#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';

const program = new Command();

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

program
  .name('gotsync')
  .description('CLI tool for gotsync - Generate Go and TypeScript types from JSON schema')
  .version(packageJson.version);

// Add commands
program.addCommand(initCommand);
program.addCommand(generateCommand);

// Run the program
program.parse(process.argv); 