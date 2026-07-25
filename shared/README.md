# `@shared` Workspace Package

This package contains centralized types, enums, constants, feature flags, permissions, and validators for the Denis Chamkaga Platform.

## Architecture Guidelines
- **Core (`src/core/`)**: Generic infrastructure modules (e.g. Roles, Permissions, Language, standard API payloads).
- **Enterprise (`src/enterprise/`)**: System-wide business contracts (e.g. state-machine-aligned Events, generic Provider interfaces).
- **Dependency Rule**: This workspace package MUST NOT import any module from `backend` or `frontend`.

## Build
```bash
npm run build --workspace=shared
```
