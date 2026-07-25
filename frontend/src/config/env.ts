// src/config/env.ts
// Centrally loaded and validated environment configuration for Vite.

import { validateFrontendEnv } from '@dc/shared';

// We load the raw environment values from Vite
const rawEnv = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL
};

// Validate variables and export typed config
export const env = validateFrontendEnv(rawEnv);
export type Env = typeof env;
