# Soccer Bot Team Selector — Deployment Guide

## How It Works

- Players open the app and join before **7:30 PM EDT**.
- At **7:30 PM EDT** the cron job runs automatically, balances the players into Blue and Red teams, and saves the result.
- The app switches from the join screen to show the two formed teams.
- The next day the state resets automatically and players can join again.

In local/dev environments a **"Generate Teams (Dev)"** button is shown so you can test team formation at any time.

---

## Running Locally

You need two terminals: one for the backend, one for the Angular frontend.

### Terminal 1 — Backend

```bash
cd backend
npm install
node unified-server-cjs.js
```

The backend runs on **http://localhost:3000**.

### Terminal 2 — Angular Frontend

```bash
# from repo root
npm install
npm start
```

The frontend runs on **http://localhost:4200** and proxies all `/api/**` calls to `localhost:3000`.

### Or run both with one command

```bash
# from repo root
npm run dev
```

This uses `concurrently` to start both servers together.

---

## Environment Variables (local overrides)

Create a `.env` file in `backend/` if you want to override defaults (optional — defaults work out of the box):

```bash
PORT=3000
NODE_ENV=development
TEAM_TIMEZONE=America/New_York
TEAM_GENERATION_CRON=30 19 * * *   # 7:30 PM — standard cron syntax
MIN_PLAYERS_TO_FORM_TEAMS=12
ENABLE_MANUAL_GENERATE=true         # shows the dev Generate button
```

---

## Building for Production

```bash
# from repo root — builds Angular into backend/dist/soccer-bot-team-selector/browser
npm run build:prod

# compile backend TypeScript helpers
cd backend && npm run build
```

The Express server in `backend/unified-server-cjs.js` serves the compiled Angular output as static files and handles all `/api/**` routes.

---

## Deploying to Render

The file `backend/unified-render.yaml` contains the full Render service configuration.

### Steps

1. Push your code to GitHub.
2. In the [Render dashboard](https://dashboard.render.com) create a new **Web Service** and connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Render will pick up `unified-render.yaml` automatically (or set the fields manually — see below).

### Render Service Settings

| Setting | Value |
|---|---|
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `cd .. && npm install --include=dev && npm run build:prod && cd backend && npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

### Environment Variables on Render

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `TZ` | `America/New_York` |
| `TEAM_TIMEZONE` | `America/New_York` |
| `TEAM_GENERATION_CRON` | `59 3 * * *` | 11:59 PM EDT (3:59 AM UTC next day)
| `MIN_PLAYERS_TO_FORM_TEAMS` | `12` |
| `ENABLE_MANUAL_GENERATE` | `true` | Temporarily enable to fix cron issue

The `ENABLE_MANUAL_GENERATE=false` hides dev Generate button in production. Teams are formed only by the 11:59 PM cron.

### Time Conversion Reference (Daylight Saving Time)
Since EDT = UTC-4, add 4 hours to your target time to get UTC cron hour:

| Target Time (EDT) | UTC Equivalent | Cron Format |
|---|---|---|
| 8:00 PM EDT | 12:00 AM UTC | `0 0 * * *` |
| 9:00 PM EDT | 1:00 AM UTC | `0 1 * * *` |
| 10:00 PM EDT | 2:00 AM UTC | `0 2 * * *` |
| 11:00 PM EDT | 3:00 AM UTC | `0 3 * * *` |
| 11:59 PM EDT | 3:59 AM UTC | `59 3 * * *` |

### Deployed URL

```
https://soccer-bot-team-selector.onrender.com
```

### Key API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Server health + current phase |
| `GET /api/ui-state` | Phase, teams, and whether the Generate button is enabled |
| `GET /api/players` | Full player list |
| `GET /api/current` | Players who have joined today |
| `POST /api/join` | `{ "name": "..." }` — add a player |
| `POST /api/leave` | `{ "name": "..." }` — remove a player |
| `POST /api/teams/generate` | Manually trigger team generation (dev only) |

---

## Notes

- Player and team state is persisted in `backend/players.json`. This file is created automatically.
- Render's free tier spins down after inactivity. The first request after a cold start may be slow.
- To manually reset the day's state during testing, delete the contents of `backend/players.json` (or set `dailyStatus` back to `"collecting"`) and restart the server.

