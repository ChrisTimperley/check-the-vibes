# Copilot Instructions for check-the-vibes

## Project Overview

Check-the-vibes is a web application that analyzes GitHub repositories to assess software engineering best practices and team collaboration. It provides detailed metrics about pull requests, issues, and contributor activity through an interactive dashboard.

**Architecture:** Full-stack TypeScript application with:

- **Backend:** Fastify API server with GitHub API integration
- **Frontend:** React + Material-UI dashboard
- **Data:** GitHub REST API and GraphQL API integration

## Key Technologies & Stack

- **Backend:** Node.js 22+, Fastify, TypeScript, Pino logging
- **Frontend:** React 19, Material-UI (MUI), Vite, TypeScript
- **GitHub Integration:** @octokit/rest, @octokit/graphql
- **Tooling:** ESLint, Prettier, Vitest, pre-commit hooks
- **Package Manager:** npm 10+

## Development Setup

### Standard Setup

1. Requires Node.js 22+ and npm 10+
2. Run `npm install` to install dependencies
3. Create `.env` file with `GITHUB_TOKEN=your_token_here`
4. Use `npm run dev` to start both frontend and backend
5. Frontend runs on port 3000, backend on port 8080

### Dev Container Support

The repository includes VS Code DevContainer configuration (`.devcontainer/devcontainer.json`) for a complete development environment with:

- Node.js 22 runtime with TypeScript support
- Pre-installed extensions (ESLint, Prettier, TypeScript, OpenAPI)
- Auto-configured settings for consistent code formatting
- GitHub CLI, Git, Python, and pre-commit hooks
- Automatic dependency installation and pre-commit setup

### VS Code Tasks

Predefined VS Code tasks are available in `.vscode/tasks.json`:

- **Build**: `npm run build` with TypeScript problem matching
- **Dev**: `npm run dev` to start development servers
- **Test**: `npm run test` with test problem matching
- **Lint**: `npm run lint` with ESLint problem matching
- **Clean**: `npm run clean` to remove build artifacts

## Code Organization

### Shared Structure (`shared/`)

- `types/` - **Shared TypeScript type definitions** used by both frontend and backend
  - Single source of truth for data structures
  - Ensures type consistency across the full stack
  - See `shared/types/README.md` for usage guidelines

### Backend Structure (`src/`)

- `server.ts` - Main Fastify server configuration
- `routes/` - API route handlers (health, analyze)
- `services/` - Business logic (GitHub API integration)
- `utils/` - Utility functions (validation, helpers)
- `types/` - Backend-specific types (re-exports shared types)

### Frontend Structure (`frontend/src/`)

- `components/` - React components for different sections
- `data/` - Mock data and API integration
- `types/` - Frontend type definitions (re-exports shared types)
- `utils/` - Utility functions

## Coding Standards & Conventions

### TypeScript Configuration

- Strict mode enabled with comprehensive type checking
- ES2023 target with NodeNext module resolution
- Isolated modules for better compilation performance

### Code Style

- **ESLint:** Use existing rules, prefer explicit over implicit
- **Prettier:** 2 spaces, single quotes, 80 char width, semicolons
- **Imports:** Use `.js` extension for imports (TSX requirement)
- **Naming:** camelCase for variables/functions, PascalCase for types/components

### API Design

- RESTful endpoints with clear naming
- TypeScript types for compile-time safety
- Simple runtime validation for inputs
- Comprehensive error handling with appropriate status codes

## Key Patterns & Architecture

### Backend Patterns

- **Simple Validation:** TypeScript types + runtime checks (no JSON Schema)
- **Plugin Architecture:** Use Fastify plugins for modularity
- **Service Layer:** Separate GitHub API logic in services
- **Schema-First:** Define JSON schemas for validation
- **Error Handling:** Return structured error responses
- **Rate Limiting:** Use Bottleneck for GitHub API rate limiting

### Frontend Patterns

- **Component Composition:** Small, focused React components
- **Material-UI:** Use MUI components consistently
- **TypeScript:** Strict typing for props and state
- **Data Grid:** Use @mui/x-data-grid for tables
- **Responsive:** Mobile-first responsive design

### GitHub API Integration

- **Octokit Libraries:** Use official GitHub SDK
- **GraphQL for Complex Queries:** PR/issue analysis with relationships
- **REST for Simple Operations:** Repository metadata, file checks
- **Pagination:** Handle GitHub API pagination properly
- **Authentication:** Support both personal access tokens

## Testing & Quality

### Testing Strategy

- **Unit Tests:** Vitest for business logic
- **API Tests:** Test routes and services
- **Mock Data:** Use consistent mock data structure
- **Coverage:** Maintain good test coverage

### Quality Gates

- **Linting:** ESLint must pass (`npm run lint`)
- **Type Checking:** TypeScript strict mode (`npm run type-check`)
- **Formatting:** Prettier consistency (`npm run format:check`)
- **Build:** Must compile successfully (`npm run build`)

## File Conventions

### Shared Files

- **Types:** `shared/types/*.ts` - Shared type definitions for both frontend and backend
  - Always add new API data types here
  - Both `src/types/` and `frontend/src/types/` re-export from here

### Backend Files

- Route handlers: `routes/*.ts`
- Services: `services/*.ts`
- Validation: `utils/validation.ts`
- Types: `types/*.ts` (re-exports from `shared/types/`)

### Frontend Files

- Components: `components/*.tsx`
- Types: `types/*.ts` (re-exports from `shared/types/`)
- Utilities: `utils/*.ts`

### Configuration Files

- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `tsconfig.json` - TypeScript compiler options
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration

## GitHub API Usage

### Authentication

- Set `GITHUB_TOKEN` environment variable
- Use Personal Access Token with appropriate scopes
- Handle rate limiting gracefully with Bottleneck

### Data Fetching Patterns

- **PR Analysis:** Use GraphQL for complex relationship data
- **Issue Tracking:** Fetch with pagination and filtering
- **Repository Metadata:** Use REST API for simple checks
- **Error Handling:** Handle 404s, rate limits, and permissions

## Common Tasks

### Adding New API Endpoints

1. Add TypeScript types to `shared/types/` for request/response
2. Create validation function in `utils/validation.ts` if needed
3. Add route handler in `routes/`
4. Implement business logic in `services/`
5. Handle errors appropriately (400 for validation, 500 for server errors)

### Adding New Frontend Components

1. Create component in `components/`
2. Add to `components/index.ts`
3. Use Material-UI components consistently
4. Add proper TypeScript props interface
5. Follow existing responsive patterns

### GitHub API Integration

1. Use appropriate Octokit client (REST vs GraphQL)
2. Handle pagination for large datasets
3. Implement proper error handling
4. Respect rate limits with Bottleneck
5. Add proper TypeScript types for responses

## Performance Considerations

- **Caching:** Consider caching GitHub API responses
- **Pagination:** Load data incrementally for large repositories
- **Rate Limiting:** Use exponential backoff for API calls
- **Bundle Size:** Lazy load components when possible
- **TypeScript:** Use strict mode for better performance

## Security Notes

- Never commit GitHub tokens or credentials
- Validate all API inputs with JSON Schema
- Use environment variables for configuration
- Follow GitHub API best practices for authentication
- Sanitize user inputs properly

## Documentation

- Update this file when adding new patterns
- Maintain accurate README.md
- Document complex business logic
- Use JSDoc comments for public APIs
- Keep API documentation current
