# Train Booking — Backend

## Stack
Node.js · Express · MongoDB (Mongoose) · Redis (seat locking) · Razorpay (payments) · JWT (auth)

## Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**
   Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — get a free cluster at https://cloud.mongodb.com
   - `REDIS_URL` — for local dev, run Redis via Docker: `docker run -p 6379:6379 redis`
     For production, use a free Redis instance from https://upstash.com (works great with Vercel serverless)
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — get test keys from https://dashboard.razorpay.com (Settings → API Keys, use Test Mode)
   - `JWT_SECRET` — any long random string

3. **Seed sample data** (3 trains, 7 days of schedules, 1 admin user)
   ```bash
   npm run seed
   ```
   Admin login after seeding: `admin@trainbooking.com` / `admin123`

4. **Run the server**
   ```bash
   npm run dev      # with nodemon, auto-restart
   # or
   npm start
   ```
   Server runs at `http://localhost:5000`. Health check: `GET /api/health`

## API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | User | Current user profile |
| GET | `/api/trains/search?source=&destination=&date=` | — | Search trains |
| GET | `/api/trains/schedules/:id` | — | Schedule detail (for seat map) |
| POST | `/api/bookings/lock-seats` | User | Lock seats (Redis) + create pending booking |
| POST | `/api/bookings/:id/release` | User | Release a pending booking's seat lock |
| POST | `/api/payments/create-order` | User | Create Razorpay order |
| POST | `/api/payments/verify` | User | Verify payment signature, confirm booking, generate PNR |
| GET | `/api/bookings/my` | User | Booking history |
| GET | `/api/bookings/pnr/:pnr` | User | PNR status |
| POST | `/api/bookings/:id/cancel` | User | Cancel + calculate refund |
| GET | `/api/tickets/:bookingId/pdf` | User | Download e-ticket PDF |
| GET/POST/PUT/DELETE | `/api/trains` (+`/:id`) | Admin | Manage trains |
| POST | `/api/trains/schedules` | Admin | Create a schedule |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/revenue` | Admin | Revenue report |

## Booking Flow (how the pieces fit together)

```
1. Search trains  →  GET /api/trains/search
2. View seat map  →  GET /api/trains/schedules/:id
3. Lock seats     →  POST /api/bookings/lock-seats
                      (Redis SET NX locks each seat for 5 min; creates a
                       'pending_payment' Booking in MongoDB)
4. Create order   →  POST /api/payments/create-order
                      (Razorpay order created; re-checks the Redis lock is
                       still valid before letting the user pay)
5. User pays      →  Razorpay Checkout widget on the frontend
6. Verify payment →  POST /api/payments/verify
                      (HMAC signature verified server-side, booking marked
                       'confirmed', PNR generated, seat count persisted to
                       MongoDB, Redis lock released)
```

If a user abandons the flow at any point, the Redis lock **auto-expires** after 5 minutes (`SEAT_LOCK_TTL_SECONDS`) — no manual cleanup job needed.

## Deployment Notes (Vercel)

Vercel's serverless functions are stateless and short-lived, which works fine for most of these routes, but two things need attention:
- **Redis**: use a serverless-friendly provider like [Upstash](https://upstash.com) (REST-based, works well with Vercel's cold starts) instead of a self-hosted Redis instance.
- **MongoDB**: reuse connections across invocations (cache the connection outside the handler) to avoid exhausting your connection pool — happy to wire this up when we get to deployment.
- **Razorpay webhook**: needs a public HTTPS URL, so it can only be tested once deployed (or via a tunnel like ngrok locally).
