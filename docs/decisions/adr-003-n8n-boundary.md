# ADR-003: n8n Integration Boundary and Responsibilities

## Status
Accepted

## Context
Per Section 26, 33, and 34 of `plan.md`, the role of n8n in the architecture must be strictly bounded to prevent architectural leakage where critical domain logic is trapped inside visual workflow graphs.

## Decision
- **NestJS owns 100% of domain business logic**, validation, authorization, data persistence, and core pipeline state machines.
- **n8n is strictly an external automation orchestration layer**, handling inbound external triggers (RSS feeds, social mentions, webhooks), outbound team notifications (Slack, Discord, Email), and external platform scheduled heartbeats.
- All inbound triggers to NestJS API from n8n use secure HMAC-SHA256 authenticated webhook endpoints (`/api/v1/automation/webhook/:ruleId`).

## Consequences
### Positive
- The core platform is fully functional independently of n8n.
- Visual workflow tooling is leveraged for agile integration changes without risking core data integrity.
