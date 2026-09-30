<div align="center">

# Dhaka Tesla Pool

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

## 🔗 Quick Links

| Resource | Link |
| --- | --- |
| 🌐 Frontend | [Live App](https://dhaka-tesla-pool-dun.vercel.app/) |
| ⚙️ Backend | [API Health](https://dhaka-tesla-pool-2z2h.onrender.com/api/v1/health) |
| 🎥 Demo Video | [Google Drive](https://drive.google.com/drive/folders/16M0rF7bVbq9LNMXKkXaNjHkVygHcDB7P?usp=sharing) |
| 💻 Repository | [GitHub](https://github.com/jnkarim/Dhaka-Tesla-Pool) |

> The backend uses Render's free tier, so the first request after inactivity may take a short time while the service wakes up.

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

# ✦ 3. The MVP

The MVP is built around three main actors.

## Passenger

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

## Driver / Tesla

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

## Pool / Ride Split

The pooling system provides:

- multiple compatible requests in one pool
- capacity enforcement
- obvious pool membership
- individual passenger fares
- a controlled ride lifecycle
- transaction-safe driver pool acceptance

---

##  Admin Extension

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

# ✦ 5. Fare Model

Money is stored as **integer poisha** rather than floating-point Taka values. For example, `৳120.50` is stored as `12,050` poisha. This avoids floating-point rounding issues in fare calculations.

The fare model is:

```text
passengerFare = baseFare + routeCharge - poolDiscount
```

Current implementation constants:

| Item | Value |
| --- | ---: |
| Base fare | ৳50 (`5,000` poisha) |
| Default route charge | ৳50 (`5,000` poisha) |
| Pool discount | ৳20 (`2,000` poisha) |
| Banani → Mohakhali route charge | ৳70 (`7,000` poisha) |
| Banani → Gulshan 1 route charge | ৳50 (`5,000` poisha) |

Examples:

```text
Banani → Mohakhali
Normal fare = ৳50 + ৳70 = ৳120
Pooled fare = ৳120 - ৳20 = ৳100
Banani → Gulshan 1
Normal fare = ৳50 + ৳50 = ৳100
Pooled fare = ৳100 - ৳20 = ৳80
Khilgaon → Bashundhara
Uses the default route charge
Normal fare = ৳50 + ৳50 = ৳100
Pooled fare = ৳100 - ৳20 = ৳80
```

A passenger initially receives the normal estimated fare. When another compatible passenger joins the same open pool, the pool discount is applied to the new passenger and the existing pool members.

The ride stores the current passenger-visible value in:

```text
estimatedFarePoisha
```

and the pool membership may store the pooled/final value in:

```text
finalFarePoisha
```

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

---

## Infrastructure

| Technology | Purpose |
| --- | --- |
| Docker | Reproducible containers |
| Docker Compose | App + database orchestration |
| `.env` / `.env.example` | Environment configuration |

---

# ✦ 7. Technology

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

AI tools were used as an engineering assistant during development.

## Tools used

```text
ChatGPT
Documentation
Search / Stack Overflow style references where needed
```

## What AI was used for

- assisting with frontend design exploration and UI improvements
- suggesting responsive layout and styling improvements
- helping debug frontend implementation issues
- reviewing component organization and maintainability
- improving documentation structure and presentation

## One accepted suggestion

The cash flow was modelled with **two independent confirmations**:

```text
passengerPaid
driverReceived
```

and payment becomes complete only when both are true. This made the cash state explicit and testable.

## One rejected / changed suggestion

During the initial design iteration, live GPS tracking was considered for providing real-time vehicle movement updates. However, it would increase system complexity and require additional infrastructure for location streaming. The final implementation uses predefined Dhaka zones for pickup and destination selection, keeping the MVP focused while maintaining a reliable ride matching flow.

## Ownership

All generated or suggested code was reviewed, changed where necessary, and integrated into the final architecture. The goal was not to minimize AI usage, but to understand and be able to explain the shipped implementation.

---

# ✦ 9. Architecture

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
![Dhaka Tesla Pool ERD](docs/dhaka_tesla_pool_erd.png)
```

![Dhaka Tesla Pool ERD](docs/dhaka_tesla_pool_erd.png)

Editable source:

```text
docs/dhaka_tesla_pool_erd_final.drawio
```

# Bonus: Scaling Architecture

## Scaling Dhaka Tesla Pool to 1M Passengers and 100K Drivers

The current MVP architecture is designed for a smaller user base. If Dhaka Tesla Pool grows to support 1M passengers and 100K drivers, the system can gradually scale by introducing distributed components while keeping the core ride flow reliable.

## High Level Scaling Architecture

![Dhaka Tesla Pool Scaling Architecture](docs/dhaka_tesla_pool_scaling_architecture.png)
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

The backend includes automated tests for the fare and route-matching behavior used by the MVP.

Run the tests from the server package:

```bash
cd server
npm test
```

Current automated coverage includes:

```text
✓ normal Banani → Mohakhali fare calculation
✓ pooled Banani → Mohakhali discount
✓ default fare for an unmapped valid route
✓ valid Dhaka route acceptance
✓ Khilgaon → Bashundhara route acceptance
✓ same pickup and destination rejection
✓ unknown zone rejection
```

Current test result:

```text
tests 7
pass  7
fail  0
```

The test command is configured in `server/package.json` and runs the TypeScript test files through `tsx --test`.

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

# ✦ 10. Git Workflow

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
     main
      ↓
video / deployment version
```

Avoid developing the entire project directly on the main long-lived branch.




---

# ✦ Deployment

The assignment requires free or free-tier deployment only.

```text
Frontend URL:
https://dhaka-tesla-pool-dun.vercel.app/

Backend URL
https://dhaka-tesla-pool-2z2h.onrender.com/api/v1/health
```

The backend is deployed using Render's free tier.
Since the backend uses Render's free instance, the service may enter an idle state after a period of inactivity. The first request after inactivity may experience a cold start delay while the server instance becomes active again.




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

- digital wallet
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
