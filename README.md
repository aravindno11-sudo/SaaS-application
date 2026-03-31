# Multi-Tenant SaaS Document Platform

A full-stack, multi-tenant Software as a Service (SaaS) platform built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. It features a Notion-inspired document editor, workspace management, Role-Based Access Control (RBAC), and multi-vendor mock payment integrations.

## Features

- **Multi-Tenant Architecture**: Complete data isolation between different workspaces.
- **Authentication & Authorization**: Secure user authentication with JWT and robust Role-Based Access Control (RBAC) for managing workspace capabilities and permissions.
- **Workspace Management**: Users can create, manage, and switch between different workspaces seamlessly.
- **Advanced Document Editor**: A Notion-inspired rich text document editor built with React Quill, featuring auto-save capabilities, editing, and deletion.
- **Multi-Vendor Payment Integration**: Subscription management with mock integrations for both Stripe and Razorpay, allowing for flexible vendor selection during the checkout flow.
- **Responsive Design**: Fully responsive, modern UI built with React 19 and Tailwind CSS 4.

## Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Editor**: React Quill
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Security**: bcryptjs, jsonwebtoken, cors
- **Payments**: Stripe SDK (Mock flow)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas cluster or local MongoDB instance

### Environment Variables

You need to set up environment variables for both the backend and frontend. Create `.env` files in their respective directories:

**Backend (`backend/.env`)**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
```
*(Add additional environment variables such as Razorpay keys if applicable to your environment).*

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

### Installation

1. Clone the repository.
2. Install dependencies for both frontend and backend from the root directory:
   ```bash
   npm run install:all
   ```

### Running the Application (Development)

Run the backend and frontend in separate terminals from the root directory:

**Terminal 1 (Backend):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```

## Available Scripts

From the root directory, you can run the following scripts:

- `npm run install:all`: Installs dependencies for both `frontend` and `backend`.
- `npm run dev:backend`: Starts the backend development server using `nodemon` and `tsx`.
- `npm run dev:frontend`: Starts the frontend Vite development server.
- `npm run build:frontend`: Compiles TypeScript and builds the frontend for production.
- `npm run build`: Installs backend dependencies and compiles the backend TypeScript code.
- `npm run start`: Starts the production backend server (`node dist/server.js`).

## Project Structure

- `/backend`: Contains the Express application, including routes, controllers, middleware, and Mongoose models.
- `/frontend`: Contains the React application, featuring reusable UI components, page views, and routing logic.

## Deployment

This multi-tenant architecture is designed to be production-ready:
- **Backend**: Can be deployed to services like Render, Heroku, or AWS. Make sure to configure the production environment variables (e.g., `NODE_ENV=production`).
- **Frontend**: Can be statically deployed to Vercel, Netlify, or Cloudflare Pages.
