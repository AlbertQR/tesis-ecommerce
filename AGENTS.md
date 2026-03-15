# AGENTS.md - Development Guide

## Project Overview

Full-stack cafe/restaurant website project ("Doña Yoli") with:
- **Frontend**: Angular 21 + Tailwind CSS 4
- **Backend**: Node.js + Express + TypeScript

## Build, Lint, and Test Commands

### Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start         # or: ng serve
npm start --open  # opens browser automatically

# Build for production
npm run build     # or: ng build

# Watch mode (development builds)
npm run watch     # or: ng build --watch --configuration development

# Run tests
npm test          # or: ng test
```

### Backend (Express + TypeScript)

```bash
cd backend

# Install dependencies
npm install

# Start development server (with ts-node-dev)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage
```

### Running Tests

**Backend tests** (Vitest):
```bash
cd backend
npm test:run
```

**Frontend tests** (Vitest via Angular):
```bash
cd frontend
npm test
```

### Running a Single Test

Angular 21 uses Vitest under the hood. To run a single test file:

```bash
# Run specific test file
ng test --include="**/app.spec.ts"

# Run tests matching a pattern (using Vitest filter)
ng test --filter="should create"
```

For more granular control, you can add a vitest.config.ts to the frontend directory:

```typescript
// vitest.config.ts (create if needed)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
  },
});
```

## Code Style Guidelines

### General Conventions

- **Angular 21**: Use standalone components (no NgModules unless necessary)
- **Structure**: Feature-based organization in `src/app/`
- **Prefix**: Use `app` prefix for components (configured in angular.json)

### Backend (Express)

- **Express.js** with TypeScript
- **JWT authentication** for protected routes
- **Zod** for request validation
- **Express-session** for cart management (session-based, not persistent)
- **PDFKit** for invoice generation

### TypeScript

- **Strict mode enabled**: All strict TypeScript options are on
- **Type annotations**: Always use explicit types for function parameters and return types
- **No implicit any**: Must specify types for all variables
- **noPropertyAccessFromIndexSignature**: Enabled - use `obj['property']` for dynamic keys, `obj.property` for known keys
- **no - allImplicitReturns**: Enabled code paths must return a value
- **noFallthroughCasesInSwitch**: Enabled - always use break or return in switch cases

### Naming Conventions

- **Components**: PascalCase (e.g., `AppComponent`, `ProductList`)
- **Files**: kebab-case (e.g., `product-list.component.ts`)
- **Test files**: `.spec.ts` suffix (e.g., `app.spec.ts`)
- **CSS classes**: kebab-case with Tailwind utilities
- **Variables/camelCase**: `const productList`, `const isActive`

### Imports

- **Order** (configured by Prettier):
  1. External Angular imports
  2. External third-party imports
  3. Internal app imports
- **Use absolute imports**: Configure paths in tsconfig.json
- **Barrel exports**: Use `index.ts` files for clean public APIs

### Templates (HTML)

- **Inline vs External**: Use `templateUrl`/`styleUrl` for components with substantial content
- **Accessibility**: Always include alt attributes, ARIA labels where appropriate
- **Structural directives**: Use `@if`, `@for`, `@switch` (Angular 17+ control flow)

### Styling

- **Tailwind CSS 4**: Use utility classes in templates
- **Custom styles**: Add to `src/styles.css` for global styles
- **Component styles**: Use `app.css` or `styleUrl` for component-specific styles
- **Brand color**: Referenced as `text-brand`, `bg-brand` in templates

### Error Handling

- **Browser errors**: Use `provideBrowserGlobalErrorListeners()` in app.config.ts
- **HTTP errors**: Handle in services with proper error typing
- **Template errors**: Use `@if` blocks to handle null/undefined values

### Testing

- **Framework**: Vitest (via Angular test builder)
- **Test file location**: Same directory as component, `.spec.ts` suffix
- **Test structure**: Use `describe` blocks with `beforeEach` for setup
- **Async tests**: Use `async/await` with `fixture.whenStable()`

### Prettier Configuration

The project uses Prettier with these settings (`.prettierrc`):

- Print width: 100 characters
- Single quotes for JavaScript/TypeScript
- Angular parser for HTML templates

Run Prettier:

```bash
# Frontend
npx prettier --write frontend/src/app/**/*.ts
npx prettier --write frontend/src/app/**/*.html

# Backend
npx prettier --write backend/src/**/*.ts
```

## File Structure

```
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── routes/            # Express routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── order.routes.ts # Cart + checkout
│   │   │   └── legal.routes.ts # Legal documents
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth middleware
│   │   ├── services/          # Business logic
│   │   ├── models/           # MongoDB models
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/            # Helpers (Zod schemas, etc.)
│   ├── vitest.config.ts      # Test configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts           # Root component
│   │   │   ├── app.html         # Root template
│   │   │   ├── app.css          # Root styles
│   │   │   ├── app.spec.ts      # Root tests
│   │   │   ├── app.config.ts    # App configuration
│   │   │   ├── app.routes.ts    # Route definitions
│   │   │   ├── core/            # Services, guards, interceptors
│   │   │   └── features/        # Page components
│   │   ├── styles.css           # Global styles
│   │   └── main.ts             # Bootstrap entry
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   └── .prettierrc
│
├── requisitos-funcionales.md
├── requisitos-no-funcionales.md
└── AGENTS.md
```

## Key Dependencies

### Frontend
- Angular 21.2.x
- Tailwind CSS 4.1.x
- Vitest 4.0.x (testing)
- TypeScript 5.9.x
- Prettier 3.8.x

### Backend
- Express.js
- TypeScript 5.x
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT auth)
- zod (validation)
- express-session (cart session)
- pdfkit (invoice generation)
- cors
- dotenv

## Database

- **MongoDB**: The backend uses MongoDB as the primary database
- **Connection**: `mongodb://localhost:27017/dona-yoli`
- **Seed data**: Automatically seeded on first run (admin user, products, categories, testimonials, combos, content, legal documents)

## Common Issues

- **Vitest globals**: Already configured in tsconfig.spec.json (`types: ["vitest/globals"]`)
- **Tailwind v4**: Uses CSS-first configuration - no tailwind.config.js needed
- **ES modules**: TypeScript is configured with `"module": "preserve"`
- **Express route ordering**: More specific routes must come before generic routes
- **Session persistence**: After modifying `req.session`, call `req.session.save()` to persist
- **Cart transformation**: Backend returns `{productId, productName, ...}` but frontend expects `{product: {...}, quantity}`

## Authentication Flow

1. User registers/logs in via `/api/auth/login` or `/api/auth/register`
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. HTTP interceptor adds `Authorization: Bearer <token>` header to requests
5. Protected routes use JWT middleware on backend
6. Cart requires authentication - redirect to login if not authenticated
