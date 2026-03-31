# SaaS Docs Tool (MERN Multi-Tenant Platform)

A full-stack, multi-tenant document collaboration platform engineered with the MERN stack (MongoDB, Express, React, Node.js). This application enables individuals and teams to securely create, collaborate on, and manage documents within isolated workspaces. It incorporates a robust Role-Based Access Control (RBAC) system, subscription-tier limitations, and dual generic mock payment gateways (Stripe & Razorpay) for comprehensive end-to-end functionality.

---

## 🚀 Live Environments
- **Production Client (Vercel):** [https://saa-s-application-eight.vercel.app](https://saa-s-application-eight.vercel.app)
- **Production API (Render):** `https://saas-application-5.onrender.com/api`

*(Testing: You can freely register a new account utilizing mock test credentials)*

---

## 🏗 Detailed Architecture Explanation

The application follows a strictly decoupled client-server model resulting in distinct `frontend` and `backend` services.

### Backend Overview (Node.js & Express)
The backend emphasizes an **MVC-inspired architecture** coupled with comprehensive middleware injection for authorization and request validation.

1. **Routing & Controllers:** API requests are routed through modular path prefixing (`/api/auth`, `/api/documents`) into singular controllers. Controllers abstract core business logic away from the transport layer.
2. **Database Schema (MongoDB/Mongoose):** The schema emphasizes highly relational multi-tenancy.
   - `User`: Stores authentication credentials (hashed passwords) and profile data.
   - `Workspace`: The core organizational unit. Contains `name`, an array of `members` (user IDs mapped to specific roles `owner/admin/member`), and embedded `subscription` data.
   - `Document`: Represents a file strictly linked to a `workspaceId`. Has `title`, `content` (HTML/Rich Text), and timestamps.
   - `Activity`: Write-append only logs tracking semantic user actions against resources. 
3. **Security Middleware:** 
   - `protect`: Verifies the inbound JWT Bearer token and attaches the authenticated `req.user`.
   - `authorizeWorkspace(roles)`: Intercepts requests destined for workspace-sensitive routes. It queries the relevant Workspace document and verifies if the authenticated `req.user`'s ID resides in the `members` array with a role possessing sufficient privileges.

### Frontend Overview (React + Vite)
The Single Page App (SPA) utilizes Vite for fast Hot-Module Replacement (HMR) and optimized build bundling.

1. **State Management:** Uses React's `useState` and `useEffect` synchronized with an `Axios` interceptor layer ensuring JWT tokens are implicitly attached to all outbound requests securely.
2. **UI Architecture:** Built entirely utilizing **TailwindCSS** for an adaptive, fully responsive UI. Features persistent application layouts (e.g., `Sidebar` context) dynamically altering based on `activeWorkspace` subscription tiers.
3. **Editor Component:** Incorporates `Quill.js` as an un-controlled wealthy text editor container bridging continuous auto-save updates via debounced API `PUT` requests back to the server.

---

## ✨ Features Breakdown

### 1. Multi-Tenant Workspaces & Data Isolation
The core philosophy is absolute data isolation. Users log in globally but operate specifically within chosen Workspaces. All Dashboard statistics, Activity logs, Document enumerations, and subscription statuses reflect exclusively the context of the active workspace. Users can create multiple workspaces or be invited to others.

### 2. Role-Based Access Control (RBAC)
Robust permission scoping is horizontally applied across endpoints based on the `workspace.members.role` matrix:
- **Owner:** Complete control. Can update workspace billing, delete the workspace, invite admins/members, and delete any document.
- **Admin:** Management capacity. Can invite standard members, and create/update/delete documents. Will be rejected from hitting subscription APIs.
- **Member:** Operative capacity. Able to read documents, update existing document contents, and view workspace stats. Cannot delete documents or interact with billing.

### 3. Document Editing & Automatic Synchronization
Documents incorporate an intelligent debounced auto-save mechanism. When typing is detected, the frontend suppresses outbound `PUT` requests until 2 seconds of inactivity occurs, immediately persisting data over the REST API and gracefully displaying *Loading* → *Saved at [Time]* states without interrupting user workflow.

### 4. Subscription Gating (Free vs Pro Tier)
The system enforces hard server-side limitations based on the active workspace's subscription:
- **Free Tier:** Strictly enforces a maximum ceiling of 3 documents per workspace. Attempting to create a fourth triggers a 403 HTTP error specifically intercepted by the frontend to render an upsell modal. The Free tier editor utilizes a basic `<textarea>` input.
- **Pro Tier:** Unlocks unlimited document creation, enables the `quill.js` rich text markdown editor, and allows exporting documents physically to your device as `.md` files. 

### 5. Multi-Vendor Mock Payments
The Billing workflow demonstrates advanced state management by rendering either Stripe or Razorpay mock workflows:
- **Stripe:** Hits an endpoint to generate a generic `checkout_session_id`, redirecting to a frontend processing container.
- **Razorpay:** Generates an INR-based generic mock `order_id` string indicating processing sequence logic.

---

## 🔌 Comprehensive API Documentation

**Base API URL:** `/api`
**Authorization Header Prefix:** `Bearer <JWT_TOKEN>`

### 1. Authentication
Endpoints governing user life-cycle and security tokens.

#### `POST /auth/register`
Creates a brand new user and automatically spins up a default Workspace titled under the user's name if a specific name isn't provided.
- **Access Level:** Public
- **Request Body:**
  ```json
  { 
    "name": "Alex", 
    "email": "alex@mail.com", 
    "password": "secure123", 
    "workspaceName": "Alex's StartUp" 
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "60a7c9f8...",
    "name": "Alex",
    "email": "alex@mail.com",
    "token": "eyJhbGci..."
  }
  ```

#### `POST /auth/login`
Validates credentials against hashed records via `bcrypt` and issues a new JWT.
- **Access Level:** Public
- **Request Body:** `{ "email": "alex@mail.com", "password": "secure123" }`
- **Response (200 OK):** Identical to Register response containing secure token.

---

### 2. Workspaces
Endpoints governing the creation, deletion, and member mapping of isolated environments.

#### `GET /workspaces`
Fetches an aggregate array of all Workspaces where the authenticated user explicitly resides in the `members` array.
- **Access Level:** Protected (Any User)
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "65b...",
      "name": "Alex's StartUp",
      "members": [...],
      "subscription": { "plan": "free", "status": "active" },
      "userRole": "owner" // Dynamically injected based on the requesting user
    }
  ]
  ```

#### `POST /workspaces`
Spin up a new Multi-Tenant workspace. The requester is automatically added as an `owner`.
- **Access Level:** Protected (Any User)
- **Request Body:** `{ "name": "Marketing Team" }`
- **Response (201 Created):** Workspace object struct.

#### `POST /workspaces/:id/members`
Add additional collaborators contextually into a workspace.
- **Access Level:** Protected (Workspace `owner` or `admin` only)
- **Request Body:** `{ "email": "colleague@mail.com", "role": "member" }`
- **Response (200 OK):** Confirms addition.

#### `DELETE /workspaces/:id`
Permanently destroys the workspace, severing relationships for all attached members and cascading document deletion.
- **Access Level:** Protected (Workspace `owner` only)
- **Response (200 OK):** `{ "message": "Workspace removed" }`

---

### 3. Documents
Endpoints managing the actual data payloads housed within Workspaces.

#### `GET /documents/workspace/:workspaceId`
Retrieves a lightweight indexed list of all documents scoped to the requested workspace. Supports textual querying.
- **Access Level:** Protected (Any specific Workspace Member)
- **Query Params:** `?search=quarterly` (Optional)
- **Response (200 OK):** `[ { "_id": "...", "title": "Quarterly Report", "updatedAt": "2023-..." } ]`

#### `POST /documents`
Creates a new blank document. Evaluates current workspace subset against the strict `documents.length < 3` rule mechanism if on the free tier.
- **Access Level:** Protected (Any specific Workspace Member)
- **Request Body:** `{ "workspaceId": "65b...", "title": "Untitled Document" }`
- **Response (201 Created):** Full Document object struct. *Returns 403 Forbidden `{ "limitReached": true }` if free-tier capped.*

#### `GET /documents/:id`
Fetches the heavy raw payload (`title`, `content`) of a specific document for editor initialization.
- **Access Level:** Protected (Must be Member of Document's Parent Workspace)
- **Response (200 OK):** `{ "title": "Quarterly Report", "content": "<p>Hello World</p>", "workspaceId": "65b..." }`

#### `PUT /documents/:id`
Updates document records. Intended to be throttled/debounced by the consuming client.
- **Access Level:** Protected (Workspace `owner/admin/member` allowed)
- **Request Body:** `{ "title": "New Title", "content": "Updated HTML string" }`
- **Response (200 OK):** `{ "message": "Document updated" }`

#### `GET /documents/:id/export`
Generates a markdown blob payload downloading directly to the native OS file interface.
- **Access Level:** Protected (Pro Tier Only)
- **Response (200 Blob):** Raw File Stream Output

#### `DELETE /documents/:id`
Permanently drops a document from the MongoDB collection.
- **Access Level:** Protected (Workspace `owner` or `admin` only)

---

### 4. Activity & Analytics
Tracing metrics mapping semantic behavior for auditing visibility.

#### `GET /activity/:workspaceId`
Outputs chronological, un-mutable chronological records showing `Who` did `What`.
- **Access Level:** Protected (Any specific Workspace Member)
- **Response (200 OK):**
  ```json
  [
    {
      "action": "document_update",
      "details": "Updated document 'Quarterly Report'",
      "user": { "name": "Alex" },
      "createdAt": "2023-11-04T12:00:00Z"
    }
  ]
  ```

#### `GET /activity/:workspaceId/stats`
Fast mathematical aggregation endpoints calculating entity totals without transferring raw array elements.
- **Access Level:** Protected (Any specific Workspace Member)
- **Response (200 OK):** `{ "documents": 14, "members": 3 }`

---

### 5. Subscription Interfaces
Endpoints interacting with the abstracted mock payment architectures.

#### `POST /subscription/create-checkout-session`
Initializes a Stripe transaction frame. (Returns generic mock bypass IDs in non-production configured environments).
- **Access Level:** Protected (Workspace `owner` only)
- **Request Body:** `{ "priceId": "price_pro", "workspaceId": "65b..." }`
- **Response (200 OK):** `{ "id": "cs_test_abc", "url": "https://..." }`

#### `POST /subscription/create-razorpay-order`
Initializes an active mock Razorpay payment token.
- **Access Level:** Protected (Workspace `owner` only)
- **Request Body:** `{ "priceId": "price_pro", "workspaceId": "65b..." }`
- **Response (200 OK):** `{ "id": "order_mock_123", "amount": 2000, "currency": "INR", "mock": true }`

---

## 🛠️ Local Environment Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or Local MongoDB instance

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend dev server:
```bash
npm run dev
```
