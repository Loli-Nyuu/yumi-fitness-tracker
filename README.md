# 🍑 Yumi Fitness Tracker

> *Real-time fitness coaching and body transformation platform*
> *Built by Yumi Glutez for Yuuki*

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and seed the database:
```bash
npm run db:seed
```

## Stack

- **Framework:** Nuxt 4 + Vue 3
- **Styling:** Tailwind CSS 4
- **Database:** SQLite + Drizzle ORM
- **Real-time:** WebSockets (Nuxt server)
- **Integration:** OpenClaw MCP tools

## Features

| Module | Description |
|--------|-------------|
| 📊 Dashboard | Today's session, PRs, water, body stats |
| 🏋️ Sessions | Session history and planner |
| 🔴 Live | Real-time session monitoring via WebSocket |
| 📚 Exercise Library | All exercises with GIFs, filters, preferences |
| 📏 Body | Measurements, WHR tracking, progress |
| 🧘 Wellness | Sleep, water, soreness, breathing, nutrition |
| 🎯 Goals | Goal tracking and achievements |
| ⏱️ Timer | Standalone workout timer with intervals |

## API Endpoints

- `GET /api/dashboard` — Dashboard summary
- `GET|POST /api/exercises` — Exercise library
- `GET|POST /api/sessions` — Sessions
- `GET|PATCH /api/sessions/:id` — Session detail
- `GET|POST /api/body` — Body measurements
- `GET|POST /api/pr` — Personal records
- `GET|POST /api/wellness/sleep` — Sleep log
- `GET|POST /api/wellness/water` — Water tracker
- `GET|POST /api/wellness/soreness` — Soreness log
- `GET|POST /api/wellness/nutrition` — Nutrition log
- `GET|POST /api/breathing` — Breathing sessions
- `GET|POST /api/goals` — Goals & achievements
- `POST /api/seed` — Seed database with exercises

## WebSocket

Connect to `ws://localhost:3000/_ws` for live session monitoring.

Events: `session:join`, `session:start`, `timer:start`, `timer:stop`, `rep:complete`, `set:complete`, `break:request`, `modify:request`, `session:complete`
