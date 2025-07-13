import { Command } from 'commander';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const resetCommand = new Command('reset');

resetCommand
  .description('Reset project by removing all generated files and directories')
  .option('-f, --force', 'force reset without confirmation')
  .option('--keep-deps', 'keep node_modules and package-lock.json')
  .action((options: { 
    force?: boolean; 
    keepDeps?: boolean; 
  }) => {
    const cwd = process.cwd();
    
    // Files and directories to remove
    const itemsToRemove = [
      { path: 'schemas', type: 'directory', description: 'Schema files' },
      { path: 'gotsync.config.json', type: 'file', description: 'Configuration file' },
      { path: 'generated', type: 'directory', description: 'Generated code' },
      { path: 'packages/cli/dist', type: 'directory', description: 'Compiled CLI code' },
      { path: 'packages/cli/tsconfig.tsbuildinfo', type: 'file', description: 'TypeScript build info' },
    ];

    // Add dependency files if not keeping them
    if (!options.keepDeps) {
      itemsToRemove.push(
        { path: 'package-lock.json', type: 'file', description: 'Package lock file' },
        { path: 'node_modules', type: 'directory', description: 'Node modules' }
      );
    }

    // Check which items exist
    const existingItems = itemsToRemove.filter(item => 
      existsSync(join(cwd, item.path))
    );

    if (existingItems.length === 0) {
      console.log('✅ Project is already clean - no files to remove.');
      return;
    }

    // Show what will be removed
    console.log('🧹 The following items will be removed:');
    existingItems.forEach(item => {
      const icon = item.type === 'directory' ? '📁' : '📄';
      console.log(`  ${icon} ${item.path} - ${item.description}`);
    });

    // Ask for confirmation unless forced
    if (!options.force) {
      console.log('\n⚠️  This action cannot be undone!');
      console.log('Use --force flag to skip this confirmation.');
      console.log('Use --keep-deps flag to keep node_modules and package-lock.json.');
      console.log('\nRun: gotsync reset --force');
      return;
    }

    // Remove items
    let removedCount = 0;
    existingItems.forEach(item => {
      const fullPath = join(cwd, item.path);
      try {
        if (item.type === 'directory') {
          rmSync(fullPath, { recursive: true, force: true });
        } else {
          rmSync(fullPath, { force: true });
        }
        console.log(`✅ Removed: ${item.path}`);
        removedCount++;
      } catch (error) {
        console.error(`❌ Error removing ${item.path}:`, error);
      }
    });

    console.log(`\n🎉 Reset completed! Removed ${removedCount} items.`);
    
    if (!options.keepDeps) {
      console.log('\n📦 To reinstall dependencies, run: npm install');
    }
    
    console.log('🚀 To reinitialize project, run: gotsync init');
  });

export { resetCommand }; 