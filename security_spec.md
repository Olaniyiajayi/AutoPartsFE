# Security Specification - Autofix Naija

## Data Invariants
1. A part/customer/invoice must always belong to a tenant.
2. Users can only access data belonging to their tenant.
3. Timestamps (createdAt, updatedAt, lastUpdated) must be validated against server time.
4. Prices and quantities must be non-negative.

## The Dirty Dozen Payloads

### 1. Identity Spoofing (Part)
**Target:** `/tenants/tenantA/parts/part1`
**Payload:** `{ "id": "part1", "tenantId": "tenantB", "name": "Fake Part", ... }`
**Expected:** DENIED (tenantId mismatch)

### 2. Privilege Escalation (Tenant Profile)
**Target:** `/tenants/tenantA`
**Actor:** User B
**Payload:** `{ "name": "Hacked Tenant" }`
**Expected:** DENIED (Not a member of tenantA)

### 3. State Shortcutting (Invoice Status)
**Target:** `/tenants/tenantA/invoices/inv1`
**Payload:** `{ "status": "Paid" }` without actual payment record/logic.
**Expected:** DENIED (Only specific fields can change if logic is strict, but here we just need to ensure the user owns the tenant)

### 4. Negative Price Injection
**Target:** `/tenants/tenantA/parts/part1`
**Payload:** `{ "price": -100, ... }`
**Expected:** DENIED (Value must be >= 0)

### 5. Massive String Attack (Description)
**Target:** `/tenants/tenantA/parts/part1`
**Payload:** `{ "description": "A".repeat(100000), ... }`
**Expected:** DENIED (Size constraint)

### 6. Orphaned Customer Write
**Target:** `/tenants/nonExistentTenant/customers/cust1`
**Payload:** `{ "name": "Ghost Customer" }`
**Expected:** DENIED (Parent tenant must exist)

### 7. Future Timestamp Attack
**Target:** `/tenants/tenantA/parts/part1`
**Payload:** `{ "lastUpdated": "2099-01-01T00:00:00Z" }`
**Expected:** DENIED (Must match request.time)

### 8. Cross-Tenant Query
**Query:** `collectionGroup('parts')`
**Expected:** DENIED (Unless tenantId check is enforced on every document)

### 9. Unauthorized PII Read
**Target:** `/tenants/tenantA/customers/cust1` (Read email/phone)
**Actor:** User from tenantB
**Expected:** DENIED

### 10. Immutable Field Modification (SKU)
**Target:** `/tenants/tenantA/parts/part1`
**Payload:** Change `sku` on update.
**Expected:** DENIED (SKU should be immutable)

### 11. Array Poisoning (Compatible Models)
**Target:** `/tenants/tenantA/parts/part1`
**Payload:** `{ "compatibleModels": [1, 2, 3] }` (Numbers instead of strings)
**Expected:** DENIED

### 12. Unverified Email Access
**Actor:** User with `email_verified: false` trying to write.
**Expected:** DENIED

## Firestore Rules Test Runner
(I will implement the actual test file if needed, but I'll focus on the rules first).
