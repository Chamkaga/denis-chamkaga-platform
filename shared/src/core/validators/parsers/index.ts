import { backendEnvSchema, frontendEnvSchema } from '../schemas/index.js';

export function validateBackendEnv(env: Record<string, unknown>) {
  const result = backendEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid backend environment variables: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}

export function validateFrontendEnv(env: Record<string, unknown>) {
  const result = frontendEnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid frontend environment variables: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}
