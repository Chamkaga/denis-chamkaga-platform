import { ErrorCode } from './errors';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  version?: string;
  executionTime?: number;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode | string;
    message: string;
    details?: Record<string, any>;
  };
  problem?: ProblemDetails;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
