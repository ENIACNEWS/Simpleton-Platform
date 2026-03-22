# Simpleton Features — What We Built and Why

---

## 1. Simplicity AI Assistant

**What it does:** A conversational AI that sits on every page. Users ask questions about precious metals, diamonds, watches, or coins and get intelligent, sourced answers with real-time pricing.

**Why we built it:** Every competitor (Kitco, APMEX, JM Bullion) gives you raw numbers. Nobody gives you a knowledgeable friend who explains what those numbers mean for YOUR situation. Simplicity is that friend.

**How it works:** The AI receives the user's message, decides which tools to call (price lookup, appraisal, prediction), gets real data, then generates a natural response. It's not making things up — every price and recommendation is backed by live data.

**Key files:** `server/simplicity-brain.ts` (personality + knowledge), `server/deepseek-tools.ts` (tool system), `client/src/components/brain/BrainPanel.tsx` (unified chat UI), `client/src/lib/brain-context.tsx` (context-awareness system)

**What makes it better:** Competitors show you a price chart. We give you an AI that explains what the chart means, remembers your portfolio, and tells you when to act.

---

## 2. Market Memory Engine (Price Predictions)

**What it does:** Predicts where precious metal prices are headed in 7, 30, or 90 days. Gets smarter with every transaction users report.

**Why we built it:** Dealers and collectors constantly ask "should I buy now or wait?" Nobody answers that question with data. We do.

**How it works:** Combines live spot prices with historical transaction patterns from the Simpleton network. Starts with spot-based estimates (35% confidence), improves as transaction volume grows. At 100+ transactions, reaches high confidence with trend analysis.

**Key files:** `server/prediction-engine.ts` (prediction logic), API at `GET /api/v1/predictions/:metal`

**What makes it better:** Bloomberg Terminal costs $24,000/year. We give everyday dealers and collectors price direction for free.

---

## 3. Simpleton Index

**What it does:** Shows what dealers are ACTUALLY paying for metals — not just what the London fix says. A transaction-weighted real-world price index.

**Why we built it:** Spot price is theoretical. What a dealer in Dallas pays for an ounce of gold is different from what one in Miami pays. The Simpleton Index captures that reality.

**How it works:** Every 15 minutes, blends current spot with the 7-day average of reported transactions. The more transactions we collect, the more the index diverges from spot — revealing real premiums and discounts.

**Key files:** `server/simpleton-index.ts` (computation), API at `GET /api/v1/index/:metal`

**What makes it better:** This data doesn't exist anywhere else. Period. No competitor produces a transaction-weighted retail precious metals index.

---

## 4. Precious Metals Calculator

**What it does:** Instant melt-value calculations for gold, silver, platinum, and palladium items. Supports different purities, weights, and units.

**Why we built it:** The core utility that brings dealers to the platform daily. Every pawn shop, jewelry store, and coin dealer needs this.

**How it works:** Fetches live spot prices from Kitco, applies purity multipliers, gives instant valuations. Updates in real time.

**Key files:** `client/src/components/calculator/authentic-simpleton-calculator.tsx`, `server/kitco-pricing.ts`

**What makes it better:** Most calculators use delayed prices. Ours updates live and includes the Simpleton premium data.

---

## 5. Diamond Pricing Engine

**What it does:** Values diamonds using Rapaport-grid pricing across cut, clarity, color, and carat weight.

**Why we built it:** Diamond pricing is opaque by design. We make it transparent — which is disruptive to the industry.

**How it works:** Locked-in Rapaport grid data covers round and pear shapes across multiple carat ranges. Users input the 4 Cs, get a market valuation.

**Key files:** `shared/rapaport-grid-lock.ts`, `shared/pear-pricing-grid-lock.ts`, `client/src/components/diamonds/`

**What makes it better:** Rapaport charges $150/month for this data. We provide the valuation for free.

---

## 6. Price Alerts

**What it does:** Users tell Simplicity "alert me when gold hits $5,500" and get notified when it happens.

**Why we built it:** Dealers don't sit watching price charts all day. They need automated monitoring so they can focus on customers.

**How it works:** Background job checks live spot prices against user targets every 5 minutes. When triggered, updates the alert status. Users manage alerts through Account Settings.

**Key files:** `server/price-alert-checker.ts`, `server/deepseek-tools.ts` (set_price_alert tool), `client/src/pages/account.tsx` (Price Alerts tab)

**What makes it better:** Most alert systems are separate apps or paid services. Ours is built into the AI assistant — just say it in plain English.

---

## 7. Transaction Feedback Loop

**What it does:** Users report real sales and purchases ("I just sold a 1oz Gold Eagle for $5,200 in Chicago"). That data feeds back into appraisals and predictions.

**Why we built it:** The more real transaction data we collect, the better every other feature becomes. This is the flywheel.

**How it works:** The `record_transaction` tool validates the price against network averages, assigns a confidence score, flags outliers (>30% deviation), and stores it. The `appraise_with_history` tool blends this data with live spot for future appraisals.

**Key files:** `server/deepseek-tools.ts` (record_transaction + appraise_with_history tools), `server/storage.ts` (transaction queries)

**What makes it better:** Nobody else is crowdsourcing real dealer-to-dealer transaction data. This is proprietary market intelligence that grows with every user.

---

## 8. Rolex Market Intelligence

**What it does:** Real-time secondary market pricing for Rolex watches, with model-specific data and trend analysis.

**Why we built it:** The Rolex secondary market is a $20B+ industry with terrible price transparency. We fix that.

**Key files:** `server/ai-rolex-expert.ts`, `client/src/pages/watches.tsx`, `client/src/pages/rolex-market-data.tsx`

---

## 9. Coin Database & Portfolio Tracker

**What it does:** Comprehensive coin database with grading information, historical pricing, and portfolio tracking.

**Key files:** `client/src/components/database/`, `client/src/pages/database.tsx`, `server/initialize-coins.ts`

---

## 10. Simpleton Brain (Context-Aware AI)

**What it does:** The Brain is Simplicity's nervous system. It knows what you're doing at all times — what page you're on, what's in the calculator, what coin you're viewing, live market prices — and uses all of that in every AI response. It streams responses word by word so the AI feels alive.

**Why we built it:** Old design had three separate floating AI buttons. Users didn't know which one to click. The Brain replaces all of them with one unified, always-aware interface.

**How it works:** A React context provider wraps the entire app. Every feature (calculator, business directory, coin database) feeds its state to the Brain. When the user asks a question, the AI already knows what they're looking at. Responses stream via Server-Sent Events for real-time feel.

**Key files:** `client/src/lib/brain-context.tsx` (provider + awareness state), `client/src/components/brain/BrainPanel.tsx` (chat UI), `client/src/components/brain/BrainTrigger.tsx` (floating button), `client/src/components/brain/AskBrain.tsx` (contextual shortcut buttons)

**What makes it better:** No AI assistant on the market knows what page you're on, what numbers are in your calculator, and what gold price was 30 seconds ago — all at the same time. This is ambient intelligence, not a chat window.

---

## 11. Simpleton's List (Dealer Directory)

**What it does:** A vetted, searchable directory of pawn shops, gold buyers, jewelers, coin shops, and watch dealers across all 50 states. Users can leave reviews, file formal complaints, and see which businesses are blacklisted.

**Why we built it:** The precious metals industry has no Yelp. Dealers operate with almost no public accountability. Simpleton's List provides transparency and trust.

**How it works:** 127+ seeded businesses with admin verification. Combines Simpleton user reviews with synced Google Places ratings for a composite trust score. Formal complaint system with severity tracking and admin investigation queue.

**Key files:** `client/src/pages/simpletons-list.tsx`, `server/seed-businesses.ts`, `server/google-review-sync.ts`

**What makes it better:** No competitor provides a reviewed, rated, and accountable directory of precious metals dealers with a formal complaint system.

---

## 12. Owner Intelligence System (S7)

**What it does:** Visitor analytics, admin dashboards, and business intelligence tools. Owner-only access.

**Why we built it:** You need to know who's using the platform, where they're coming from, and what they're looking at — without paying for Google Analytics Pro.

**Key files:** `server/s7-core.ts`, `client/src/pages/s7-panel.tsx`, `client/src/pages/GhostAdminDashboard.tsx`
