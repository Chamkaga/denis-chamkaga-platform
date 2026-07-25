import { ApiResponse, ProblemDetails } from '../../types/api';

export function isProblemDetails(obj: any): obj is ProblemDetails {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'number' &&
    typeof obj.detail === 'string'
  );
}

export function isApiResponse(obj: any): obj is ApiResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean'
  );
}
