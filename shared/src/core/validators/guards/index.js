"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProblemDetails = isProblemDetails;
exports.isApiResponse = isApiResponse;
function isProblemDetails(obj) {
    return (obj !== null &&
        typeof obj === 'object' &&
        typeof obj.type === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.status === 'number' &&
        typeof obj.detail === 'string');
}
function isApiResponse(obj) {
    return (obj !== null &&
        typeof obj === 'object' &&
        typeof obj.success === 'boolean');
}
