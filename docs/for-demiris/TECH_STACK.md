# Simpleton Tech Stack — What We Use and Why

## Frontend

| Technology | What It Does | Why We Chose It |
|-----------|-------------|-----------------|
| **React** | UI framework | Industry standard. Every engineer knows it. Fast hiring. |
| **TypeScript** | Type-safe JavaScript | Catches bugs before they reach users. Professional codebases require it. |
| **Tailwind CSS** | Styling | Rapid development, consistent design. No CSS file mess. |
| **shadcn/ui** | Component library | Beautiful, accessible components out of the box. Same ones Vercel uses. |
| **TanStack Query** | Data fetching | Automatic caching, loading states, error handling. Reduces boilerplate by 80%. |
| **Wouter** | Page routing | Lightweight alternative to React Router. Less overhead, same functionality. |
| **Recharts** | Charts & graphs | Clean market data visualizations without the complexity of D3. |
| **Lucide React** | Icons | Consistent, professional icon set. |

## Backend

| Technology | What It Does | Why We Chose It |
|-----------|-------------|-----------------|
| **Node.js + Express** | Web server | Handles API requests. Same language as frontend = one codebase, one team. |
| **TypeScript** | Type safety | End-to-end type sharing between frontend and backend. |
| **PostgreSQL** | Database | Production-grade relational database. Handles complex queries well. |
| **Drizzle ORM** | Database layer | Type-safe queries, no raw SQL mistakes. Modern alternative to Prisma. |
| **Passport.js** | Authentication | Session-based auth. Battle-tested library for user login. |

## AI & Intelligence

| Technology | What It Does | Why We Chose It |
|-----------|-------------|-----------------|
| **DeepSeek API** | Primary AI model | Cost-effective, high-quality responses for domain-specific queries. |
| **Anthropic Claude** | Secondary AI model | Fallback + complex reasoning tasks. |
| **OpenAI** | Tertiary AI model | Additional redundancy. Multi-provider = no single point of failure. |
| **Custom Tool System** | AI actions | Lets Simplicity DO things (check prices, set alerts) not just talk. |

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| **Kitco** | Live precious metals spot prices (gold, silver, platinum, palladium) |
| **Rapaport Grid** | Diamond pricing benchmarks by 4Cs |
| **User Transactions** | Real-world dealer pricing (our unique data) |
| **Multiple APIs** | Rolex secondary market, coin valuations, news |

## Infrastructure

| Technology | What It Does |
|-----------|-------------|
| **Replit** | Hosting, deployment, CI/CD |
| **SendGrid** | Transactional email delivery |
| **Session Store** | Server-side session management for auth |

## Clever Tricks We Implemented

**Multi-model AI with automatic failover** — If DeepSeek is down, we fall back to Anthropic, then OpenAI. The user never notices.

**Tool-augmented AI** — Simplicity doesn't just generate text. It calls real APIs, does real calculations, and cites real sources. This is the same architecture behind ChatGPT's plugins, but custom-built for precious metals.

**Transaction-weighted pricing** — The Simpleton Index blends spot prices with crowdsourced dealer data. As the network grows, this becomes proprietary market data no competitor can replicate.

**Background intelligence** — Price alerts, index computation, and health monitoring all run as background jobs without slowing down the user experience.

**Shared type system** — Frontend and backend share the same TypeScript types (`shared/schema.ts`). When the database schema changes, the compiler catches every place that needs updating. Zero runtime type errors.
