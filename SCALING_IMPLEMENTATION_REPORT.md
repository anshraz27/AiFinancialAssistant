# FinScope Scaling Implementation Report

## Overview

The application evolved from a synchronous CRUD backend into an event-driven finance platform while keeping existing REST CRUD endpoints intact.

```text
REST Controller / Worker / GraphQL
        ↓
     Shared Service
        ↓
    Domain Event
        ↓
SSE / Email / Cache / Future listeners
```

## Phase 1 — Shared services and domain events

Added a lightweight internal event bus using Node's built-in `EventEmitter`.

```js
// server/events/domainEvents.js
const { EventEmitter } = require('events');

const domainEvents = new EventEmitter();

const emit = (type, payload = {}) => domainEvents.emit(type, {
  type,
  occurredAt: new Date().toISOString(),
  ...payload,
});
```

Event types are centralized:

```js
TRANSACTION_CREATED: 'transaction.created',
RECEIPT_SCAN_COMPLETED: 'receipt.scan.completed',
REPORT_GENERATION_COMPLETED: 'report.generation.completed',
BUDGET_THRESHOLD_EXCEEDED: 'budget.threshold.exceeded',
```

### Interview explanation

- Controllers no longer need to know every downstream action.
- SSE, email, audit logging, and cache invalidation can subscribe without rewriting transaction logic.
- This creates a migration path toward Kafka, Redis Streams, or another distributed event system when needed.

## Phase 2 — BullMQ background processing

Added BullMQ queues for expensive receipt scans and report-generation preparation.

```js
// server/jobs/queues.js
const { Queue } = require('bullmq');

const connection = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  maxRetriesPerRequest: null,
};

const receiptQueue = new Queue('receipt.scan', { connection });
const reportQueue = new Queue('report.generate', { connection });
```

Receipt processing now follows this asynchronous flow:

```text
Upload receipt
  → Store image in S3
  → Add BullMQ job with user and image metadata
  → Return HTTP 202 with jobId
  → Worker calls AI service
  → Worker creates pending-review expense
  → Worker emits completion event
```

Controller response:

```js
return res.status(202).json({
  success: true,
  message: 'Receipt scan queued. Check the job status for the draft expense.',
  jobId: job.id,
});
```

### Interview explanation

- The API server returns immediately instead of waiting for an AI model.
- Worker replicas can scale independently from API replicas.
- BullMQ provides retries and exponential backoff for transient failures.

## Phase 3 — Job-status REST endpoint

Added user-protected job status polling:

```text
GET /api/jobs/receipt/:id
GET /api/jobs/report/:id
```

Core authorization check:

```js
const job = await queue.getJob(req.params.id);

if (!job || job.data.userId !== req.user._id.toString()) {
  return res.status(404).json({ message: 'Job not found.' });
}
```

The response includes job state, progress, result, and failure reason.

### Interview explanation

Polling is a reliable fallback for clients that cannot keep a real-time connection open.

## Phase 4 — SSE real-time updates

Added an authenticated Server-Sent Events endpoint:

```text
GET /api/events/stream?token=<jwt>
```

SSE forwards only events owned by the authenticated user:

```js
const forward = (event) => {
  if (event.userId === id) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }
};
```

Example event:

```json
{
  "type": "receipt.scan.completed",
  "occurredAt": "2026-08-20T10:00:00.000Z",
  "userId": "user-id",
  "jobId": "42",
  "expenseId": "expense-id"
}
```

### Interview explanation

SSE was selected over WebSockets because updates are server-to-client only. It is simpler to operate, supports automatic reconnection, and works well through standard HTTP infrastructure.

## Phase 5 — Event-driven budget alerts

Budget checking was moved into a shared service.

```js
const checkBudgetAlert = async ({ userId, category }) => {
  const budgets = await Budget.find({ userId, category, isActive: true });

  // Recalculate actual spend from transactions.
  // Update budget state and emit only when a threshold is crossed.
};
```

When an expense is created or a receipt expense is confirmed:

```js
emit(events.TRANSACTION_CREATED, {
  userId: user.toString(),
  transactionId: transaction.id,
  type,
  category,
  amount,
});

if (type === 'expense') {
  await checkBudgetAlert({ userId: user, category });
}
```

Threshold crossings emit a dedicated event:

```js
emit(events.BUDGET_THRESHOLD_EXCEEDED, {
  userId,
  budgetId: budget.id,
  category,
  spent,
  limit: budget.amount,
  threshold: budget.alertThreshold,
});
```

### Interview explanation

- Actual transaction data is used instead of assuming `Budget.spent` is current.
- Alerts fire only on threshold crossings, avoiding repeated notifications.
- Manual and receipt-confirmed expenses follow the same alert path.

## Phase 6 — GraphQL dashboard analytics

REST remains responsible for CRUD. GraphQL was added for read-heavy dashboard aggregation.

```graphql
query {
  dashboardAnalytics {
    dashboardSummary {
      balance
      income
      expenses
      savingsRate
    }
    spendingByCategory {
      category
      total
      percentage
    }
    monthlyCashflow {
      month
      income
      expenses
    }
    budgetHealth {
      category
      spent
      limit
      status
    }
  }
}
```

Endpoint:

```text
POST /api/graphql
Authorization: Bearer <token>
```

### Interview explanation

- The dashboard gets related analytics in one request.
- The frontend requests only fields it needs.
- Existing REST CRUD endpoints remain stable, reducing migration risk.

## Phase 7 — Operations, tests, and documentation

Added:

- `npm run worker` for standalone background workers.
- A Docker Compose `worker` service.
- Unit tests for domain events and the event catalog.
- README documentation for queues, SSE, GraphQL, and worker startup.
- `bullmq`, `ioredis`, `graphql`, and `express-graphql` dependencies.

Validation performed:

```text
✓ JavaScript syntax checks
✓ npm test: 2 passing tests
✓ BullMQ queue initialization
✓ BullMQ / ioredis / GraphQL module-load smoke test
✓ Docker Compose configuration parse
```

## Deployment model

```text
Frontend
  ├── REST CRUD calls
  ├── SSE subscription
  └── GraphQL dashboard query

API service
  ├── Express REST API
  ├── Job-status API
  ├── SSE event stream
  └── GraphQL analytics

Redis
  ├── Cache
  └── BullMQ queue state

Worker service
  ├── Receipt AI processing
  └── Report data generation

MongoDB
  ├── Transactions
  ├── Budgets
  └── Investments
```

## Interview-ready summary

> I improved the application's scalability by separating HTTP request handling from expensive work. Receipt scanning and report generation now run through BullMQ workers backed by Redis, while the API returns job IDs immediately. I introduced domain events to decouple business operations from side effects such as budget alerts, email, and real-time notifications. SSE delivers user-scoped job updates, and GraphQL provides efficient dashboard analytics without replacing existing REST CRUD APIs. The result is independently scalable API and worker services with a clear path toward distributed event infrastructure if traffic grows further.

## Deployment note

Receipt image URLs must be reachable by the configured vision provider. For private S3 buckets, use presigned URLs in the upload service.
