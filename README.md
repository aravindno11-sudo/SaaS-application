Workspace SaaS Platform - Summary
Core Features
Multi-Tenant Workspaces: Data is isolated per workspace.
RBAC: Owner (full control), Admin (manage users/docs), Member (view/edit docs).
Auto-Save: Debounced 2s save with smooth UX.
Subscription: Free (3 docs), Pro (unlimited + export + rich editor).
Mock Payments: Stripe & Razorpay flows.
API Overview
Auth
POST /auth/register - Create user + workspace
POST /auth/login - Get JWT
Workspaces
GET /workspaces - List
POST /workspaces - Create
POST /workspaces/:id/members - Add user
DELETE /workspaces/:id - Delete
Documents
GET /documents/workspace/:id - List
POST /documents - Create (limit enforced)
GET /documents/:id - Get
PUT /documents/:id - Update
DELETE /documents/:id - Delete
GET /documents/:id/export - Export (Pro)
Activity
GET /activity/:workspaceId - Logs
GET /activity/:workspaceId/stats - Stats
Subscription
POST /subscription/create-checkout-session - Stripe
POST /subscription/create-razorpay-order - Razorpay
Key Idea
Workspace = boundary for data, permissions, and billing
