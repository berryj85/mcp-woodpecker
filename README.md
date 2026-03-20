# MCP Woodpecker Server

A comprehensive MCP (Model Context Protocol) server for interacting with Woodpecker CI. This server provides tools to manage repositories, pipelines, secrets, registries, crons, and organization settings.

## Features

- **Repository Management**: List, get, activate, update, and delete repositories
- **Pipeline Management**: Trigger, cancel, and monitor pipelines with detailed logs
- **Secrets Management**: Create and manage repository and organization-level secrets
- **Registry Configuration**: Manage Docker registry credentials
- **Cron Jobs**: Schedule and manage automated pipeline executions
- **User & Server Info**: Get current user and server information

## Prerequisites

- Node.js 18 or higher
- A Woodpecker CI instance running
- Woodpecker API token

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Set the following environment variables:

```bash
export WOODPECKER_URL=https://woodpecker.devpuccino.com/
export WOODPECKER_API_KEY=your_api_token_here
```

### 3. Build the Project

```bash
npm run build
```

### 4. Run the Server

```bash
npm start
```

Or for development with hot reload:

```bash
npm run dev
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

## Docker Usage

### Build

```bash
docker build -t mcp-woodpecker:latest .
```

### Run

```bash
docker run -e WOODPECKER_URL=https://example.com \
           -e WOODPECKER_API_KEY=token \
           mcp-woodpecker:latest
```

## Development

### Project Structure

```
src/
├── index.ts              # Main MCP server
└── woodpecker-client.ts  # API client wrapper
```

### Debugging

Set the `DEBUG` environment variable for verbose logging:

```bash
DEBUG=* npm run dev
```

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

## License

See LICENSE file for details.

## Resources

- [Woodpecker CI Documentation](https://woodpecker-ci.org)
- [MCP Specification](https://modelcontextprotocol.io)
- [Woodpecker API Reference](https://woodpecker-ci.org/api)
