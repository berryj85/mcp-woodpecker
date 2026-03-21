# MCP Woodpecker Server

[![npm version](https://badge.fury.io/js/mcp-woodpecker.svg)](https://www.npmjs.com/package/mcp-woodpecker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![status-badge](https://woodpecker.devpuccino.com/api/badges/2/status.svg?events=tag)](https://woodpecker.devpuccino.com/repos/2)

A comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for seamlessly integrating [Woodpecker CI](https://woodpecker-ci.org) with AI-powered tools. This server provides 41+ tools to manage repositories, pipelines, secrets, registries, crons, and organization settings programmatically. Fully compatible with Woodpecker CI 3.13.0 API.

Perfect for automating CI/CD workflows, integrating with Claude AI, or building custom Woodpecker management tools.

## 🔄 Compatibility

| Component | Version | Notes |
|-----------|---------|-------|
| **mcp-woodpecker** | 1.1.3+ | MCP Server implementation |
| **Woodpecker CI API** | 3.13.0+ | Tested against Woodpecker CI v3.13.0 (January 2026) |
| **Node.js** | 18.0.0+ | Minimum required version |
| **MCP SDK** | ^1.27.1 | Model Context Protocol SDK |

This server is compatible with Woodpecker CI 3.13.0 and later. The implementation follows the official Woodpecker API specification with support for modern endpoints and features.

## 📝 Changelog

### v1.1.3 (2026-03-21) - Bugfix Release
- **Fixed:** `create_org_secret` tool now includes required `events` parameter — resolves "invalid secret event: no event specified" error
- **Tested:** All 24 integration tests passing

### v1.1.2 (2026-03-21) - Bugfix Release
- **Fixed:** `get_server_info` tool removed — `/version` endpoint returns HTML on live deployments
- **Fixed:** `get_pipeline_logs` now uses correct path `/repos/{id}/logs/{number}/{stepID}` (HTML was from old wrong path)
- **Fixed:** All org secret tools (`list_org_secrets`, `get_org_secret`, etc.) now use numeric `orgId` instead of org name — resolves 400 Bad Request
- **Added:** `lookup_organization` tool to resolve org name → numeric ID before secret operations
- **Tested:** All 47 unit tests passing

### v1.1.1 (2026-03-21) - Bugfix Release
- **Fixed:** `cancelPipeline` now calls `POST .../cancel` instead of `DELETE` (which deletes the pipeline permanently)
- **Fixed:** `getPipelineStatus` now maps to `GET /repos/{id}/pipelines/{number}` — no separate `/status` endpoint exists in the API
- **Fixed:** `getStepLogs` path corrected to `/repos/{id}/logs/{number}/{stepID}` per API spec
- **Fixed:** `deletePipelineLogs` path corrected to `/repos/{id}/logs/{number}` per API spec
- **Fixed:** `activateRepository` now uses `POST /repos?forge_remote_id=...` (query param, not path param)
- **Fixed:** Cron create/update now sends `schedule` field instead of `expr` to match API schema
- **Fixed:** `list_org_secrets` and all org secret tools now require numeric `orgId` (not org name) — matches `GET /orgs/{org_id}/secrets` API spec
- **Added:** `lookup_organization` tool — resolves org name → numeric ID via `GET /orgs/lookup/{org_full_name}`
- **Removed:** `get_server_info` tool — `/version` endpoint returns HTML on this deployment (no reliable alternative)
- **Tested:** All 47 unit tests updated and passing

### v1.1.0 (2026-03-21)
- **Added:** `updateRegistry()` method for updating registry credentials
- **Updated:** Version documentation and compatibility matrix
- **Tested:** Comprehensive registry CRUD operations

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
   - Navigate to your Woodpecker instance (e.g., https://woodpecker.example.com/)
   - Go to Settings → Personal Access Tokens
   - Create a new token with appropriate permissions

2. **Set environment variables:**

```bash
export WOODPECKER_URL=https://woodpecker.example.com/
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
export WOODPECKER_URL=https://woodpecker.example.com/
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
      "command": "npx",
      "args":["-y","@devpuccino/mcp-woodpecker"],
      "env": {
        "WOODPECKER_URL": "https://woodpecker.example.com/",
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
- `update_registry` - Update registry credentials (new in v1.0.0)
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

Contributions are welcome! See [CONTRIBUTE.md](CONTRIBUTE.md) for detailed guidelines on:

- Setting up your development environment
- Adding new tools to the MCP server
- Code quality standards
- Pull request process
- Commit message conventions

For bug reports and feature requests, please open an [issue](https://github.com/berryj85/mcp-woodpecker/issues).

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
