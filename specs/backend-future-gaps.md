# Backend Future Gaps

This document tracks gaps identified in the backend scaffolding audit that will be addressed in future sprints. These are non-blocking for initial implementation but important for production readiness.

## Gap 4: Event Streaming Implementation

**Description**: The `api_events_stream.ts` endpoint is scaffolded but lacks full Server-Sent Events (SSE) logic for real-time updates.

**Impact**: Real-time features (e.g., live transaction updates) won't work without proper SSE implementation.

**Recommended Solution**:

- Implement with `ReadableStream` and `EventRepository.findRecent()`.
- Add event filtering by type/user.
- Handle connection lifecycle (keep-alive, reconnection).
- Use Hono's streaming capabilities.

**Sprint Priority**: Medium (Post-MVP, when real-time features are needed).

**Implementation Notes**:

- Test with EventSource in frontend.
- Consider WebSocket fallback if SSE isn't sufficient.

## Gap 5: Health/Status Endpoints Enhancement

**Description**: `/health` and `/api/status` endpoints are basic and don't test database connectivity as implied by contracts.

**Impact**: Production monitoring won't have reliable health checks.

**Recommended Solution**:

- Enhance endpoints to perform DB queries (e.g., `SELECT 1`).
- Add response metadata (uptime, version).
- Include dependency checks (DB, external services).

**Sprint Priority**: Low (Pre-production, before deployment).

**Implementation Notes**:

- Use `db.client` for connectivity tests.
- Return structured JSON with status codes.

## Gap 6: Rate Limiting & Security Headers

**Description**: No rate limiting or security headers implemented, though production-ready backends need this.

**Impact**: Vulnerable to abuse (DDoS, brute force) and missing security best practices.

**Recommended Solution**:

- Add Hono middleware for rate limiting (e.g., based on IP).
- Implement security headers (CSP, HSTS, etc.).
- Use libraries like `hono/rate-limiter` or custom middleware.

**Sprint Priority**: High (Security sprint, before public release).

**Implementation Notes**:

- Configure per-route or global.
- Test with load tools.
- Document in API contracts.
