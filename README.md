# SaaS Docs Tool

A full-stack, multi-tenant document collaboration platform built with the MERN stack. Supports workspace-based data isolation, role-based access control, subscription-gated premium features, and a mock payment integration for both Stripe and Razorpay.

---

## ✨ Features

### Core
- **JWT Authentication** — Secure registration, login, and protected routes
- **Multi-Tenant Workspaces** — Complete data isolation per workspace; users can belong to multiple workspaces
- **Role-Based Access Control (RBAC)** — `owner`, `admin`, and `member` roles with enforced permissions on workspace and document operations
- **Document Editor** — Auto-saving document editor with rich text support for Pro users (powered by [Quill](https://quilljs.com/))

### Subscription Plans
| Feature | Free | Pro |
|---|---|---|
| Documents | Up to 3 | Unlimited |
| Editor | Basic textarea | Rich Text (Quill) |
| Markdown Export | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

### Payments
- **Stripe Mock Mode** — Automatically activates when `STRIPE_SECRET_KEY` is missing/placeholder, routing users through a custom `MockCheckout` page
- **Razorpay Mock Mode** — Toggle between Stripe and Razorpay on the Pricing page; creates a mock Razorpay order and displays an INR-denominated checkout UI

### Activity & Analytics
- Per-workspace **activity log** of all document events (create, update, delete)
- **Usage stats endpoint** for dashboards

---

## 🏗 Architecture

```
main-task-assesment/
├── backend/                 # Node.js + Express API (ESM + TypeScript)
│   └── src/
│       ├── controllers/     # Route handlers (auth, documents, workspaces, subscription, activity)
│       ├── middleware/       # JWT auth, RBAC, plan enforcement
│       ├── models/          # Mongoose schemas (User, Workspace, Document, Activity)
│       ├── routes/          # Express routers
│       └── server.ts        # App entry point
│
└── frontend/                # React 19 + Vite + TypeScript
    └── src/
        ├── pages/           # Route-level components (Dashboard, Editor, Pricing, etc.)
        ├── services/        # Axios API client with JWT interceptor
        └── App.tsx          # React Router v6 route definitions
```

### Data Flow
```
Browser → React (Vite) → Axios (with Bearer token) → Express API → MongoDB
```

### Multi-Tenancy Model
Every `Document` and `Activity` record carries a `workspaceId`. All read/write operations are scoped to the authenticated user's workspace membership, enforced in the `authorizeWorkspace` middleware.

---

## 🔌 API Documentation

**Base URL:** `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user and create a default workspace |
| `POST` | `/login` | ❌ | Login and receive a JWT |
| `GET` | `/profile` | ✅ | Get current user profile |
| `PUT` | `/profile` | ✅ | Update profile (name, etc.) |

**`POST /register` Body:**
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret", "workspaceName": "My Team" }
```

**`POST /login` Body:**
```json
{ "email": "jane@example.com", "password": "secret" }
```

---

### Workspaces — `/api/workspaces`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | ✅ | any | List all workspaces for the current user |
| `POST` | `/` | ✅ | — | Create a new workspace |
| `POST` | `/:id/members` | ✅ | owner, admin | Add a member to a workspace |
| `DELETE` | `/:id` | ✅ | owner | Delete a workspace |

**`POST /` Body:**
```json
{ "name": "New Workspace" }
```

**`POST /:id/members` Body:**
```json
{ "email": "newmember@example.com", "role": "member" }
```

---

### Documents — `/api/documents`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/` | ✅ | any | Create a document (Free: max 3 per workspace) |
| `GET` | `/workspace/:workspaceId` | ✅ | any | List all documents in a workspace |
| `GET` | `/:id` | ✅ | any | Get a single document |
| `PUT` | `/:id` | ✅ | any | Update a document (auto-save) |
| `GET` | `/:id/export` | ✅ | Pro only | Download document as `.md` file |
| `DELETE` | `/:id` | ✅ | owner, admin | Delete a document |

**`POST /` Body:**
```json
{ "workspaceId": "<id>", "title": "My Doc", "content": "" }
```

---

### Subscriptions — `/api/subscription`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/create-checkout-session` | ✅ | owner | Start a Stripe checkout session (or mock redirect) |
| `POST` | `/create-razorpay-order` | ✅ | owner | Create a Razorpay mock order |
| `POST` | `/mock-upgrade` | ✅ | owner | Manually upgrade a workspace to Pro (called by Success page) |
| `POST` | `/webhook` | ❌ | — | Stripe webhook endpoint |

**`/create-checkout-session` Body:**
```json
{ "priceId": "price_pro", "workspaceId": "<id>" }
```
**Response (mock mode):** `{ "url": "/mock-checkout?session_id=mock_..." }`

**`/create-razorpay-order` Body:**
```json
{ "priceId": "price_pro", "workspaceId": "<id>" }
```
**Response:** `{ "id": "order_mock_xxx", "amount": 2900, "currency": "INR" }`

---

### Activity — `/api/activity`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/:workspaceId` | ✅ | any member | List recent activity events |
| `GET` | `/:workspaceId/stats` | ✅ | any member | Get aggregate usage statistics |

---

