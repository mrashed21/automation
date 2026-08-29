# ADR-001: MongoDB as Primary Application Database

## Status
Accepted

## Context
The AI Content Operations Platform handles flexible, evolving schema shapes (AI research dossiers, nested multi-section script segments, A/B thumbnail variants, execution logs, and heterogeneous multi-platform analytics time-series).

## Decision
Adopt MongoDB (via Mongoose in NestJS) as the primary application database, paired with MinIO/S3 object storage for binary media assets.

## Consequences
### Positive
- Dynamic schema modeling for AI pipeline states and version history.
- High write throughput for time-series analytics snapshots.
- Efficient compound indexing across multi-tenant workspace hierarchies.
### Negative / Mitigations
- Enforce strict typing at the application boundary via Zod schemas (`@repo/validation`) and TypeScript interfaces (`@repo/types`).
