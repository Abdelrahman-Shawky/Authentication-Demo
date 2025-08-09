# Authentication Demo — NestJS + MongoDB + React

Authentication module with:

- **Sign Up / Sign In**
- **Access + Refresh JWT** pattern 
- **Protected API** (`GET /users/me`)
- **Swagger docs** for quick testing
- **React + TypeScript** with a route guard

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [Environment Variables](#environment-variables)
- [Frontend](#frontend)
  - [Client Routes](#client-routes)
  - [Validation Rules](#validation-rules)
- [Getting Started](#getting-started)
  - [Run Locally (Dev)](#run-locally-dev)
  - [Run with Docker Compose](#run-with-docker-compose)

---

## Architecture

**High level**:

- **Backend (NestJS + MongoDB/Mongoose)**: Controllers receive requests, Guards enforce JWT auth, Services contain business logic, Mongoose models persist users.
- **Auth pattern**: Short-lived **access token** (Bearer in `Authorization` header) + longer-lived **refresh token** in an **HttpOnly** cookie scoped to `/auth/refresh`. Refresh rotates tokens and returns a new access token. Guards protect private routes.
- **Frontend (React + TypeScript)**: Central Axios client attaches Bearer tokens and performs a one-time refresh on 401 (excluding auth routes). React Router guards `/` (welcome page) and redirects to `/signin` when unauthenticated. Forms use React Hook Form + Zod.

---

## Tech Stack

### Backend
- **NestJS** (TypeScript, DI, modules/controllers/services)
- **@nestjs/mongoose** + **Mongoose** for MongoDB
- **Passport + JWT** strategies/guards
- **Swagger / OpenAPI** at `/docs`
- **Helmet** for security headers
- **cookie-parser** (read refresh-token cookie)

### Frontend
- **React** + **TypeScript**
- **React Router v6**
- **Axios** with **interceptors** (attach access token; refresh once on 401)
- **React Hook Form** + **Zod** (form state + validation schemas)
- **Tailwind CSS** (Vite plugin), utility-first styling

---

## Backend


### API Endpoints

| Method | Path            | Auth             | Description |
|------:|------------------|------------------|-------------|
| POST  | `/auth/signup`   | Public           | Create user, set refresh cookie, return `{ user, accessToken }` |
| POST  | `/auth/signin`   | Public           | Verify creds, set refresh cookie, return `{ user, accessToken }` |
| POST  | `/auth/refresh`  | Refresh cookie   | Rotate refresh, return `{ accessToken }` |
| POST  | `/auth/logout`   | Refresh cookie   | Clear refresh cookie |
| GET   | `/users/me`      | Bearer access    | Return current user (protected) |

**Swagger UI**: `http://localhost:3000/docs`

### Environment Variables


```ini
NODE_ENV=development
PORT=3000

# Mongo
MONGO_URI=mongodb://localhost:27017/auth_demo

# JWT
JWT_ACCESS_SECRET=jwt_access_secret
JWT_REFRESH_SECRET=jwt_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# CORS (exact frontend origin)
CORS_ORIGIN=http://localhost:5173
```

## Frontend

### Client Routes
- ```/signup``` – Create account → on success navigate to ```/```

- ```/signin``` – On 401, show “Invalid email or password”

- ```/``` – Protected; guard redirects to ```/signin``` if not authorized

## Validation Rules

### Both client and server enforce:

- Email: valid format

- Name: min 3 characters

- Password: ≥ 8 chars, includes letter, number, special

Client uses Zod with React Hook Form’s resolver; server uses DTO decorators + Nest’s global ```ValidationPipe```.

## Getting Started
### Prerequisites
- Node.js 20+

- MongoDB (local or Docker)

- Docker (optional, for Compose)

- npm/pnpm/yarn (examples use ```npm```)

## Run Locally (Dev)

### Backend

```ini
cd server
# ensure .env exists
npm ci
npm run start:dev
```

### Frontend
```ini
cd web
# ensure .env exists
npm ci
npm run dev
```

## Run with Docker Compose
### From the repo root:
```git clone https://github.com/Abdelrahman-Shawky/Authentication-Demo.git```

```cd Authentication-Demo```

```docker compose up --build```

## Access
### Once the containers are running:
- Frontend: http://localhost:5173/
- Backend API: http://localhost:3000/
- MongoDB: via mongodb://localhost:27017
