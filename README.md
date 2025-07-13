[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/gotsync.svg)](https://www.npmjs.com/package/gotsync)
[![Build](https://img.shields.io/github/actions/workflow/status/Glamoryan/gotsync/ci.yml)](https://github.com/Glamoryan/gotsync/actions)

# GotSync

GotSync is a fullstack-friendly CLI tool that generates fully typed Go and TypeScript code from OpenAPI specs. It aims to bridge the gap between backend and frontend by enabling contract-first development, eliminating redundant code, and enforcing type safety across your stack.

## ❓ Why GotSync?

- 🔒 Avoid runtime errors by using shared, strongly typed definitions
- ✨ No more copy-pasting API routes or manually writing client code
- 🚀 Boost development speed with schema-driven code generation
- 📦 Seamless monorepo support for scalable fullstack projects

## 👥 Who is GotSync for?

- Go + TypeScript fullstack developers
- Backend teams using OpenAPI for contract-first APIs
- Frontend developers tired of typing `any` or duplicating models

## Generated Outputs

```ts
// TypeScript SDK (generated)
export async function getUserById(id: string): Promise<User> {
  return fetch(`/api/user/${id}`).then((res) => res.json());
}
```

```go
// Go Handler Stub (generated)
func GetUserById(w http.ResponseWriter, r *http.Request) {
  // TODO: Implement logic
}
```

## 📋 Table of Contents

- [GotSync](#gotsync)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎯 Features](#-features)
  - [🚀 Quick Start](#-quick-start)
    - [Installation](#installation)
    - [Project Initialization](#project-initialization)
    - [Code Generation](#code-generation)
  - [📁 Project Structure](#-project-structure)
  - [🛠️ Development](#️-development)
    - [Development Environment](#development-environment)
    - [Build](#build)
    - [Test](#test)
  - [📝 Commands](#-commands)
    - [init](#init)
    - [generate](#generate)
  - [⚙️ Configuration](#️-configuration)
    - [gotsync.config.json](#gotsynconfigjson)
    - [Example Configuration](#example-configuration)
  - [🔧 CLI Options](#-cli-options)
  - [🎨 Examples](#-examples)
    - [Basic Usage](#basic-usage)
    - [Advanced Usage](#advanced-usage)
  - [🏗️ Architecture](#️-architecture)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

## 🎯 Features

- **OpenAPI 3.0.3 Support**: Full OpenAPI schema support
- **Multi-language Support**: Go and TypeScript code generation
- **Flexible Configuration**: Customizable output settings
- **Workspace Support**: Monorepo structure
- **TypeScript Strict Mode**: Safe type checking
- **Development Mode**: Hot reload for rapid development
- **CLI Interface**: User-friendly command-line interface

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Glamoryan/gotsync.git
cd gotsync

# Install dependencies
npm install

# Build the CLI
npm run build
```

### Project Initialization

```bash
# Start a new project
npm run cli -- init

# Or in development mode
cd packages/cli && npm run dev -- init
```

This command creates:
- `schemas/learning.yaml` - Example OpenAPI schema file
- `gotsync.config.json` - Project configuration file

### Code Generation

```bash
# Generate Go and TypeScript code
npm run cli -- generate

# Generate only Go code
npm run cli -- generate --go-only

# Generate only TypeScript code
npm run cli -- generate --ts-only

# Custom schema file and output directory
npm run cli -- generate --from ./api/schema.yaml --out ./src/types
```

## 📁 Project Structure

```
gotsync/
├── packages/
│   └── cli/                    # CLI package
│       ├── src/
│       │   ├── index.ts        # Main entry point
│       │   └── commands/
│       │       ├── init.ts     # Init command
│       │       └── generate.ts # Generate command
│       ├── dist/               # Compiled files
│       ├── package.json        # CLI package configuration
│       └── tsconfig.json       # TypeScript configuration
├── schemas/                    # OpenAPI schema files (after init)
│   └── learning.yaml           # Example learning API schema
├── generated/                  # Generated code files (after generate)
│   ├── go/                     # Go type definitions
│   └── ts/                     # TypeScript type definitions
├── gotsync.config.json         # Project configuration (after init)
├── package.json                # Root workspace configuration
├── tsconfig.json               # Root TypeScript configuration
└── README.md                   # This file
```

## 🛠️ Development

### Development Environment

```bash
# Development mode (hot reload)
cd packages/cli
npm run dev -- --help

# Build
npm run build

# Clean
npm run clean
```

### Build

```bash
# Build all packages
npm run build

# Build only CLI package
npm run build --workspace=packages/cli

# Build with TypeScript project references
npx tsc --build
```

### Test

```bash
# Test CLI commands
npm run cli -- --help
npm run cli -- init
npm run cli -- generate --help
```

## 📝 Commands

### init

Initializes a new gotsync project.

```bash
npm run cli -- init [options]
```

**Options:**
- `-f, --force` - Overwrite existing files

**Generated files:**
- `gotsync.config.json` - Project configuration
- `schemas/learning.yaml` - Example OpenAPI schema

### generate

Generates Go and TypeScript types from OpenAPI schema.

```bash
npm run cli -- generate [options]
```

**Options:**
- `-c, --config <path>` - Configuration file path (default: `./gotsync.config.json`)
- `-s, --schema <path>` - Schema file path (default: `./schemas/learning.yaml`)
- `--from <path>` - Schema file path (alternative)
- `--out <path>` - Output directory
- `--go-only` - Generate only Go types
- `--ts-only` - Generate only TypeScript types

## ⚙️ Configuration

### gotsync.config.json

```json
{
  "schema": "./schemas/learning.yaml",
  "output": {
    "go": {
      "path": "./generated/go",
      "package": "models"
    },
    "typescript": {
      "path": "./generated/ts",
      "module": "commonjs"
    }
  }
}
```

### Example Configuration

```json
{
  "schema": "./api/openapi.yaml",
  "output": {
    "go": {
      "path": "./internal/types",
      "package": "types"
    },
    "typescript": {
      "path": "./src/types",
      "module": "es6"
    }
  }
}
```

## 🔧 CLI Options

| Option | Shorthand | Description | Default |
|--------|-----------|-------------|---------|
| `--config` | `-c` | Configuration file path | `./gotsync.config.json` |
| `--schema` | `-s` | Schema file path | `./schemas/learning.yaml` |
| `--from` | - | Schema file path (alternative) | - |
| `--out` | - | Output directory | `./generated` |
| `--go-only` | - | Generate only Go types | `false` |
| `--ts-only` | - | Generate only TypeScript types | `false` |
| `--force` | `-f` | Overwrite existing files | `false` |

## 🎨 Examples

### Basic Usage

```bash
# 1. Initialize project
npm run cli -- init

# 2. Edit schema file
vim schemas/learning.yaml

# 3. Generate code
npm run cli -- generate
```

### Advanced Usage

```bash
# Use custom schema file
npm run cli -- generate --from ./api/users.yaml --out ./src/generated

# Generate only Go code
npm run cli -- generate --go-only --out ./pkg/models

# Generate only TypeScript code
npm run cli -- generate --ts-only --out ./types
```

## 🏗️ Architecture

GotSync is a CLI tool built with monorepo structure:

- **Workspace**: Package management with NPM workspaces
- **TypeScript**: Strict mode and ES2020 support
- **Commander.js**: CLI command management
- **Modular Structure**: Easily extensible command structure

## 🤝 Contributing

- Not yet

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**GotSync** - Generate type-safe code from your OpenAPI schemas automatically! 🚀 