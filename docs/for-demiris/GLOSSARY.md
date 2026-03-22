# Simpleton Glossary — Terms You Might Need to Explain

---

### Market Memory Engine
The system that learns from real transactions to predict where prices are going. Think of it like Waze for precious metals — every user who reports a sale makes the predictions better for everyone. Currently operates on spot data with improving accuracy as transaction volume grows.

### Simpleton Index
A price index that shows what dealers are actually paying, versus the theoretical "spot" price set by exchanges. Updated every 15 minutes from real user-reported transactions. No competitor produces this data — it's our proprietary market intelligence.

### Simplicity
The AI assistant built into every page. Named to match the brand (Simpleton makes things simple). It's not a generic chatbot — it has specialized tools for precious metals, diamonds, watches, and coins. It can check live prices, run appraisals, set alerts, and make predictions.

### Spot Price
The current market price for a commodity (gold, silver, etc.) as determined by major exchanges. This is what Kitco and Bloomberg report. The Simpleton Index shows how real-world prices differ from this number.

### Premium (over spot)
The extra amount dealers charge above spot price. For example, if gold spot is $5,000 and a dealer sells a 1oz coin for $5,150, the premium is $150 (3%). The Simpleton Index tracks average premiums across the network.

### Rapaport Grid
The industry-standard pricing guide for diamonds, organized by the 4 Cs (cut, clarity, color, carat). Published by Martin Rapaport since 1978. Normally costs $150/month to access — we provide the valuation for free.

### The 4 Cs (Diamonds)
Cut, Clarity, Color, and Carat weight. The universal grading system for diamonds. Our calculator uses all four to generate valuations.

### Tool-Augmented AI
The technique that lets Simplicity do things, not just talk. When a user asks "what's gold at?", the AI calls a real pricing API. When they say "alert me at $5,500", it creates a real alert in the database. Same architecture behind ChatGPT plugins.

### Transaction Feedback Loop
The system where users report real sales/purchases, which feeds back into future appraisals and predictions. More data = better accuracy. This creates a network effect — the platform gets smarter with every user.

### Invisible Appraiser
The appraisal tool built into Simplicity. Users describe an item in plain English ("I have a 14k gold chain, 24 inches, 38 grams") and get an instant valuation blending live spot prices with real transaction data from the network.

### Autonomous Negotiator
A planned feature (not yet built) that will help dealers negotiate prices by analyzing current market conditions, recent transactions, and buyer/seller patterns. Think of it as an AI-powered negotiation assistant that knows what the market will bear.

### S7 Panel
The owner intelligence dashboard. Named after an internal code designation. Shows visitor analytics, user activity, and system health. Only accessible to platform owners.

### Ghost Admin
The competitive intelligence system. Monitors competitor pricing, market trends, and business analytics. Owner-only access.

### Melt Value
The raw commodity value of a precious metals item based only on its weight and purity. For example, a 10g 14k gold ring has a melt value of 10g x 0.585 purity x spot price. This is the floor value — actual market value may be higher due to craftsmanship, brand, or collector demand.

### API
Application Programming Interface. The way other software connects to Simpleton's data. We provide APIs for live pricing, the Simpleton Index, and predictions — so other businesses can build on our platform.

### Simpleton Brain
The context-awareness system that gives Simplicity real-time knowledge of what the user is doing. It tracks calculator state, live prices, which business they're viewing, which coin they're researching — and feeds all of that into every AI response. Think of it as the nervous system connecting the AI to the entire app.

### AskBrain
A small button that can be placed on any page in the app. When clicked, it opens Simplicity with a pre-formed question specific to that page or feature. One tap, instant contextual help.

### Simpleton's List
The vetted dealer directory — pawn shops, gold buyers, jewelers, coin shops, and watch dealers across all 50 states. Users leave reviews, file formal complaints, and see which businesses are verified or blacklisted. Cross-references Simpleton user reviews with Google Places ratings for a composite trust score.

### Streaming Responses
The technique where AI text appears word by word instead of all at once. Uses Server-Sent Events (SSE). Makes the AI feel like it's thinking in real time rather than processing behind a loading spinner.

### Cold Start
When the Market Memory Engine or Simpleton Index has limited transaction data, so it relies primarily on spot prices. As users log more transactions, the system "warms up" and produces increasingly accurate, differentiated data.
