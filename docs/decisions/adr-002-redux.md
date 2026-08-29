# ADR-002: Redux Toolkit + RTK Query for Frontend State

## Status
Accepted

## Context
The platform frontend requires real-time UI synchronization, optimistic caching, automatic cache invalidation on mutations (e.g. producing video opportunities, publishing videos, toggling automation rules), and centralized auth/workspace state management.

## Decision
Use Redux Toolkit with RTK Query (`baseApi`) for all server-state caching and client slices (`authSlice`, `uiSlice`, `workspaceSlice`).

## Consequences
### Positive
- Declarative tag-based cache invalidation (`Content`, `Platform`, `Workspace`, `User`).
- Predictable client-side state across tabs and sidebars.
- Zero boilerplate data-fetching hooks with built-in loading and error states.
