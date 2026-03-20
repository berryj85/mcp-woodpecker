# Contributing to MCP Woodpecker

Contributions are welcome! This guide will help you get started with development and contributing to the project.

## 🛠️ Development Setup

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
└── README.md                # User documentation
```

### Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript and make executable |
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode (rerun on file changes) |
| `npm run test:coverage` | Run tests and generate coverage report |

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

## 🔧 Adding New Tools

To add a new tool to the MCP server:

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

### Running Unit Tests

The project includes comprehensive unit tests with Jest and ts-jest.

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode (rerun on file changes):**
```bash
npm run test:watch
```

**Generate coverage report:**
```bash
npm run test:coverage
```

Coverage requirements:
- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

### Testing Tools Locally

```bash
# Start the server
npm run dev

# In another terminal, test a tool
curl -X POST http://localhost:3000/tools/list_repositories
```

### Writing Tests

Tests use Jest with mocked `fetch` for API calls. Key patterns:

1. **Mock API responses:**
```typescript
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve({ /* response data */ }),
});
```

2. **Test error handling:**
```typescript
mockFetch.mockResolvedValueOnce({
  ok: false,
  status: 401,
  statusText: 'Unauthorized',
  text: () => Promise.resolve('Error message'),
});
```

3. **Verify API calls:**
```typescript
expect(mockFetch).toHaveBeenCalledWith(
  'expected/url',
  expect.objectContaining({ method: 'GET' })
);
```

## 📝 Code Quality Standards

The project uses TypeScript strict mode. Ensure:
- All types are properly defined
- No implicit `any` types
- Functions have return type annotations
- Error handling is comprehensive
- JSDoc comments for public APIs

## 💡 API Integration Example

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

## 🤝 Contributing Guidelines

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch:**

```bash
git checkout -b feature/my-feature
```

3. **Make your changes** and follow the code quality standards
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

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build, dependency, or tooling changes

## 📋 Pull Request Checklist

Before submitting a PR:

- [ ] Code follows the project's style guidelines
- [ ] All functions have proper type annotations
- [ ] Error handling is implemented
- [ ] Documentation is updated if needed
- [ ] Changes have been tested locally
- [ ] Commit messages follow the convention

## 🐛 Issues and Discussions

- **Report bugs:** [GitHub Issues](https://github.com/berryj85/mcp-woodpecker/issues)
- **Discuss ideas:** [GitHub Discussions](https://github.com/berryj85/mcp-woodpecker/discussions)

## 📚 Resources

- **[Woodpecker CI Documentation](https://woodpecker-ci.org)** - Official Woodpecker documentation
- **[MCP Specification](https://modelcontextprotocol.io)** - Model Context Protocol details
- **[Woodpecker API Reference](https://woodpecker-ci.org/api)** - REST API documentation
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript documentation

## 🙏 Thank You

Thank you for contributing to MCP Woodpecker! Your improvements make this project better for everyone.
