import { DomainEvent } from '@dc/shared';

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserLoggedInPayload {
  userId: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserLoggedOutPayload {
  userId: string;
  sessionId?: string;
}

export interface PasswordChangedPayload {
  userId: string;
}

export interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  token: string;
}

export interface PasswordResetCompletedPayload {
  userId: string;
}

export interface RoleChangedPayload {
  userId: string;
  oldRole: string;
  newRole: string;
}

export interface PermissionChangedPayload {
  roleId: string;
  permissions: string[];
}

export const createAuthEvent = <T>(name: string, data: T, actorId?: string): DomainEvent<T> => ({
  id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  name,
  version: 1,
  occurredAt: new Date(),
  correlationId: `${Date.now()}`,
  actorId,
  data,
});
