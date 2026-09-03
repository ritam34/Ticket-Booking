# Train Booking — Frontend

React (Vite) + Tailwind CSS. Talks to the backend API for everything (auth, search, booking, payment).

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults work fine for local dev against localhost:5000
npm run dev
```

Runs at `http://localhost:5173`. Make sure the backend is running on `http://localhost:5000` (or update `VITE_API_PROXY_TARGET`).

## Structure

```
src/
├── components/     Shared UI: Navbar, SeatMap, RouteLine (journey visual), CountdownTimer, ProtectedRoute
├── context/        AuthContext — user/token state, persisted to localStorage
├── services/       One file per API domain (auth, trains, bookings, payments, admin)
├── pages/          One file per route
└── pages/admin/    Admin-only pages
```

## User Flow

```
Home (search form)
  → SearchResults (route-line diagram per train, pick a class)
    → SeatSelection (visual seat grid)
      → PassengerDetails (submits → locks seats in Redis via backend)
        → Payment (Razorpay Checkout widget)
          → BookingConfirmation (PNR + PDF ticket download)
```

Also: MyBookings (history + cancel), PNRStatus (public lookup), Admin (trains CRUD, schedules, all bookings, revenue).

## Design Notes

- Colors and fonts are defined in `tailwind.config.js` under the `rail` namespace — change them there, not inline, to keep the theme consistent.
- `IBM Plex Mono` is used specifically for schedule data (times, fares, seat numbers, PNR) to evoke a station departure board — keep that convention when adding new data displays.
- The seat map in `SeatMap.jsx` infers "booked" seats from the class's `bookedSeats` count (last N seat numbers) since the search API only returns a count, not exact numbers. This is a simplification — fine for a demo, but a production system would want the backend to return the exact list of taken seat numbers.

## Deployment (Vercel)

1. Push this folder to a Git repo, import into Vercel, set the framework preset to **Vite**.
2. Set the environment variable `VITE_API_URL` to your deployed backend's URL (e.g. `https://your-backend.onrender.com/api`).
3. Vercel will run `npm run build` and serve the `dist/` output automatically.

The backend is better hosted on Render/Railway (persistent connections for MongoDB/Redis) rather than as Vercel serverless functions — see the backend README for details.
