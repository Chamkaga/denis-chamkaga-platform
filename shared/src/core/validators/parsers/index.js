"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBackendEnv = validateBackendEnv;
exports.validateFrontendEnv = validateFrontendEnv;
const schemas_1 = require("../schemas");
function validateBackendEnv(env) {
    const result = schemas_1.backendEnvSchema.safeParse(env);
    if (!result.success) {
        throw new Error(`Invalid backend environment variables: ${JSON.stringify(result.error.format())}`);
    }
    return result.data;
}
function validateFrontendEnv(env) {
    const result = schemas_1.frontendEnvSchema.safeParse(env);
    if (!result.success) {
        throw new Error(`Invalid frontend environment variables: ${JSON.stringify(result.error.format())}`);
    }
    return result.data;
}
