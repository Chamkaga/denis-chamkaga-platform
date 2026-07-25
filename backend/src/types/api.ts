// src/types/api.ts
// Shared API response types exported from @dc/shared to prevent duplication.

export { ApiResponse, ResponseMeta, ProblemDetails, PaginatedResponse, PaginationQuery } from '@dc/shared';

// Extend Express Request to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string;
        roleName: string;
        mustChangePassword?: boolean;
      };
    }
  }
}
