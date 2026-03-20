# MCP Woodpecker Server

[![npm version](https://badge.fury.io/js/mcp-woodpecker.svg)](https://www.npmjs.com/package/mcp-woodpecker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for seamlessly integrating [Woodpecker CI](https://woodpecker-ci.org) with AI-powered tools. This server provides 40+ tools to manage repositories, pipelines, secrets, registries, crons, and organization settings programmatically.

Perfect for automating CI/CD workflows, integrating with Claude AI, or building custom Woodpecker management tools.

## ✨ Features

- **Repository Management** - List, get, activate, update, and delete repositories
- **Pipeline Management** - Trigger, cancel, monitor pipelines with detailed logs and status
- **Secrets Management** - Create and manage repository and organization-level secrets securely
- **Registry Configuration** - Manage Docker registry credentials for authenticated builds
- **Cron Jobs** - Schedule and manage automated pipeline executions with flexible expressions
- **User & Server Info** - Get authenticated user details and server information
- **Full Type Safety** - Built with TypeScript for reliable development

## 🚀 Quick Start

### Installation

```bash
npm install -g mcp-woodpecker
```

Or as a project dependency:

```bash
npm install mcp-woodpecker
```

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Woodpecker CI** instance running and accessible
- **API Token** from your Woodpecker instance (Personal Access Token)

### Basic Setup

1. **Get your Woodpecker API token:**
   - Navigate to your Woodpecker instance (e.g., https://woodpecker.devpuccino.com/)
   - Go to Settings → Personal Access Tokens
   - Create a new token with appropriate permissions

2. **Set environment variables:**

```bash
export WOODPECKER_URL=https://woodpecker.devpuccino.com/
export WOODPECKER_API_KEY=your_api_token_here
```

3. **Run the MCP server:**

```bash
mcp-woodpecker
```

Or in development mode with hot reload:

```bash
npm install --save-dev mcp-woodpecker
npm run dev
```

### Using with npx (No Installation)

Run the server directly without installing it globally:

```bash
export WOODPECKER_URL=https://woodpecker.devpuccino.com/
export WOODPECKER_API_KEY=your_api_token_here
npx mcp-woodpecker
```

This is useful for testing, CI/CD pipelines, or ephemeral environments.

### Using with Claude AI

Add to your `.claude/config.json`:

```json
{
  "servers": {
    "woodpecker": {
      "command": "mcp-woodpecker",
      "env": {
        "WOODPECKER_URL": "https://woodpecker.devpuccino.com/",
        "WOODPECKER_API_KEY": "your_api_token"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WOODPECKER_URL` | Base URL of your Woodpecker instance | `https://woodpecker.example.com` |
| `WOODPECKER_API_KEY` | Personal access token for API authentication | `eyJ...` |

## Available Tools

### Repository Tools

- `list_repositories` - List all accessible repositories
- `get_repository` - Get details of a specific repository
- `activate_repository` - Activate a repository
- `update_repository` - Update repository settings (trusted status, visibility, config path)
- `delete_repository` - Remove a repository from Woodpecker

### Pipeline Tools

- `list_pipelines` - List pipelines with optional filtering by branch or status
- `get_pipeline` - Get detailed pipeline information
- `get_pipeline_status` - Get pipeline status badge data
- `trigger_pipeline` - Trigger a new pipeline execution
- `cancel_pipeline` - Cancel a running pipeline
- `get_pipeline_logs` - Retrieve logs from a specific step
- `delete_pipeline_logs` - Clear pipeline logs

### Secret Management Tools

**Repository Secrets:**
- `list_secrets` - List all secrets in a repository
- `get_secret` - Get a specific secret
- `create_secret` - Create a new secret
- `update_secret` - Update an existing secret
- `delete_secret` - Remove a secret

**Organization Secrets:**
- `list_org_secrets` - List organization-level secrets
- `get_org_secret` - Get a specific org secret
- `create_org_secret` - Create a new org secret
- `update_org_secret` - Update an org secret
- `delete_org_secret` - Remove an org secret

### Registry Tools

- `list_registries` - List configured Docker registries
- `get_registry` - Get registry configuration
- `create_registry` - Add a new registry
- `delete_registry` - Remove a registry

### Cron Job Tools

- `list_crons` - List scheduled cron jobs
- `get_cron` - Get cron job details
- `create_cron` - Create a new scheduled job
- `update_cron` - Update cron configuration
- `delete_cron` - Remove a cron job

### Server Tools

- `get_current_user` - Get authenticated user information
- `get_server_info` - Get Woodpecker server version and info

## CI/CD Pipeline

This project includes a `.woodpecker.yml` configuration that provides:

### Build & Test Stages

- **Feature Builds**: Manual trigger for testing features
- **Development Builds**: Automatic on push to `develop` branch
- **Production Builds**: Automatic on version tags (v*)

### Docker Builds

- Multi-stage Docker builds with registry authentication
- Separate images for test, dev, and production environments
- Registry: `192.168.0.200:30095`

### Deployment Stages

- **Test Deployment**: Manual deployment of test image
- **Development Deployment**: Automatic deployment on develop push
- **Production Deployment**: Automatic deployment on version tag + npm publish

### npm Publishing

Production releases are automatically published to the npm registry on version tags.

## Required Secrets

For CI/CD to work, configure these secrets in your Woodpecker instance:

| Secret | Description |
|--------|-------------|
| `REGISTRY_USERNAME` | Docker registry username |
| `REGISTRY_PASSWORD` | Docker registry password/token |
| `NPM_TOKEN` | npm registry authentication token |
| `WOODPECKER_URL_TEST` | Test Woodpecker instance URL |
| `WOODPECKER_API_KEY_TEST` | Test instance API key |
| `WOODPECKER_URL_DEV` | Development Woodpecker instance URL |
| `WOODPECKER_API_KEY_DEV` | Development instance API key |
| `WOODPECKER_URL` | Production Woodpecker instance URL |
| `WOODPECKER_API_KEY` | Production instance API key |

## Repository Structure

```
feature/*     → develop (feature development)
develop       → master (testing environment)
master        → production (stable releases)
v*            → npm + docker registry (tagged releases)
```

## 🐳 Docker Usage

### Build Docker Image

```bash
docker build -t mcp-woodpecker:latest .
```

### Run in Docker

```bash
docker run -d \
  -e WOODPECKER_URL=https://woodpecker.example.com \
  -e WOODPECKER_API_KEY=your_token \
  --name mcp-woodpecker \
  mcp-woodpecker:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  mcp-woodpecker:
    build: .
    environment:
      WOODPECKER_URL: https://woodpecker.example.com
      WOODPECKER_API_KEY: ${WOODPECKER_API_KEY}
    restart: unless-stopped
```

## 🛠️ Development Guide

### Local Development Setup

1. **Clone and install:**

```bash
git clone https://github.com/berryj85/mcp-woodpecker.git
cd mcp-woodpecker
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your Woodpecker credentials
```

3. **Start development server:**

```bash
npm run dev
```

### Project Structure

```
mcp-woodpecker/
├── src/
│   ├── index.ts              # Main MCP server with all tool definitions
│   └── woodpecker-client.ts  # Woodpecker API client wrapper
├── dist/                     # Compiled JavaScript output
├── .woodpecker.yml          # CI/CD pipeline configuration
├── Dockerfile               # Container configuration
├── package.json             # Project metadata and dependencies
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

### Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm test` | Run tests (when available) |

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Output is in the dist/ directory
ls -la dist/
```

### Debugging

Enable debug logging with:

```bash
DEBUG=* npm run dev
```

For more verbose output:

```bash
NODE_DEBUG=* npm run dev
```

### Adding New Tools

1. **Add API method** to `src/woodpecker-client.ts`:

```typescript
async myNewMethod(param: string): Promise<unknown> {
  return this.request('POST', `/my/endpoint/${param}`, {});
}
```

2. **Define tool schema** in `src/index.ts`:

```typescript
{
  name: 'my_tool',
  description: 'My tool description',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter' }
    },
    required: ['param']
  }
}
```

3. **Implement tool handler**:

```typescript
else if (toolName === 'my_tool') {
  result = await client.myNewMethod(toolInput.param as string);
}
```

### Testing Tools Locally

```bash
# Start the server
npm run dev

# In another terminal, test a tool
curl -X POST http://localhost:3000/tools/list_repositories
```

### Code Style and Formatting

The project uses TypeScript strict mode. Ensure:
- All types are properly defined
- No implicit `any` types
- Functions have return type annotations
- Error handling is comprehensive

## API Integration Example

```typescript
import { WoodpeckerClient } from './src/woodpecker-client';

const client = new WoodpeckerClient({
  baseUrl: 'https://woodpecker.example.com',
  token: 'your_token'
});

// List repositories
const repos = await client.listRepositories();

// Get specific pipeline
const pipeline = await client.getPipeline('owner', 'repo', 1);

// Create a secret
await client.createSecret('owner', 'repo', {
  name: 'API_KEY',
  value: 'secret_value',
  events: ['push']
});
```

## Troubleshooting

### Authentication Error
- Verify `WOODPECKER_API_KEY` is set correctly
- Ensure the token hasn't expired
- Check that the user has appropriate permissions

### API Endpoint Not Found
- Confirm the Woodpecker version supports the endpoint
- Check the `WOODPECKER_URL` is correct and accessible

### Connection Refused
- Verify the Woodpecker instance is running
- Check network connectivity to the instance
- Ensure the URL is correct (with/without trailing slash)

## 📝 Publishing to npm

This package is published to npm as [@devpuccino/mcp-woodpecker](https://www.npmjs.com/package/mcp-woodpecker).

### Version Management

Versions follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and patches

### Release Process

1. **Update version in package.json:**

```bash
npm version major|minor|patch
```

2. **Push changes:**

```bash
git push origin master --tags
```

3. **Publish to npm:**

```bash
npm publish
```

The Woodpecker CI pipeline automatically publishes to npm on version tags.

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork the repository**
2. **Create a feature branch:**

```bash
git checkout -b feature/my-feature
```

3. **Make your changes** and follow the code style
4. **Commit with clear messages:**

```bash
git commit -m "feat: add my new feature"
```

5. **Push and create a Pull Request:**

```bash
git push origin feature/my-feature
```

### Development Workflow

- **feature/** branches → `develop` (testing)
- **develop** → `master` (production)
- **v*** tags → npm registry & docker

### Code Quality

- Use TypeScript with strict mode
- Keep functions focused and testable
- Add JSDoc comments for public APIs
- Handle errors gracefully

## 🐛 Troubleshooting

### Authentication Error
```
Error: Woodpecker API error: 401 Unauthorized
```
- Verify `WOODPECKER_API_KEY` is correct
- Check token hasn't expired
- Ensure user has API access permissions

### Connection Refused
```
Error: connect ECONNREFUSED
```
- Verify `WOODPECKER_URL` is accessible
- Check network connectivity
- Ensure Woodpecker instance is running

### Module Not Found
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```
- Run `npm install` to install dependencies
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 📄 License

MIT License © 2026 BerryJ

See [LICENSE](LICENSE) file for details.

## 🔗 Resources

- **[Woodpecker CI Documentation](https://woodpecker-ci.org)** - Official Woodpecker documentation
- **[MCP Specification](https://modelcontextprotocol.io)** - Model Context Protocol details
- **[Woodpecker API Reference](https://woodpecker-ci.org/api)** - REST API documentation
- **[npm Package](https://www.npmjs.com/package/mcp-woodpecker)** - npm registry entry
- **[GitHub Repository](https://github.com/berryj85/mcp-woodpecker)** - Source code

## 🙋 Support

- **Issues:** [GitHub Issues](https://github.com/berryj85/mcp-woodpecker/issues)
- **Discussions:** [GitHub Discussions](https://github.com/berryj85/mcp-woodpecker/discussions)
- **npm Profile:** [@devpuccino](https://www.npmjs.com/~devpuccino)
