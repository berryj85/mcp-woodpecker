# Contributing to MCP Woodpecker

Thank you for your interest in contributing to MCP Woodpecker! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-woodpecker.git
cd mcp-woodpecker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Feature Branch

```bash
# From develop branch
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
```

## Development Workflow

### Before Starting

- Check [existing issues](https://github.com/berryj85/mcp-woodpecker/issues) to avoid duplicates
- For major changes, open an issue first to discuss the approach
- Review the [README](README.md) and [Development Guide](README.md#-development-guide)

### While Developing

1. **Write clear, focused code:**
   - Use descriptive variable/function names
   - Keep functions small and testable
   - Add JSDoc comments for public APIs

2. **Follow TypeScript best practices:**
   ```typescript
   // ✅ Good
   async function activateRepository(owner: string, repo: string): Promise<void> {
     // implementation
   }

   // ❌ Avoid
   async function activate(o: any, r: any) {
     // implementation
   }
   ```

3. **Handle errors properly:**
   ```typescript
   try {
     const result = await client.doSomething();
     return { content: [{ type: 'text', text: JSON.stringify(result) }] };
   } catch (error) {
     const msg = error instanceof Error ? error.message : String(error);
     return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
   }
   ```

4. **Build and test before committing:**
   ```bash
   npm run build
   npm run dev  # Test locally
   ```

### Commit Messages

Use clear, conventional commits:

```bash
# Feature
git commit -m "feat: add new tool for xyz"

# Bug fix
git commit -m "fix: correct handling of xyz parameter"

# Documentation
git commit -m "docs: update API reference"

# Refactoring
git commit -m "refactor: simplify xyz function"
```

### Branches

- **feature/*** → `develop` branch (new features)
- **fix/*** → `develop` branch (bug fixes)
- **docs/*** → any branch (documentation)

## Pull Request Process

### 1. Prepare Your PR

```bash
# Update from develop
git fetch origin
git rebase origin/develop

# Build to ensure no errors
npm run build
```

### 2. Push Your Branch

```bash
git push origin feature/my-feature
```

### 3. Create Pull Request

On GitHub:
1. Click "New Pull Request"
2. Set base: `develop` (or `master` for hotfixes)
3. Provide a clear title: `feat: add xyz tool`
4. Fill in the description:
   - What does it do?
   - Why is it needed?
   - Any breaking changes?

### 4. PR Checklist

Before submitting, ensure:

- [ ] Code compiles without errors: `npm run build`
- [ ] No console errors or warnings
- [ ] TypeScript strict mode satisfied
- [ ] Follows code style (see below)
- [ ] Commit messages are clear
- [ ] Documentation updated if needed
- [ ] No unrelated changes included

### 5. Review Process

Maintainers will review your PR:
- Provide feedback or request changes
- Discuss design decisions
- Approve when ready

## Code Style Guide

### TypeScript

```typescript
// Use strict types
interface RepositoryConfig {
  owner: string;
  repo: string;
  isTrusted?: boolean;
}

// Use const over let
const config: RepositoryConfig = {
  owner: 'myorg',
  repo: 'myrepo'
};

// Arrow functions for simple operations
const mapped = items.map(item => item.id);

// Named functions for complexity
async function handleComplexLogic(input: string): Promise<Result> {
  // implementation
}
```

### Error Handling

```typescript
try {
  // operation
} catch (error) {
  // Log or handle appropriately
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`Operation failed: ${msg}`);
  throw new Error(`Failed: ${msg}`);
}
```

### JSDoc Comments

```typescript
/**
 * Retrieve pipeline details from Woodpecker
 * @param owner - Repository owner/organization
 * @param repo - Repository name
 * @param number - Pipeline number
 * @returns Pipeline details
 * @throws {Error} If API request fails
 */
async function getPipeline(
  owner: string,
  repo: string,
  number: number
): Promise<Pipeline> {
  // implementation
}
```

## Adding New Tools

When adding a new MCP tool:

### 1. Add API Client Method

In `src/woodpecker-client.ts`:

```typescript
async myNewFeature(owner: string, repo: string, data: unknown): Promise<unknown> {
  return this.request('POST', `/repos/${owner}/${repo}/my-endpoint`, data);
}
```

### 2. Define Tool Schema

In `src/index.ts`:

```typescript
{
  name: 'my_new_tool',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'Repository owner'
      },
      repo: {
        type: 'string',
        description: 'Repository name'
      }
    },
    required: ['owner', 'repo']
  }
}
```

### 3. Implement Tool Handler

```typescript
else if (toolName === 'my_new_tool') {
  result = await client.myNewFeature(
    toolInput.owner as string,
    toolInput.repo as string,
    toolInput.data
  );
}
```

### 4. Test the Tool

Start the dev server and test manually.

## Documentation

### Update README if You:
- Add new tools
- Change setup instructions
- Add new features
- Fix documented bugs

### Update JSDoc for:
- Public functions
- Complex logic
- Non-obvious parameters

## Questions?

- Check [existing issues](https://github.com/berryj85/mcp-woodpecker/issues)
- Open a [new discussion](https://github.com/berryj85/mcp-woodpecker/discussions)
- Email maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MCP Woodpecker! 🎉
