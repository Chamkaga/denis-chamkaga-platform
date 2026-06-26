# Coding Standards

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Language & Runtime

| Context | Language | Standard |
|---------|----------|----------|
| Frontend | TypeScript (strict) | ES2023 |
| Backend | TypeScript (strict) | ES2023 |
| Styling | Tailwind CSS | Utility-first |
| Database | Prisma Schema Language | Prisma 6.x |
| Config Files | TypeScript or JSON | — |

---

## 2. Naming Conventions

### Files & Directories

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `Button.tsx`, `ProjectCard.tsx` |
| Component Directories | PascalCase | `Button/`, `ProjectCard/` |
| Pages | PascalCase + "Page" suffix | `HomePage.tsx`, `AboutPage.tsx` |
| Hooks | camelCase with "use" prefix | `useAuth.ts`, `useTheme.ts` |
| Services | camelCase + ".service" suffix | `auth.service.ts` |
| Controllers | camelCase + ".controller" suffix | `auth.controller.ts` |
| Routes | camelCase + ".routes" suffix | `auth.routes.ts` |
| Middleware | camelCase + ".middleware" suffix | `auth.middleware.ts` |
| Validators | camelCase + ".validator" suffix | `auth.validator.ts` |
| Store files | camelCase with "use" prefix + "Store" | `useAuthStore.ts` |
| Type files | camelCase + ".types" suffix | `api.types.ts` |
| Test files | Same as source + ".test" suffix | `Button.test.tsx` |
| Utility files | camelCase | `helpers.ts`, `formatters.ts` |
| Constants | camelCase file, UPPER_SNAKE values | `constants.ts` |
| CSS files | camelCase or matches component | `index.css` |
| Translation files | Locale code | `en.json`, `sw.json` |

### Code

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `userName`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| Functions | camelCase | `handleSubmit`, `formatDate` |
| React Components | PascalCase | `Button`, `ProjectCard` |
| Interfaces | PascalCase with "I" prefix (optional) | `User`, `ApiResponse` |
| Types | PascalCase | `ButtonVariant`, `LeadStatus` |
| Enums | PascalCase | `ProjectStatus`, `LeadTemperature` |
| Enum Values | UPPER_SNAKE_CASE | `IN_PROGRESS`, `HOT_LEAD` |
| Database tables | snake_case (Prisma maps) | `blog_posts`, `chat_sessions` |
| Database columns | snake_case | `created_at`, `is_active` |
| API endpoints | kebab-case | `/api/v1/blog-posts` |
| URL slugs | kebab-case | `my-first-project` |
| CSS classes | Tailwind utilities | `bg-primary text-white` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |

---

## 3. TypeScript Rules

```typescript
// ✅ DO: Use explicit return types on public functions
function getUser(id: string): Promise<User> { ... }

// ✅ DO: Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  firstName: string;
}

// ✅ DO: Use type for unions, intersections, and utility types
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type WithId<T> = T & { id: string };

// ✅ DO: Use const assertions for fixed values
const ROLES = ['admin', 'editor'] as const;
type Role = typeof ROLES[number];

// ❌ DON'T: Use `any` — use `unknown` if type is truly unknown
// ❌ DON'T: Use non-null assertions (!) unless absolutely necessary
// ❌ DON'T: Ignore TypeScript errors with @ts-ignore
// ❌ DON'T: Use default exports (use named exports)
```

### Strict Mode Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 4. React Rules

```tsx
// ✅ DO: Use functional components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {children}
    </button>
  );
}

// ✅ DO: Use named exports
export { Button };

// ✅ DO: Destructure props
// ✅ DO: Provide default values for optional props
// ✅ DO: Use React.ReactNode for children type
// ✅ DO: Use semantic HTML elements
// ✅ DO: Include ARIA attributes on interactive elements

// ❌ DON'T: Use class components
// ❌ DON'T: Use inline styles (use Tailwind)
// ❌ DON'T: Hardcode text (use i18n keys)
// ❌ DON'T: Put business logic in components (use hooks/services)
// ❌ DON'T: Use index as key in lists
```

### Component Structure

Every component directory follows this pattern:

```
Button/
├── Button.tsx        # Component implementation
├── Button.test.tsx   # Unit tests
└── index.ts          # Re-export: export { Button } from './Button';
```

---

## 5. Backend Rules

### Controller Pattern

```typescript
// Controllers handle HTTP concerns only
export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, category } = req.query;
    const result = await projectService.getAll({ page, limit, category });
    res.json(successResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}
```

### Service Pattern

```typescript
// Services contain business logic — no HTTP concerns
export async function getAll(options: PaginationOptions) {
  const { page = 1, limit = 12, category } = options;
  const where = category ? { category } : {};
  
  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.project.count({ where }),
  ]);
  
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

### Route Pattern

```typescript
// Routes define endpoints and middleware chains
const router = Router();

router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);
router.post('/', authMiddleware, adminMiddleware, validate(createProjectSchema), createProject);
router.put('/:id', authMiddleware, adminMiddleware, validate(updateProjectSchema), updateProject);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProject);

export { router as projectRoutes };
```

---

## 6. API Response Format

### Success Response

```typescript
function successResponse<T>(data: T, meta?: PaginationMeta) {
  return { success: true, data, ...(meta && { meta }) };
}
```

### Error Response

```typescript
function errorResponse(code: string, message: string, details?: unknown) {
  return { success: false, error: { code, message, ...(details && { details }) } };
}
```

---

## 7. Error Handling

- **Frontend**: React Error Boundaries for component errors, try-catch for async operations
- **Backend**: Global error middleware catches all unhandled errors
- **API errors**: Always return structured JSON errors, never HTML
- **Logging**: All errors logged with Winston (backend) or console (frontend dev)

---

## 8. Import Order

```typescript
// 1. Node/built-in modules
import path from 'path';

// 2. External packages
import express from 'express';
import { z } from 'zod';

// 3. Internal aliases (@/)
import { prisma } from '@/config/database';
import { Button } from '@/components/atoms/Button';

// 4. Relative imports
import { formatDate } from './helpers';

// 5. Type imports
import type { User } from '@/types/models.types';

// 6. Style imports
import './styles.css';
```

---

## 9. Git Conventions

### Branch Naming

```
main              — Production branch
develop           — Development branch
feature/module-name  — New features
fix/bug-description  — Bug fixes
docs/section-name    — Documentation updates
```

### Commit Messages

```
feat: add project gallery component
fix: resolve JWT refresh token rotation bug
docs: update API specification for blog endpoints
style: adjust hero section spacing on mobile
refactor: extract lead scoring into separate service
test: add unit tests for auth middleware
chore: update dependencies to latest versions
```

---

## 10. Comments & Documentation

```typescript
// ✅ DO: Document complex business logic
/**
 * Calculates lead score based on conversation signals.
 * Score ranges from 0 (cold) to 100 (hot).
 * Scores above 60 trigger automatic handoff to Denis.
 */
function calculateLeadScore(session: ChatSession): number { ... }

// ✅ DO: Document non-obvious decisions
// Using cuid instead of UUID for shorter, URL-safe identifiers

// ❌ DON'T: State the obvious
// This function returns the user  ← useless comment
```
