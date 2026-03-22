# Investor Presentation Notes

Use these talking points for each feature. Three bullets to say, one question they'll ask, one answer to give.

---

## Simplicity AI Assistant

**Say this:**
- "Every precious metals platform shows you numbers. We give you an AI that explains what those numbers mean for your specific situation."
- "Simplicity doesn't guess — it calls real APIs, checks live prices, and cites its sources. Every recommendation is backed by data."
- "Users interact with it in plain English. 'What's my 14k chain worth?' gets a real answer in seconds."

**They'll ask:** "How is this different from just using ChatGPT?"

**Your answer:** "ChatGPT doesn't have access to live spot prices, Rapaport diamond data, or our proprietary transaction network. We built custom tools that let the AI call real pricing APIs and blend that with crowdsourced dealer data. It's domain-specific intelligence — not a general chatbot with a precious metals prompt."

---

## Market Memory Engine

**Say this:**
- "Every transaction our users report makes the entire platform smarter. We're building a network effect around market data."
- "We predict price direction for precious metals — 7 day, 30 day, and 90 day horizons — and the accuracy improves with usage."
- "Bloomberg Terminal charges $24,000 a year for this kind of analysis. We're democratizing it."

**They'll ask:** "What's the accuracy rate?"

**Your answer:** "We're transparent about this. Right now we're in cold-start mode — predictions are spot-based with moderate confidence. As our transaction volume grows, accuracy improves measurably. We track and publish our accuracy metrics. The model is designed to get better, not to pretend it's already perfect."

---

## Simpleton Index

**Say this:**
- "Spot price tells you what gold trades for on an exchange. The Simpleton Index tells you what a dealer in your city actually paid for it today."
- "This data doesn't exist anywhere else. We're creating a new market benchmark from real transactions."
- "It's updated every 15 minutes and available through our public API — any business can build on it."

**They'll ask:** "How many transactions do you need for this to be meaningful?"

**Your answer:** "At 50+ transactions per metal per week, we start seeing statistically meaningful premiums and regional patterns. At 500+, we can break it down by region and product type. Every user who joins accelerates this. That's the network effect."

---

## Diamond Pricing Transparency

**Say this:**
- "The diamond industry is deliberately opaque about pricing. We make it transparent — and that's disruptive."
- "Rapaport charges $150 a month for their pricing grid. We provide the same valuation for free."
- "Users input the 4 Cs and get an instant market valuation. No signup required, no paywall."

**They'll ask:** "Won't Rapaport have a problem with this?"

**Your answer:** "We use Rapaport data as a benchmark, similar to how real estate apps use MLS data. Our valuations are computed estimates, not reproduced lists. We're adding value on top of industry data, not just redistributing it."

---

## Price Alerts

**Say this:**
- "Dealers don't sit watching price charts all day. They tell our AI 'alert me when gold hits $5,500' and go serve customers."
- "It's built into the conversation — no separate app, no settings page to configure. Just say it."
- "We check prices every 5 minutes against every user's targets. When it triggers, they know instantly."

**They'll ask:** "How do you notify them?"

**Your answer:** "Right now alerts are visible in the app and tracked in the user's account. Email and push notifications are on the roadmap — the infrastructure is already there through our SendGrid integration."

---

## Transaction Data Network

**Say this:**
- "Every sale or purchase a user reports makes every other feature better — appraisals, predictions, and the index."
- "We validate every transaction against network averages, flag outliers, and assign confidence scores. The data is clean."
- "This is the moat. Competitors can copy our UI. They can't copy our data."

**They'll ask:** "What stops people from entering fake data?"

**Your answer:** "We have a validation layer. Every transaction is checked against the network average — if someone reports selling gold at $500 when spot is $5,000, it gets flagged with low confidence and doesn't skew the index. Verified dealer transactions get higher weight than anonymous reports."

---

## Simpleton Brain (NEW)

**Say this:**
- "Our AI doesn't just answer questions — it watches what you're doing. If you're on the calculator with 14K gold selected, she already knows. You don't have to explain yourself."
- "Responses stream in word by word, like she's thinking. Not a loading spinner — a living conversation."
- "We can drop an 'Ask Simplicity' button anywhere in the app. One click and she opens with a contextual question already formed."

**They'll ask:** "How is that different from Siri or Google Assistant?"

**Your answer:** "Siri doesn't know what's in your calculator. Google doesn't know what dealer you're looking at. Our Brain sees the entire app state — every number, every selection, every price — and brings that into every response. It's domain-aware ambient intelligence, not a general voice assistant."

---

## Simpleton's List (Dealer Directory)

**Say this:**
- "There's no Yelp for pawn shops. No accountability. No way to know if the place down the street is going to lowball you. Simpleton's List fixes that."
- "127 vetted businesses across all 50 states with reviews, ratings, and a formal complaint system."
- "We cross-reference our own user reviews with Google Places ratings to give a composite trust score."

**They'll ask:** "How do you verify businesses?"

**Your answer:** "We start with seeded data from verified directories. Admin review confirms or flags them. Users leave reviews and file formal complaints with severity levels. We investigate flagged complaints and can blacklist businesses. Over time, the community polices itself — but we maintain editorial control."

---

## Overall Business

**Say this:**
- "We're not just a calculator app. We're building the data layer for the entire precious metals and diamond industry."
- "The platform has three revenue paths: subscription tiers, API licensing, and eventually white-label solutions for dealers."
- "Our user base creates a network effect — every new user makes the platform more valuable for every existing user."

**They'll ask:** "Who's the competition?"

**Your answer:** "Kitco for pricing data, APMEX for retail, Rapaport for diamonds. But none of them combine AI intelligence, real-time pricing, and crowdsourced transaction data in one platform. We're not competing on any single feature — we're building the operating system for the precious metals trade."

---

## Technical Credibility

**Say this:**
- "Full-stack TypeScript from database to frontend. Same type system catches errors before they reach production."
- "Multi-model AI architecture — if one provider goes down, we fail over automatically. Users never notice."
- "Open API design — other businesses can build on top of our data. That's how platforms become ecosystems."

**They'll ask:** "Can this scale?"

**Your answer:** "The architecture is stateless and horizontally scalable. The database handles the state, the server handles the logic, and the AI calls are distributed across multiple providers. We can add capacity without rewriting anything."
