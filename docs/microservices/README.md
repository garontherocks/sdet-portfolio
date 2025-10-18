Microservices Testing – Event-Driven Basics

Goal
- Show how to validate dependencies and event-driven updates across services.

Scenario
- Service A (Orders API) creates an order and emits an `order.created` event to a queue.
- Service B (Invoices) listens and creates an invoice; emits `invoice.created`.
- Service C (Notifications) listens and sends an email; stores a delivery log.

Test Strategy
- Contract tests: validate published event schema and required headers/metadata.
- Consumer tests: validate Service B/C can process example messages (no network) using fixtures.
- End-to-end: create order via API, then assert downstream effects (invoice exists, notification log).

Practical Steps
- Schema: define event JSON schema (see `event-schemas/order.created.schema.json`).
- Producer contract test: publish a sample event and validate with a schema validator (e.g., AJV).
- Consumer test: feed the sample event into the handler (in isolation) and assert side effects.
- E2E: poll Invoice API until invoice appears (with backoff), assert id/orderId/status.

Example Assertions
- Orders API: POST /orders -> 201 + Location header.
- Queue: message has topic `order.created`, correlationId, and valid payload by schema.
- Invoice API: GET /invoices?orderId=... -> 200 with invoice record.
- Notifications: GET /notifications?orderId=... -> 200 and status=sent.

Notes
- Prefer idempotency keys to avoid duplicates.
- Use correlationId/requestId to connect logs across services.
- For CI, stub the queue and downstream services with test doubles.

