# API Contracts: Portfolio Card Splitter MVP

**Created**: 2025-10-17\
**Data Model**: [data-model.md](./data-model.md)

## Overview

RESTful API with Zod schema validation at boundaries. All endpoints return JSON
with consistent error handling. Money amounts transmitted as integer cents.
Dates in ISO 8601 format with Australia/Brisbane timezone.

## Base Configuration

**Base URL**: `/api`\
**Content-Type**: `application/json`\
**Authentication**: HTTP-only session cookies\
**Timezone**: Australia/Brisbane (AEST/AEDT)\
**Currency**: AUD (amounts in cents)

## Authentication Endpoints

### Bootstrap System

**POST /api/auth/bootstrap**

Creates the first admin user for fresh installations.

```typescript
// Request Schema: BootstrapRequestSchema
{
  name: string;           // min 2 chars
  email: string;          // valid email format
  password: string;       // min 8 chars, complexity rules
}

// Response Schema: BootstrapResponseSchema
{
  user: {
    id: string;
    name: string;
    email: string;
    status: "active";
  };
  message: string;
}

// Example Response
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  },
  "message": "System bootstrapped successfully"
}
```

### User Invitation

**POST /api/auth/invite**

Sends invitation email to new user (admin only).

```typescript
// Request Schema: InviteRequestSchema
{
  email: string;          // valid email format
  name?: string;          // optional display name
}

// Response Schema: InviteResponseSchema
{
  invitation: {
    email: string;
    status: "sent";
    expiresAt: string;    // ISO 8601 timestamp
  };
  message: string;
}

// Example Response
{
  "invitation": {
    "email": "alice@example.com",
    "status": "sent",
    "expiresAt": "2025-10-18T14:30:00.000Z"
  },
  "message": "Invitation sent successfully"
}
```

### Accept Invitation

**POST /api/auth/accept-invite**

Completes user registration from invitation token.

```typescript
// Request Schema: AcceptInviteRequestSchema
{
  token: string;          // invitation token from email
  password: string;       // min 8 chars, complexity rules
  name?: string;          // optional, overrides invite name
}

// Response Schema: UserResponseSchema
{
  user: {
    id: string;
    name: string;
    email: string;
    status: "active";
  };
  message: string;
}
```

### Login/Logout

**POST /api/auth/login**

```typescript
// Request Schema: LoginRequestSchema
{
  email: string;
  password: string;
}

// Response Schema: UserResponseSchema
{
  user: {
    id: string;
    name: string;
    email: string;
    status: "active";
  }
  message: string;
}
```

**POST /api/auth/logout**

```typescript
// Request: No body required
// Response Schema: MessageResponseSchema
{
  message: string;
}
```

### Password Reset

**POST /api/auth/request-reset**

```typescript
// Request Schema: RequestResetSchema
{
  email: string;
}

// Response Schema: MessageResponseSchema
{
  message: string; // Always success message (no email leakage)
}
```

**POST /api/auth/reset**

```typescript
// Request Schema: ResetPasswordSchema
{
  token: string; // reset token from email
  password: string; // new password
}

// Response Schema: MessageResponseSchema
{
  message: string;
}
```

## People Management

### List Members

**GET /api/people**

```typescript
// Query Parameters: PeopleQuerySchema
{
  includeArchived?: boolean;  // default false
}

// Response Schema: PeopleResponseSchema
{
  members: Array<{
    id: string;
    userId?: string;       // null for placeholder members
    displayName: string;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Example Response
{
  "members": [
    {
      "id": "member-123",
      "userId": "user-456",
      "displayName": "Alice Johnson",
      "archived": false,
      "createdAt": "2025-10-01T09:00:00.000Z",
      "updatedAt": "2025-10-01T09:00:00.000Z"
    }
  ]
}
```

### Create Member

**POST /api/people**

```typescript
// Request Schema: CreateMemberSchema
{
  displayName: string;    // min 2 chars
  userId?: string;        // optional, for linking existing user
}

// Response Schema: MemberResponseSchema
{
  member: {
    id: string;
    userId?: string;
    displayName: string;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}
```

### Update Member

**PATCH /api/people/:id**

```typescript
// Request Schema: UpdateMemberSchema
{
  displayName?: string;
  archived?: boolean;     // cannot archive if active allocations exist
}

// Response Schema: MemberResponseSchema
```

## Transaction Management

### List Transactions

**GET /api/transactions**

```typescript
// Query Parameters: TransactionQuerySchema
{
  limit?: number;         // default 50, max 200
  offset?: number;        // default 0
  startDate?: string;     // ISO date
  endDate?: string;       // ISO date
  memberId?: string;      // filter by allocation
  tagId?: string;         // filter by tag
}

// Response Schema: TransactionsResponseSchema
{
  transactions: Array<{
    id: string;
    postedOn: string;     // ISO date (YYYY-MM-DD)
    merchant?: {
      id: string;
      name: string;
    };
    description: string;
    amountCents: number;   // integer cents
    notes?: string;
    tags: Array<{
      id: string;
      name: string;
      color: string;       // hex color
    }>;
    allocations: Array<{
      id: string;
      member: {
        id: string;
        displayName: string;
      };
      shareType: "percent" | "amount";
      value: number;       // percentage (1-100) or cents
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

### Create Transaction

**POST /api/transactions**

```typescript
// Request Schema: CreateTransactionSchema
{
  postedOn: string;       // ISO date
  merchantId?: string;    // optional existing merchant
  merchantName?: string;  // create new merchant if not merchantId
  description: string;
  amountCents: number;    // positive integer
  notes?: string;
  tagIds?: string[];      // array of tag IDs
  allocations: Array<{
    memberId: string;
    shareType: "percent" | "amount";
    value: number;        // must sum correctly
  }>;
}

// Response Schema: TransactionResponseSchema
{
  transaction: {
    // ... full transaction object as in list response
  };
  message: string;
}
```

### Update Transaction

**PATCH /api/transactions/:id**

```typescript
// Request Schema: UpdateTransactionSchema
{
  postedOn?: string;
  merchantId?: string;
  merchantName?: string;  // will update or create merchant
  description?: string;
  amountCents?: number;
  notes?: string;
  tagIds?: string[];
  allocations?: Array<{
    memberId: string;
    shareType: "percent" | "amount";
    value: number;
  }>;
}

// Response Schema: TransactionResponseSchema
```

## Merchant and Tag Management

### List Merchants

**GET /api/merchants**

```typescript
// Query Parameters: MerchantQuerySchema
{
  search?: string;        // fuzzy search on name
  limit?: number;         // default 20
}

// Response Schema: MerchantsResponseSchema
{
  merchants: Array<{
    id: string;
    name: string;
    normalizedName: string;
    mergedIntoId?: string;  // if merged into another merchant
    transactionCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Create Merchant

**POST /api/merchants**

```typescript
// Request Schema: CreateMerchantSchema
{
  name: string; // min 1 char
}

// Response Schema: MerchantResponseSchema
{
  merchant: {
    id: string;
    name: string;
    normalizedName: string;
    transactionCount: number;
    createdAt: string;
    updatedAt: string;
  }
  message: string;
}
```

### Update/Merge Merchant

**PATCH /api/merchants/:id**

```typescript
// Request Schema: UpdateMerchantSchema
{
  name?: string;          // rename merchant
  mergeIntoId?: string;   // merge this merchant into another
}

// Response Schema: MerchantResponseSchema
```

### List Tags

**GET /api/tags**

```typescript
// Response Schema: TagsResponseSchema
{
  tags: Array<{
    id: string;
    name: string;
    color: string; // hex color #RRGGBB
    transactionCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Create Tag

**POST /api/tags**

```typescript
// Request Schema: CreateTagSchema
{
  name: string; // min 1 char, unique
  color: string; // hex color #RRGGBB
}

// Response Schema: TagResponseSchema
```

### Update Tag

**PATCH /api/tags/:id**

```typescript
// Request Schema: UpdateTagSchema
{
  name?: string;
  color?: string;
}

// Response Schema: TagResponseSchema
```

## Pot Management

### List Pots

**GET /api/pots**

```typescript
// Query Parameters: PotsQuerySchema
{
  scope?: "solo" | "shared";  // filter by scope
  includeBalances?: boolean;  // include balance calculations
}

// Response Schema: PotsResponseSchema
{
  pots: Array<{
    id: string;
    name: string;
    scope: "solo" | "shared";
    ownerMember?: {
      id: string;
      displayName: string;
    };
    accountType: "savings" | "loan" | "cash" | "other";
    institution?: string;
    maskedAccount?: string;
    physicalLocation?: string;
    balanceCents: number;
    availableCents?: number;  // if includeBalances=true
    reservedCents?: number;   // if includeBalances=true
    permissions: {
      canRead: boolean;
      canManage: boolean;
    };
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Create Pot

**POST /api/pots**

```typescript
// Request Schema: CreatePotSchema
{
  name: string;
  scope: "solo" | "shared";
  ownerMemberId?: string;     // required for solo pots
  accountType: "savings" | "loan" | "cash" | "other";
  institution?: string;
  maskedAccount?: string;
  physicalLocation?: string;
  initialBalanceCents?: number;  // default 0
  visibilityAcl?: Record<string, "read" | "manage">;  // member permissions
}

// Response Schema: PotResponseSchema
```

### Update Pot

**PATCH /api/pots/:id**

```typescript
// Request Schema: UpdatePotSchema
{
  name?: string;
  institution?: string;
  maskedAccount?: string;
  physicalLocation?: string;
  visibilityAcl?: Record<string, "read" | "manage">;
}

// Response Schema: PotResponseSchema
```

### Deposit to Pot

**POST /api/pots/:id/deposit**

```typescript
// Request Schema: DepositSchema
{
  amountCents: number;    // positive integer
  note?: string;
}

// Response Schema: PotResponseSchema
```

## Reservation Management

### Create Reservation

**POST /api/reservations**

```typescript
// Request Schema: CreateReservationSchema
{
  potId: string;
  transactionId: string;
  amountCents: number; // must not exceed transaction amount or pot balance
}

// Response Schema: ReservationResponseSchema
{
  reservation: {
    id: string;
    pot: {
      id: string;
      name: string;
    }
    transaction: {
      id: string;
      description: string;
      amountCents: number;
    }
    amountCents: number;
    createdOn: string;
  }
  message: string;
}
```

### Delete Reservation

**DELETE /api/reservations/:id**

```typescript
// Response Schema: MessageResponseSchema
{
  message: string;
}
```

## Transfer and Payment Management

### Create Transfer

**POST /api/transfers**

```typescript
// Request Schema: CreateTransferSchema
{
  fromPotId?: string;     // null for cash source
  toPotId?: string;       // null for cash destination
  amountCents: number;
  occurredOn: string;     // ISO date
  note?: string;
}

// Response Schema: TransferResponseSchema
{
  transfer: {
    id: string;
    fromPot?: {
      id: string;
      name: string;
    };
    toPot?: {
      id: string;
      name: string;
    };
    amountCents: number;
    occurredOn: string;
    note?: string;
    createdAt: string;
  };
  message: string;
}
```

### Create Payment

**POST /api/payments**

```typescript
// Request Schema: CreatePaymentSchema
{
  potId: string;
  transactionId: string;
  amountCents: number;
  paidOn: string;         // ISO date
  note?: string;
  reservationId?: string; // optional link to reservation
}

// Response Schema: PaymentResponseSchema
{
  payment: {
    id: string;
    pot: {
      id: string;
      name: string;
    };
    transaction: {
      id: string;
      description: string;
    };
    amountCents: number;
    paidOn: string;
    note?: string;
    reservation?: {
      id: string;
    };
    createdAt: string;
  };
  message: string;
}
```

## Ledger and Reporting

### Get Ledger

**GET /api/ledger**

```typescript
// Response Schema: LedgerResponseSchema
{
  memberBalances: Array<{
    member: {
      id: string;
      displayName: string;
    };
    allocatedCents: number; // total allocated to this member
    paidCents: number; // total paid by this member
    netBalanceCents: number; // allocated - paid (positive = owes money)
  }>;
  potBalances: Array<{
    pot: {
      id: string;
      name: string;
    };
    balanceCents: number;
    reservedCents: number;
    availableCents: number;
  }>;
  summary: {
    totalTransactionsCents: number;
    totalReservedCents: number;
    totalPaidCents: number;
    netBalanceCents: number; // should be close to 0
  }
}
```

### Get Audit Trail

**GET /api/audit**

```typescript
// Query Parameters: AuditQuerySchema
{
  entityType?: string;       // filter by entity type
  entityId?: string;         // filter by specific entity
  startDate?: string;        // ISO timestamp
  endDate?: string;          // ISO timestamp
  limit?: number;            // default 50
  offset?: number;           // default 0
}

// Response Schema: AuditResponseSchema
{
  events: Array<{
    id: string;
    type: string;
    actor: {
      id: string;
      name: string;
    };
    entityType: string;
    entityId: string;
    payload: Record<string, any>;  // event-specific data
    createdAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

## Real-time Events

### SSE Event Stream

**GET /api/events/stream**

```typescript
// Headers
Accept: text/event-stream
Cache-Control: no-cache

// Event Format
data: {"entity": "transaction", "id": "txn-123", "action": "created"}
data: {"entity": "pot", "id": "pot-456", "action": "updated"}
data: {"entity": "member", "id": "member-789", "action": "archived"}

// Event Schema: SSEEventSchema
{
  entity: "transaction" | "pot" | "member" | "merchant" | "tag" | "reservation" | "transfer" | "payment";
  id: string;              // entity ID
  action: "created" | "updated" | "deleted" | "archived";
}
```

## Error Responses

### Validation Errors (400)

```typescript
// ValidationErrorSchema
{
  error: "VALIDATION_ERROR";
  message: string;
  issues: Array<{
    path: string[]; // field path
    message: string; // human-readable error
    code: string; // zod error code
  }>;
}
```

### Business Rule Violations (422)

```typescript
// BusinessErrorSchema
{
  error: string;            // machine-readable code
  message: string;          // human-readable message
  details?: Record<string, any>;  // additional context
}

// Example: Allocation sum mismatch
{
  "error": "ALLOCATION_SUM_MISMATCH",
  "message": "Allocations must sum to transaction total",
  "details": {
    "transactionCents": 5000,
    "allocationSum": 4800,
    "difference": 200
  }
}
```

### Authentication Errors (401)

```typescript
// AuthErrorSchema
{
  error: "AUTHENTICATION_REQUIRED" | "INVALID_CREDENTIALS" | "SESSION_EXPIRED";
  message: string;
}
```

### Authorization Errors (403)

```typescript
// AuthorizationErrorSchema
{
  error: "INSUFFICIENT_PERMISSIONS" | "RESOURCE_ACCESS_DENIED";
  message: string;
}
```

This API contract provides a comprehensive interface for the Portfolio Card
Splitter MVP, ensuring type safety with Zod schemas and consistent error
handling across all endpoints.
