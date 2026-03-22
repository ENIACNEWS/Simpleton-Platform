# Simpleton

Market intelligence platform for precious metals, diamonds, watches, and coins.

Built by LaDale Industries LLC.

## What It Does

- **AI-powered appraisals** for gold, silver, platinum, palladium, diamonds, and Rolex watches
- **Live pricing** aggregated from multiple market sources
- **Price predictions** via the Market Memory Engine (7/30/90-day horizons)
- **Simpleton Index** — transaction-weighted real-world pricing unavailable anywhere else
- **Price alerts** — natural language monitoring ("alert me when gold hits $5,500")
- **Diamond valuations** using Rapaport-grid pricing across cut, clarity, color, and carat
- **Coin database** with grading, historical pricing, and portfolio tracking

## Quick Start

```bash
npm install
npm run dev
```

The app runs on port 5000 with the Express backend and Vite frontend served together.

## Project Structure

```
server/          Backend (Express + TypeScript)
  routes.ts      All API endpoints
  storage.ts     Database access layer
  deepseek-tools.ts   AI tool system
  simplicity-brain.ts Simplicity AI configuration
  prediction-engine.ts  Market Memory Engine
  simpleton-index.ts    Simpleton Index computation

client/src/      Frontend (React + TypeScript)
  pages/         Page components
  components/    Reusable UI components
  lib/           Utilities and API client

shared/          Shared types and schemas
  schema.ts      Database schema + TypeScript types

docs/for-demiris/  Architecture and feature documentation
archive/           Previous experiments and reference material
```

## Key APIs

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/index/:metal` | Simpleton Index for a metal |
| `GET /api/v1/index` | All metal indices |
| `GET /api/v1/predictions/:metal?horizon=30` | Price predictions |
| `GET /api/v1/predictions/accuracy` | Prediction accuracy metrics |
| `POST /api/simplicity/chat` | Simplicity AI conversation |
| `GET /api/prices/live` | Live spot prices |

## Environment Variables

See `.env.example` for required configuration. API keys and secrets are never committed to the repository.

## License

Proprietary. All rights reserved, LaDale Industries LLC.
