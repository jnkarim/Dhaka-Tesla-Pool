<div align="center">

# 🚲 Dhaka Tesla Pool

### Share a seat. Split the fare. Survive Dhaka traffic.

**Request a ride → Match compatible passengers → Share one Tesla → Pay your own fare**

<br />

<img
  src="client/public/hero-rickshaw.png"
  alt="Dhaka Tesla Pool"
  width="100%"
/>

<br />
<br />

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Deployment-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br />

**Dhaka Tesla Pool is a ride-pooling MVP where passengers travelling in compatible directions can share a three-seat Dhaka “Tesla”, while each passenger keeps their own fare, ride status and payment state.**

[GitHub Repository](https://github.com/jnkarim/Dhaka-Tesla-Pool)

</div>

---

# ✦ 1. The Banani Rush-Hour Story

The project follows the story from the assignment brief.

At **8:41 AM in Banani**, Jashim has his three-seat vehicle, **Bullet**. Nusrat requests a ride from Banani to Mohakhali. Rafiq requests a similar route from Banani to Gulshan 1. The system must decide whether their requests are compatible, place them in the same pool without exceeding capacity, keep each fare separate, and allow Jashim to operate the ride through a clear lifecycle.

Shirin may then try to claim the final available seat, which makes **capacity enforcement and concurrency** important parts of the backend design.

The seed/demo story should stay consistent with:

```text
Driver
→ Jashim

Vehicle
→ Bullet

Passengers
→ Nusrat
→ Rafiq
→ Shirin
```

---

# ✦ 2. The Product Problem

Passengers know where they want to go, but multiple passengers may be travelling in compatible directions at the same time.

Dhaka Tesla Pool solves this by keeping each request independent while allowing compatible requests to share one vehicle.

```text
Passenger Request
       ↓
Pickup + Destination + Seats
       ↓
Fare Estimate
       ↓
Compatibility Check
       ↓
Open Pool
       ↓
Driver Accepts
       ↓
Shared Trip
       ↓
Individual Fare + Individual Status
```

The important product rules are:

- a Tesla has a fixed capacity of **3 seats**
- multiple ride requests may share one pool
- occupied seats must never exceed vehicle capacity
- every passenger keeps an individual fare
- every passenger sees their own ride state
- the driver sees the passengers assigned to the accepted pool
- completed and cancelled rides remain available in history

---

# ✦ 3. Your Mission: Build the MVP

The MVP is built around three main actors.

## 👤 Passenger

Passengers can:

- sign up and log in
- select pickup and destination
- choose seat count
- view estimated fare
- request a ride
- join a compatible pool
- track ride lifecycle
- cancel when cancellation is valid
- view ride activity/history
- confirm cash payment after ride completion

---

## 🚲 Driver / Tesla

Drivers can:

- sign up and log in
- own one fixed-capacity Tesla
- go online or offline
- view relevant open pools
- accept an available pool
- see assigned passengers and reserved seats
- mark driver arrival
- start the ride
- complete the ride
- confirm cash received
- view completed and cancelled ride activity

---

## 🔀 Pool / Ride Split

The pooling system provides:

- multiple compatible requests in one pool
- capacity enforcement
- obvious pool membership
- individual passenger fares
- a controlled ride lifecycle
- transaction-safe driver pool acceptance

---

## 🛡️ Admin Extension

A small read-only admin extension is also included.

The configured admin account can:

- view all ride transactions
- view passenger and driver information
- inspect route, seats and fare
- inspect ride lifecycle status
- inspect payment completion state

Admin authorization is based on the authenticated user's email matching `ADMIN_EMAIL` on the backend. It is not a separate database role.

---

# ✦ Ride Lifecycle

The implemented lifecycle is:

```text
REQUESTED
    ↓
MATCHED / ACCEPTED
    ↓
DRIVER_ARRIVED
    ↓
STARTED
    ↓
COMPLETED

CANCELLED
→ only when cancellation is valid
```

The backend validates transitions instead of trusting the frontend to decide the next state.

---

# ✦ 4. Keeping Geography Simple

The project intentionally avoids real route optimization and paid map APIs.

The application uses predefined Dhaka zones such as:

```text
Khilgaon
Banani
Gulshan 1
Gulshan 2
Mohakhali
Farmgate
Dhanmondi
Mirpur
Uttara
Bashundhara
```

The current MVP matching rule is deliberately simple and testable:

```text
Pickup
→ Banani

Compatible destinations
→ Mohakhali
→ Gulshan 1
```

A request can join an existing compatible pool only when the requested seats fit inside the remaining vehicle capacity.

This keeps the implementation easy to explain while still demonstrating the important ride-pooling logic.

---

# ✦ 5. Fare Model - Keep It Understandable

Money is stored as **integer poisha** rather than floating-point Taka values.

Example:

```text
৳120.50
=
12,050 poisha
```

This avoids floating-point rounding problems in fare calculations.

The fare model follows the assignment's intentionally simple structure:

```text
passengerFare
=
baseFare
+
route / distance charge
-
pool discount
```

The ride stores:

```text
estimatedFarePoisha
```

and a pool membership may store:

```text
finalFarePoisha
```

> Before final submission, document the exact fare constants currently used in the implementation so the evaluator can reproduce Nusrat and Rafiq's fare by hand.

---

## 💵 Cash Payment Flow

The MVP uses **cash payment**.

Ride completion and payment completion are intentionally separate states.

```text
Ride COMPLETED
      │
      ├──────────────► Passenger confirms payment
      │                passengerPaid = true
      │
      └──────────────► Driver confirms cash received
                       driverReceived = true

Both confirmations true
      ↓
paymentStatus = COMPLETED
```

This makes payment state explicit without introducing a real payment gateway.

---

# ✦ 6. Technical Scope & Mandated Stack

## Frontend

| Technology | Purpose |
| --- | --- |
| Next.js | App Router frontend and routing |
| React | Component-based UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Lucide React | Interface icons |

---

## Backend

| Technology | Purpose |
| --- | --- |
| Node.js | Backend runtime |
| Express | REST API |
| TypeScript | Type safety |
| Zod | Request validation |
| JWT | Authentication token |
| bcryptjs | Password hashing |
| cookie-parser | HTTP-only auth cookie support |

---

## Database

| Technology | Purpose |
| --- | --- |
| PostgreSQL | Relational database |
| Prisma | ORM, migrations and typed database access |
| Prisma PostgreSQL Adapter | PostgreSQL connection adapter |

---

## Infrastructure

| Technology | Purpose |
| --- | --- |
| Docker | Reproducible containers |
| Docker Compose | App + database orchestration |
| `.env` / `.env.example` | Environment configuration |

---

# ✦ 7. Technology Choice & Justification

## PostgreSQL

**Why chosen**

Ride pooling has strongly related data: users, vehicles, ride requests, pools, pool memberships, status history and payments. PostgreSQL fits this relational model and provides transactions needed for capacity-sensitive operations.

**Alternatives considered**

```text
MySQL
SQLite
MongoDB
```

**When I would switch**

SQLite could be reasonable for a tiny single-process prototype. PostgreSQL is preferable once concurrent requests and relational consistency matter.

---

## Prisma

**Why chosen**

Prisma provides typed queries, schema-driven relationships, migrations and readable transactional code.

**Alternatives considered**

```text
Drizzle ORM
TypeORM
Raw SQL
```

**When I would switch**

For a system requiring extensive hand-optimized SQL or database-specific queries, a lighter query builder or raw SQL could provide more control.

---

## REST API

**Why chosen**

The resource model is small and clear, so REST keeps the API easy to inspect, test and explain.

**Alternative considered**

```text
GraphQL
```

**When I would switch**

GraphQL would be more attractive if the client needed many complex read shapes across a much larger product surface.

---

## HTTP-only Cookie + JWT

**Why chosen**

The JWT represents authenticated identity while the HTTP-only cookie keeps the token unavailable to normal client-side JavaScript.

**Alternatives considered**

```text
Server sessions
Bearer token in localStorage
Auth.js / third-party auth provider
```

**When I would switch**

For a larger production system with centralized session revocation requirements, a server-side session approach may be preferable.

---

## Tailwind CSS

**Why chosen**

The take-home needed fast iteration and a consistent responsive design system using the project's black, white and lime visual language.

**Alternatives considered**

```text
CSS Modules
Styled Components
Component libraries
```

**When I would switch**

A mature design system with many shared products could justify a dedicated internal component library.

---

# ✦ 8. AI Usage Policy

 AI tools were used as a frontend development assistant during the project.

### Where AI helped

- Exploring frontend UI/UX ideas and improving the landing page design.
- Reviewing React component structure and suggesting cleaner reusable patterns.
- Helping improve responsive layouts and styling consistency.
- Assisting with debugging frontend issues and improving user experience.
- Helping organize project documentation and README structure.

### Accepted AI suggestions

- Improving component organization for better maintainability.
- Refining responsive layouts for different screen sizes.
- Enhancing UI consistency using the existing black, white, and lime color system.

### Rejected or modified AI suggestions

- Avoided adding unnecessary UI complexity that did not match the product requirements.
- Modified suggested designs to fit Dhaka Tesla Pool's own branding and user flow.

### Ownership

All AI suggestions were reviewed and modified where necessary. The final frontend implementation, design decisions, and user experience choices were made by the developer.

---

# ✦ 9. Architecture First

The application follows a simple modular-monolith architecture.

```text
┌──────────────────────────┐
│                          │
│        Web Browser       │
│                          │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│                          │
│     Next.js Frontend     │
│                          │
│   App Router + Tailwind  │
│                          │
└─────────────┬────────────┘
              │
              │ REST / JSON
              │ HTTP-only cookie
              ▼
┌──────────────────────────┐
│                          │
│      Express API         │
│                          │
│ Auth / Ride / Pool       │
│ Vehicle / Driver / Admin │
│                          │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│                          │
│          Prisma          │
│                          │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│                          │
│       PostgreSQL         │
│                          │
└──────────────────────────┘
```

---

## Database / ERD

The core relational model contains:

```text
User
Vehicle
RideRequest
Pool
PoolMember
RideStatusHistory
```

Important relationships:

```text
User 1 ─────────── many RideRequest

User 1 ─────────── 0..1 Vehicle

Vehicle 1 ──────── many Pool

Pool 1 ─────────── many PoolMember

RideRequest 1 ──── 0..1 PoolMember

RideRequest 1 ──── many RideStatusHistory
```

ERD image:

```markdown
![Dhaka Tesla Pool ERD](docs/dhaka_tesla_pool_erd_final.png)
```

![Dhaka Tesla Pool ERD](docs/dhaka_tesla_pool_erd_final.png)

Editable source:

```text
docs/dhaka_tesla_pool_erd_final.drawio
```

---

# ✦ Project Structure

```text
Dhaka-Tesla-Pool/
│
├── client/
│   ├── app/
│   │   ├── admin/
│   │   ├── driver/
│   │   ├── login/
│   │   ├── passenger/
│   │   └── register/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── generated/
│       ├── lib/
│       ├── middleware/
│       └── modules/
│           ├── admin/
│           ├── auth/
│           ├── drivers/
│           ├── pools/
│           ├── rides/
│           └── vehicles/
│
├── docs/
│   ├── dhaka_tesla_pool_erd_final.png
│   └── dhaka_tesla_pool_erd_final.drawio
│
├── docker-compose.yml
└── README.md
```

---

# ✦ Getting Started

## Prerequisites

Install:

```text
Node.js
npm
Docker Desktop
Git
```

For manual database setup, PostgreSQL is also required.

---

## 1. Clone the Repository

```bash
git clone https://github.com/jnkarim/Dhaka-Tesla-Pool.git
cd Dhaka-Tesla-Pool
```

---

# ✦ Frontend Setup

Move to the client:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create:

```text
client/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

# ✦ Backend Setup

Open another terminal.

Move to the server:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create:

```text
server/.env
```

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dhaka_tesla_pool
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@gmail.com
PORT=5000
```

Do not commit real secrets.

---

## Prisma Client

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations during local development:

```bash
npx prisma migrate dev
```

For an existing deployment/database:

```bash
npx prisma migrate deploy
```

Seed demo data:

```bash
npx prisma db seed
```

The seed data should use the assignment cast such as **Jashim, Nusrat and Rafiq** instead of generic `user1` / `driver1` placeholders.

---

## Run the Backend

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/v1/health
```

---

# ✦ Docker Setup

The project should be reproducible with Docker Compose.

From the repository root:

```bash
docker compose up --build
```

To stop the stack:

```bash
docker compose down
```

A complete submission should include:

```text
application container(s)
PostgreSQL container
.env.example
migrations
seed data
health check
```

---

# ✦ Environment Variables

## Frontend

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Express API base URL |

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Backend

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `ADMIN_EMAIL` | Email allowed to access admin transactions |
| `PORT` | Backend port |

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dhaka_tesla_pool
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@gmail.com
PORT=5000
```

---

# ✦ API Overview

Base URL:

```text
/api/v1
```

## Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

---

## Passenger Rides

Representative ride endpoints include:

```http
POST  /rides
GET   /rides/current
GET   /rides/history
PATCH /rides/:id/cancel
PATCH /rides/:id/payment/passenger
```

---

## Driver

```http
GET   /drivers/pools
PATCH /drivers/pools/:id/accept
GET   /drivers/active-pool
PATCH /drivers/active-pool/status
GET   /drivers/history
```

Driver cash confirmation is handled through the ride payment flow:

```http
PATCH /rides/:id/payment/driver
```

---

## Admin

```http
GET /admin/transactions
```

This route requires:

```text
valid authentication
+
logged-in user email === ADMIN_EMAIL
```

---

## Health

```http
GET /health
```

Full request/response shapes should be documented from the implemented controllers before final submission.

---

# ✦ Example Pooling Workflow

Suppose Nusrat requests:

```text
Pickup
→ Banani

Destination
→ Mohakhali

Seats
→ 1
```

Then Rafiq requests:

```text
Pickup
→ Banani

Destination
→ Gulshan 1

Seats
→ 1
```

The system processes the requests like this:

```text
Nusrat Request
      │
      ▼
Compatible Route?
      │
      ▼
Open Pool Created
      │
      ▼
Rafiq Request
      │
      ▼
Compatible Route?
      │ YES
      ▼
Capacity Available?
      │ YES
      ▼
Join Same Pool
      │
      ▼
Jashim Goes Online
      │
      ▼
Accept Pool
      │
      ▼
MATCHED
      │
      ▼
DRIVER_ARRIVED
      │
      ▼
STARTED
      │
      ▼
COMPLETED
```

If another request would make occupied seats exceed **3**, the request must not overbook that pool.

---

# ✦ Data Consistency & Concurrency

A key risk in ride pooling is two requests trying to claim the final available seat at almost the same time.

Example:

```text
Bullet has 1 seat left
       │
       ├──────────────► Nusrat sees 1 seat
       │
       └──────────────► Shirin sees 1 seat

Both request nearly simultaneously
```

The application uses database transactions around capacity-sensitive operations so the final committed state remains consistent.

Driver pool acceptance also performs a conditional claim so that two drivers cannot successfully claim the same open pool.

At larger scale, stronger strategies could include:

- row-level locking
- stricter transaction isolation
- optimistic version checks
- idempotency keys
- retry strategies for serialization conflicts

---

# ✦ Testing

Meaningful tests should focus on risky behavior rather than coverage percentage alone.

Core scenarios:

```text
✓ Bullet's capacity can never be exceeded

✓ invalid lifecycle transitions are rejected

✓ Nusrat and Rafiq receive the expected individual fares

✓ one user cannot modify another user's ride

✓ cancellation rules are enforced

✓ concurrent requests cannot corrupt pool capacity

✓ two drivers cannot claim the same pool

✓ passenger payment confirmation checks ownership

✓ driver cash confirmation checks assigned driver

✓ payment becomes complete only after both confirmations
```

Run the repository's configured test command from the relevant package, for example:

```bash
npm test
```

Before submission, make sure the actual command in `package.json` matches the README.

---

# ✦ Security Notes

The MVP includes the following security decisions:

- passwords are hashed with `bcryptjs`
- JWT is stored in an HTTP-only cookie
- frontend API requests use `credentials: "include"`
- protected routes use authentication middleware
- role-specific routes use authorization middleware
- admin authorization is enforced on the backend using `ADMIN_EMAIL`
- ownership checks are required for passenger ride actions
- driver actions are restricted to the assigned driver's vehicle/pool
- secrets stay in `.env` and must not be committed

---

# ✦ 10. Git Workflow - Part of the Assessment

The submission workflow uses the branches required by the assignment:

```text
master
pre-release
release/v1.0.0
feature/*
```

Development flow:

```text
feature branch
      ↓
logical incremental commits
      ↓
merge into master
      ↓
pre-release
      ↓
integration fixes + docs + deployment checks
      ↓
release/v1.0.0
      ↓
video / deployment version
```

Avoid developing the entire project directly on the main long-lived branch.


# ✦ 11. README, Testing, Concurrency & Bonus

This README documents:

- project summary and problem statement
- implemented features
- architecture
- ERD
- tech stack and project structure
- environment variables
- local setup
- Docker setup
- migrations and seed flow
- frontend/backend run instructions
- API overview
- engineering decisions and trade-offs
- concurrency handling
- testing priorities
- known limitations
- future improvements
- AI usage
- demo video section

---



# ✦ Deployment

The assignment requires free or free-tier deployment only.

```text
Frontend URL
→ TODO

Backend URL
→ TODO
```

If a free backend deployment is not available, document that constraint and provide the reproducible Docker setup instead.

---



# ✦ 12. Assumptions

Some parts of the assignment are intentionally open-ended.

Current MVP assumptions include:

```text
Geography
→ predefined Dhaka zones

Matching
→ simple compatible-zone rules

Capacity
→ fixed at 3 seats

Payment
→ cash only

Routing
→ no real road optimization

Admin
→ one configured email, read-only transaction access
```

The important principle is that an assumption should be:

```text
reasonable
+
documented
+
implemented consistently
+
explainable
```

---

# ✦ 18. Why the Details Matter

The project keeps the original story and domain visible throughout the implementation.

That means the evaluator should be able to trace the same concepts through:

```text
README
   ↓
Seed Data
   ↓
Database
   ↓
API
   ↓
Frontend
   ↓
Tests
   ↓
Demo Video
```

The goal is not only to produce a working UI, but to show a coherent engineering journey from problem understanding to implementation.

---

# ✦ Known Limitations

The current MVP intentionally keeps several areas simple:

- matching is zone-based rather than real route optimization
- no live GPS driver tracking
- no real payment gateway
- no dynamic pricing
- no passenger ratings
- no driver discovery by geographic distance
- no real-time WebSocket status delivery
- admin dashboard is read-only
- single-vehicle-per-driver model

---

# ✦ Future Roadmap

Potential improvements include:

### Matching

- route overlap scoring
- geospatial matching
- pickup radius
- destination corridor matching

### Ride Experience

- live driver location
- real-time status updates
- notifications
- ETA calculations

### Payments

- digital wallet / TeslaPay simulation
- payment receipts
- refund states

### Admin

- filters and pagination
- audit log
- operational metrics
- support tools

### Infrastructure

- production observability
- managed PostgreSQL
- caching where justified
- queue-based background work when scale requires it

---

# ✦ 19. Final Note

The goal of Dhaka Tesla Pool is to keep the system small enough to understand while still treating the risky parts - capacity, lifecycle, ownership, concurrency and payment state - as real engineering problems.

```text
Understand
    ↓
Design
    ↓
Build
    ↓
Commit
    ↓
Test
    ↓
Ship
    ↓
Explain
    ↓
Debug
    ↓
Change
```

And in Dhaka, the Tesla may have three wheels - but the engineering should still be production-minded.

---


</div>
