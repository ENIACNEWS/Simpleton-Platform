# Simpleton Architecture — How It All Works

## The Big Picture

Simpleton is a **web application** with a React frontend and a Node.js/Express backend, all running from a single server. Users interact with the app through their browser, and the AI assistant (Simplicity) talks to multiple pricing APIs and AI models behind the scenes.

```
                         +-----------------------+
                         |     USER'S BROWSER    |
                         |  (React + Tailwind)   |
                         +-----------+-----------+
                                     |
                              HTTPS / API calls
                                     |
                         +-----------v-----------+
                         |    EXPRESS SERVER      |
                         |    (Node.js / TS)      |
                         |                        |
                         |  +------------------+  |
                         |  | Simplicity AI    |  |
                         |  | (Chat + Tools)   |  |
                         |  +--------+---------+  |
                         |           |             |
                         |  +--------v---------+  |
                         |  | Tool System      |  |
                         |  | (pricing, alerts, |  |
                         |  |  predictions...)  |  |
                         |  +--------+---------+  |
                         |           |             |
                         +-----------+-------------+
                                     |
                    +----------------+----------------+
                    |                |                 |
             +------v-----+  +------v------+  +------v------+
             |  PostgreSQL |  | Kitco/APIs  |  | AI Models   |
             |  Database   |  | (live prices)|  | (DeepSeek,  |
             |             |  |             |  |  Anthropic)  |
             +-------------+  +-------------+  +-------------+
```

## How Data Flows

### When a user asks Simplicity a question:

1. **User types** in the Brain panel (bottom-right of every page)
2. **Brain Context** (`client/src/lib/brain-context.tsx`) captures current app state — calculator values, live prices, selected items, current page
3. **Frontend** sends message + full app context to `POST /api/assistant/help`
4. **Simplicity Brain** (`server/simplicity-brain.ts`) builds the system prompt with user memory, page awareness, and live data
5. **Tool System** (`server/deepseek-tools.ts`) calls the right tool:
   - Price check? Calls Kitco API
   - Appraisal? Blends live spot + transaction history
   - Diamond? Runs Rapaport grid lookup
   - Prediction? Runs the Market Memory Engine
6. **AI Model** generates a response using the tool results
7. **Response streams** word by word via Server-Sent Events back to the user

### When a user loads a page:

1. **React Router** (`client/src/App.tsx`) picks the right page component
2. **TanStack Query** fetches data from API endpoints
3. **Express routes** (`server/routes.ts`) serve the data
4. **Storage layer** (`server/storage.ts`) handles database reads/writes

## Where Key Files Live

| What | Where | Purpose |
|------|-------|---------|
| All API routes | `server/routes.ts` | Every endpoint the app serves |
| Database schema | `shared/schema.ts` | Table definitions + types |
| Database queries | `server/storage.ts` | All CRUD operations |
| AI brain | `server/simplicity-brain.ts` | Simplicity's personality + knowledge |
| AI tools | `server/deepseek-tools.ts` | What Simplicity can DO (not just say) |
| Brain context | `client/src/lib/brain-context.tsx` | App-wide awareness system |
| Brain UI | `client/src/components/brain/` | Chat panel, trigger, contextual buttons |
| AI memory | `server/simplicity-memory.ts` | Per-user memory + fact extraction |
| Price predictions | `server/prediction-engine.ts` | Market Memory Engine |
| Real-world index | `server/simpleton-index.ts` | Simpleton Index computation |
| Live metal prices | `server/kitco-pricing.ts` | Real-time spot price fetching |
| Diamond pricing | `shared/rapaport-grid-lock.ts` | Rapaport-based diamond valuations |
| Dealer directory | `client/src/pages/simpletons-list.tsx` | Simpleton's List |
| Frontend pages | `client/src/pages/` | All user-facing pages |
| UI components | `client/src/components/` | Reusable interface pieces |
| React app entry | `client/src/App.tsx` | Route definitions + app shell |

## The Three Engines

### 1. Simplicity AI (The Brain)
The conversational AI assistant that knows precious metals, diamonds, watches, and coins. It doesn't just chat — it has **tools** that let it look up live prices, run calculations, set alerts, and make predictions.

### 2. Market Memory Engine (The Predictor)
Learns from every transaction users report. The more data it gets, the better its predictions become. Right now it's in "cold start" mode (spot-based), but every logged sale makes it smarter.

### 3. Simpleton Index (The Differentiator)
Our unique contribution to the market — a price index based on what dealers are ACTUALLY paying, not theoretical spot prices. Updated every 15 minutes from real transaction data.

## Background Services

These run automatically on the server:

| Service | Interval | File |
|---------|----------|------|
| Price Alert Checker | 5 min | `server/price-alert-checker.ts` |
| Simpleton Index | 15 min | `server/simpleton-index.ts` |
| Self-Maintenance | Continuous | `server/self-maintenance-system.ts` |

## Security

- Session-based auth with Passport.js
- API key system for external access
- Rate limiting on all endpoints
- Owner-only admin panels (S7, Ghost Admin)
- Visitor tracking for analytics (`server/s7-core.ts`)
