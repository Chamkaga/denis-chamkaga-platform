// src/config/env.ts
// Centralized validated environment configuration delegated to the @dc/shared module engine.

import dotenv from 'dotenv';
import path from 'path';
import { validateBackendEnv } from '@dc/shared';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Validate and export env variables using the shared parser
const parsedEnv = validateBackendEnv(process.env);

export const env = parsedEnv;
export type Env = typeof env;
