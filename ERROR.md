# Error Log

No open errors. All previous issues have been resolved.

---

## Resolved Errors

### ERROR-001: Docker Compose Startup
- **Date**: 2026-08-23
- **Feature**: Infrastructure
- **Issue**: Docker daemon connection error when Docker Desktop is closed.
- **Solution**: Start Docker Desktop before running `docker compose up -d`.
- **Status**: Resolved

---

### ERROR-002: Next.js Monorepo Root Resolution
- **Date**: 2026-08-23
- **Feature**: Frontend Build
- **Issue**: `create-next-app` generated an inner `.git` in `apps/web`, isolating Turbopack from workspace root.
- **Solution**: Removed inner `.git`, set unified repository root, and configured `turbopack.root` and `transpilePackages` in `next.config.ts`.
- **Status**: Resolved

---

### ERROR-003: ESLint 9 Flat Config Resolution in Workspace
- **Date**: 2026-08-23
- **Feature**: Tooling & Lint
- **Issue**: Subpath imports (`@repo/eslint-config/nest`) failed to resolve across workspace packages.
- **Solution**: Added `"exports"` map in `packages/eslint-config/package.json` and adjusted reflection rules for NestJS DI.
- **Status**: Resolved

---
