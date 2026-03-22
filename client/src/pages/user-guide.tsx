import { useState, useRef } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import {
  Download, ChevronRight, ChevronLeft, BookOpen, Home, Calculator,
  Gem, Coins, Watch, MessageSquare, BarChart2, Mail, Star,
  Briefcase, GraduationCap, Eye, Menu, X, CheckCircle2, ArrowRight
} from "lucide-react";

// ─── GUIDE CONTENT ───────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    id: "intro",
    number: 0,
    title: "Welcome to Simpleton Vision™",
    icon: Star,
    color: "from-yellow-500 to-amber-600",
    sections: [
      {
        heading: "About This Guide",
        body: `This guide is your complete reference for Simpleton Vision™ — an AI-powered market intelligence platform for precious metals, diamonds, luxury watches, and coins. Whether you're a jeweler, dealer, investor, or collector, this guide will walk you through every feature so you can use the platform with confidence.

The guide is organized into chapters, one per major feature. You can read from start to finish or jump directly to the chapter most relevant to your work. At the end of this guide you can download a PDF copy to keep for reference.`
      },
      {
        heading: "About Simpleton Vision™",
        body: `Simpleton Vision™ was created by Demiris Brown, a professional with over 12 years of experience in the jewelry industry. The platform was built to solve a real problem: market intelligence for precious metals, diamonds, and luxury goods is scattered across dozens of sources, slow to access, and expensive to subscribe to.

<span className="simpleton-brand">Simpleton</span> Vision™ consolidates live spot prices, Rapaport diamond pricing, Rolex reference data, coin melt values, and AI-powered analysis into one clean, fast platform. Everything you need is in one place.

Simplicity is the AI assistant at the heart of the platform. She is not a generic chatbot — she has been trained with deep domain knowledge in precious metals, diamonds, watches, and coins, and she has access to live market data at all times.`
      },
      {
        heading: "Your Account",
        body: `To get the most from Simpleton Vision™, create a free account. Registered users receive:

Persistent memory — Simplicity remembers your inventory, preferences, and goals across every session, so you never have to repeat yourself.

Saved history — every calculation, conversation, and appraisal is saved to your account.

Portfolio tracking — build and monitor a personal portfolio of metals, coins, and gems.

Simplicity Mail Organizer — connect your Gmail to let Simplicity automatically sort, summarize, and prioritize your emails.

To create an account, click Sign Up in the top navigation bar. If you already have an account, click Log In.`
      }
    ]
  },
  {
    id: "navigation",
    number: 1,
    title: "Dashboard & Navigation",
    icon: Home,
    color: "from-slate-500 to-slate-600",
    sections: [
      {
        heading: "The Home Dashboard",
        body: `When you first land on Simpleton Vision™, you see the home dashboard. The dashboard is your command center. Here is what you will find:

Live Price Ticker — running across the top of every page, the ticker shows real-time prices for gold, silver, platinum, palladium, and select diamonds, updated continuously from multiple data sources.

Market Cards — the main body of the dashboard shows current spot prices with 24-hour change indicators. Green indicates a price increase; red indicates a decrease.

News Feed — below the market cards, you will find a curated feed of precious metals and jewelry industry news, pulled from RSS feeds in real time.

Simplicity Chat Button — a floating button in the lower right corner opens the Simplicity AI assistant from any page on the platform. You can ask any question without leaving your current screen.`
      },
      {
        heading: "The Navigation Bar",
        body: `The top navigation bar gives you access to every section of the platform. It is organized into logical groups:

Calculators — Precious Metals, Diamond, and Coin calculators. These are the core tools for melt value and pricing calculations.

Market Data — the Quantum Ticker pages for live metals, diamonds, stocks, and cryptocurrency.

Intelligence — the Simplicity AI Chat, <span className="simpleton-brand">Simpleton</span> Vision (advanced AI with image upload), AI Market Analysis, and AI Price Advisor.

Jewelry — the Diamond Database, Rolex Reference, and Jewelry Appraisal pages.

Portfolio — your personal portfolio manager.

Education — articles, tutorials, and this user guide.

On mobile, the navigation collapses into a hamburger menu in the top right corner. Tap it to expand the full menu.`
      },
      {
        heading: "The Floating Simplicity Button",
        body: `No matter which page you are on, you can open Simplicity by clicking the floating button in the lower right corner of the screen. This opens a slide-in chat panel where you can ask questions, request calculations, or ask for step-by-step guidance — all without leaving the page you are working on.

This is especially useful when you are in the middle of a calculation and want to ask Simplicity to explain a result or suggest next steps.`
      }
    ]
  },
  {
    id: "precious-metals",
    number: 2,
    title: "Precious Metals Calculator",
    icon: Calculator,
    color: "from-yellow-600 to-yellow-700",
    sections: [
      {
        heading: "What the Calculator Does",
        body: `The Precious Metals Calculator computes the melt value of any gold, silver, platinum, or palladium item. Melt value is the raw worth of the metal content in an item at current spot prices — the minimum baseline value of any piece.

This is the foundational tool for jewelers, dealers, and investors. Use it to price scrap, evaluate purchases, verify dealer quotes, and calculate estate values.`
      },
      {
        heading: "Step 1 — Select the Metal",
        body: `At the top of the calculator, choose the metal you are working with: Gold, Silver, Platinum, or Palladium. The live spot price for that metal automatically populates the price field. You can also manually override the spot price if you want to calculate at a specific price point.`
      },
      {
        heading: "Step 2 — Enter the Weight",
        body: `Enter the weight of the item and select the unit:

Troy ounce (ozt) — the standard unit for precious metals trading. One troy ounce equals 31.1035 grams.

Gram (g) — the most common unit for jewelry weight.

Pennyweight (dwt) — traditional jewelry trade unit. 20 pennyweights equal one troy ounce.

Kilogram (kg) — used for large quantities of bullion.

The calculator converts between all units automatically. If your scale shows grams, enter grams and select grams — do not convert manually.`
      },
      {
        heading: "Step 3 — Select the Purity",
        body: `Choose the purity or karat of the item from the dropdown. Common gold purities:

24K — 99.9% pure gold. Bullion coins and bars.
22K — 91.7% pure gold. Krugerrands, Gold Eagles.
18K — 75.0% pure gold. Fine jewelry, European standard.
14K — 58.3% pure gold. Common US jewelry standard.
10K — 41.7% pure gold. Minimum karat for gold jewelry in the US.
9K — 37.5% pure gold. Common in UK and Australia.

For silver: .999 fine, .925 Sterling, .900 Coin Silver (pre-1965 US coins).

For platinum: .950 (most platinum jewelry) and .900.`
      },
      {
        heading: "Step 4 — Calculate and Interpret",
        body: `Click the Calculate button. The result shows:

Pure Metal Weight — how many troy ounces of pure metal are in the item.

Melt Value — the dollar value of the metal content at current spot prices.

The melt value is the floor price. Coins, bars, and jewelry all command premiums above melt depending on condition, rarity, brand, and demand. Use melt value as a starting point, not a final price.`
      },
      {
        heading: "Simpleton Mode",
        body: `Simpleton Mode is a simplified version of the precious metals calculator designed for quick, one-field lookups. Access it from the navigation bar under Calculators. Type a description like "14K gold ring 8 grams" and Simplicity will calculate the melt value in plain language — no dropdowns required.`
      }
    ]
  },
  {
    id: "diamond",
    number: 3,
    title: "Diamond Calculator",
    icon: Gem,
    color: "from-cyan-500 to-blue-600",
    sections: [
      {
        heading: "Understanding Diamond Pricing",
        body: `Diamonds are priced per carat and vary dramatically based on four quality factors called the 4Cs: Cut, Color, Clarity, and Carat weight. Unlike metals, there is no universal spot price — each combination of the 4Cs produces a different price per carat, based on Rapaport pricing grids updated weekly.

The <span className="simpleton-brand">Simpleton</span> Vision™ Diamond Calculator gives you access to Rapaport-based pricing and our proprietary diamond database.`
      },
      {
        heading: "Step 1 — Enter the Carat Weight",
        body: `Enter the carat weight of the diamond. Carat is a unit of weight: one carat equals 0.2 grams. Enter it as a decimal — for example, 1.5 for one and a half carats.

Important pricing thresholds: diamonds at or above 0.50ct, 1.00ct, 1.50ct, 2.00ct, and 3.00ct carry significant price premiums. A 0.99ct diamond is meaningfully less expensive than a 1.00ct diamond of the same quality.`
      },
      {
        heading: "Step 2 — Select Color Grade",
        body: `Diamond color is graded on a D-to-Z scale where D is colorless (most desirable) and Z is light yellow or brown.

D, E, F — Colorless. No visible color under magnification.
G, H, I, J — Near-colorless. Excellent value; color is not visible to the naked eye.
K, L, M — Faint yellow. Slight warmth visible in larger stones.
N through Z — Very light to light yellow. Visible color in all sizes.

Most retail jewelry uses G-J color. D-F is reserved for investment-grade and auction-house diamonds.`
      },
      {
        heading: "Step 3 — Select Clarity Grade",
        body: `Clarity grades the number and size of internal inclusions and external blemishes.

FL, IF — Flawless / Internally Flawless. No inclusions under 10x magnification. Extremely rare.
VVS1, VVS2 — Very Very Slightly Included. Inclusions extremely difficult to see under magnification.
VS1, VS2 — Very Slightly Included. Inclusions minor and difficult to see. Excellent eye-clean stones.
SI1, SI2 — Slightly Included. Inclusions visible under magnification; SI1 usually eye-clean.
I1, I2, I3 — Included. Inclusions visible to the naked eye. Lower value; often used for fashion jewelry.

For most buyers, VS2 to SI1 offers the best balance of quality and value.`
      },
      {
        heading: "Step 4 — Select the Shape",
        body: `The shape of a diamond affects its price. Round brilliant diamonds command the highest premiums due to their superior light return and high demand. Fancy shapes — oval, cushion, pear, emerald, princess, radiant, marquise, and asscher — typically cost 20 to 40 percent less than a round of equivalent quality.

Select the shape from the dropdown. The calculator adjusts the price accordingly.`
      },
      {
        heading: "Step 5 — Calculate and Interpret",
        body: `Click Calculate. The result shows:

Price per Carat — the Rapaport-based per-carat price for this combination of 4Cs.

Total Value — the price per carat multiplied by the carat weight.

Rap Grid Price — the full Rapaport grid value before any discount.

Note: Rapaport prices are pre-discount list prices. Actual wholesale transactions typically occur at 20 to 50 percent below list, depending on market conditions and stone quality. Retail prices are typically 1.5x to 2.5x above list. Simplicity can explain current market discounts for any specific stone if you ask.`
      },
      {
        heading: "RAP GRID Panel",
        body: `Below the main calculator is the RAP GRID panel — a pricing matrix that shows per-carat values across multiple carat weight ranges and quality combinations. This gives you a broader view of where your stone sits in the market and allows you to quickly compare different combinations.

Click any cell in the grid to auto-populate the calculator fields with that combination.`
      }
    ]
  },
  {
    id: "coin",
    number: 4,
    title: "Coin Calculator",
    icon: Coins,
    color: "from-amber-500 to-orange-600",
    sections: [
      {
        heading: "What the Coin Calculator Does",
        body: `The Coin Calculator determines the melt value of US coins based on their metal content. Pre-1965 US dimes, quarters, and half-dollars contain 90% silver. Many early 20th-century coins contain gold. This calculator lets you quickly determine the intrinsic metal value of any coin in any quantity.

This is essential for dealers buying junk silver rolls, estates, and coin collections.`
      },
      {
        heading: "Silver Coin Melt Values",
        body: `Pre-1965 US coins contain 90% silver. The calculator uses current silver spot price to determine melt value.

Common silver coins and their silver content:

Morgan Dollar (1878–1921) — 0.7734 troy ounces of silver per coin.
Peace Dollar (1921–1935) — 0.7734 troy ounces of silver per coin.
Walking Liberty Half Dollar — 0.3617 troy ounces per coin.
Franklin Half Dollar — 0.3617 troy ounces per coin.
Kennedy Half Dollar (1964 only, 90% silver) — 0.3617 troy ounces per coin.
Washington Quarter (pre-1965) — 0.1808 troy ounces per coin.
Roosevelt Dime (pre-1965) — 0.0723 troy ounces per coin.
Mercury Dime — 0.0723 troy ounces per coin.

The $1.00 Face Value formula: one dollar of face value in pre-1965 US silver coins contains 0.715 troy ounces of silver. This is the industry-standard quick calculation used by dealers.`
      },
      {
        heading: "Using the Calculator",
        body: `Select the coin type from the dropdown. Enter the quantity. The calculator instantly shows the total silver content in troy ounces and the total melt value at current spot prices.

For mixed bags of junk silver, use the Face Value input — enter the total face value of the bag and the calculator applies the 0.715 formula to the entire lot.

You can also calculate entire rolls: a roll of Morgan Dollars is 20 coins; a roll of quarters is 40 coins; a roll of dimes is 50 coins.`
      },
      {
        heading: "The Coin Database",
        body: `The Coin Database (accessible from the main navigation) is a comprehensive reference for US coins. Each entry includes the coin's composition, weight, diameter, mintage, key dates, designer, and current melt value.

Use the search bar to find any coin by name, year, or denomination. The database updates melt values in real time based on live spot prices.`
      }
    ]
  },
  {
    id: "rolex",
    number: 5,
    title: "Rolex Reference & Market Data",
    icon: Watch,
    color: "from-emerald-600 to-green-700",
    sections: [
      {
        heading: "The Rolex Reference Database",
        body: `The Watches page provides a comprehensive Rolex reference and valuation resource. Whether you are buying, selling, or appraising a Rolex, this section gives you detailed reference information to support your research.

The database covers every major Rolex reference produced since 1950, with identification details, serial number ranges, caliber information, and current market values. Note: All information is for reference purposes only — professional authentication by a certified watchmaker or authorized Rolex service center is recommended for all transactions.`
      },
      {
        heading: "How to Use the Serial Number Lookup",
        body: `Every genuine Rolex has a serial number engraved between the lugs at the 6 o'clock side of the case (for modern references) or on the rehaut (inner bezel ring) for watches produced after 2008.

Step 1 — Find the serial number on the watch. Write it down exactly.

Step 2 — Enter the serial number in the search field on the Watches page.

Step 3 — The system returns the production date range for that serial, the reference numbers produced in that period, and the movement calibers used.

Step 4 — Cross-reference the serial date with the dial, hands, case, and movement visible on the watch. Any significant discrepancy (for example, a dial style that was not produced until two years after the serial date) is a red flag.`
      },
      {
        heading: "Identification Details by Model",
        body: `The database includes model-specific identification details for commonly referenced models:

Submariner (116610, 126610) — crown guards, triplock crown, ceramic bezel insert weight and finish, date magnification, signed crown, rehaut engraving.

Daytona (116500, 126500) — pushers, bezel, chronograph seconds hand, dial sub-counters, case thickness.

GMT-Master II (126710, 126711) — Jubilee bracelet end links, Pepsi/Batman bezel color accuracy, crown guard width.

Day-Date (228238, 228235) — day disc print quality, president bracelet center links, stone setting quality.

Click any model to see the full identification checklist with photos and specifications. Always consult a certified professional for definitive authentication.`
      },
      {
        heading: "Rolex Market Data Page",
        body: `The Rolex Market Data page tracks current secondary market values for the most actively traded references. Data is compiled from major secondary market platforms and updated regularly.

For each reference you will see the current asking price range, historical price trend, and notes on market conditions. References currently commanding premiums above retail list price are highlighted.

You can ask Simplicity about any specific reference and she will give you an analysis of its current market position, investment history, and key identification details.`
      }
    ]
  },
  {
    id: "simplicity",
    number: 6,
    title: "Simplicity — Your AI Assistant",
    icon: MessageSquare,
    color: "from-violet-600 to-purple-700",
    sections: [
      {
        heading: "Who is Simplicity?",
        body: `Simplicity is the AI assistant built into Simpleton Vision™. She is not a general-purpose chatbot — she is a domain specialist with deep knowledge of precious metals, diamonds, watches, coins, and market intelligence. She also has real-time access to live spot prices, Rapaport diamond data, and coin melt values, so her answers are based on current market conditions, not training data.

Simplicity learns from every conversation. If you tell her your name, what you collect, or how you work, she will remember it in future sessions and use that context to give you more relevant, personalized responses.`
      },
      {
        heading: "Accessing Simplicity",
        body: `There are two ways to access Simplicity:

The Floating Button — on every page of the platform, a floating button in the lower right corner opens a slide-in chat panel. Use this for quick questions without leaving your current page.

The Full Chat Page — navigate to Intelligence in the navigation bar and click Simplicity Chat. This opens the full conversation interface with your complete message history, formatted responses, and quick-start prompts.`
      },
      {
        heading: "What to Ask Simplicity",
        body: `Simplicity can answer virtually any question in her specialty areas. Here are examples of what she does well:

Melt value calculations — "What is the melt value of a 14K gold bracelet weighing 22 grams at today's spot price?"

Diamond evaluation — "I have a 1.2 carat G color VS2 clarity round diamond. What is its approximate wholesale and retail value?"

Coin identification — "I found a coin marked 'Liberty 1921' on one side and an eagle on the other. What is it and what is it worth?"

Rolex reference lookup — "I am looking at a Submariner reference 116610LN with serial number Z123456. Does this serial date match this reference?"

Market guidance — "Should I be buying gold or silver right now given current conditions?"

Instructions — "Walk me through how to use the diamond calculator step by step."

She can also help with topics outside the specialty areas — history, science, business, and more — but her deepest expertise is in precious metals and luxury goods.`
      },
      {
        heading: "Simplicity Memory",
        body: `Simplicity builds a memory profile of each registered user over time. She captures facts you share — the type of jewelry you deal in, your clients' common requests, your preferred calculation units, your inventory, and your goals.

In future sessions she will use this memory to give you faster, more relevant answers. You do not need to re-explain your context every time you log in.

To view or manage what Simplicity remembers about you, go to Account Settings and click the Simplicity Memory tab. You can delete individual memories or clear all memories at any time.`
      },
      {
        heading: "Lesson Mode",
        body: `You can ask Simplicity to teach you how to use any feature on the platform. Just ask directly:

"Teach me how to use the precious metals calculator."
"Give me a lesson on diamond grading."
"Walk me through authenticating a Rolex step by step."
"Explain how to read the RAP GRID."

She will give you a structured, step-by-step lesson customized to your knowledge level. If you are a beginner, she will start from fundamentals. If she knows you are a professional, she will go deeper.`
      }
    ]
  },
  {
    id: "vision",
    number: 7,
    title: "Simpleton Vision — Advanced AI",
    icon: Eye,
    color: "from-indigo-600 to-blue-700",
    sections: [
      {
        heading: "What is Simpleton Vision?",
        body: `Simpleton Vision is the advanced AI interface on the platform, accessible from Intelligence in the navigation bar. It offers the same Simplicity intelligence as the standard chat but adds one powerful capability: image analysis.

You can upload a photo of any piece of jewelry, coin, or watch and Simplicity will analyze it directly — identifying the item, assessing visible quality markers, noting observations, and providing preliminary value estimates. All AI assessments are for informational purposes only — professional authentication is recommended for all transactions.`
      },
      {
        heading: "Image Upload and Analysis",
        body: `To analyze an image:

Step 1 — Navigate to Simpleton Vision from the Intelligence menu.

Step 2 — Click the image icon (camera symbol) below the chat input, or drag and drop an image file into the chat area.

Step 3 — Optionally add a message describing what you want to know. For example: "What can you tell me about this Rolex?" or "What karat is this chain and what is it worth?"

Step 4 — Click Send. Simplicity will analyze the image and respond with her assessment.

Supported file types: JPG, PNG, WebP. Maximum file size: 10MB. For best results, photograph items against a plain white or neutral background in good lighting.`
      },
      {
        heading: "Best Uses for Image Analysis",
        body: `Jewelry identification — upload a photo of an unmarked piece and Simplicity will attempt to identify the metal type, style period, and maker's marks if visible.

Coin attribution — photos of coins can often be attributed to a specific series, date range, and grade estimate.

Rolex pre-screening — upload a photo for a quick visual check and preliminary observations before consulting a professional.

Hallmark reading — photographs of hallmarks and maker's stamps can be identified and interpreted.

Note: AI image analysis provides a preliminary assessment and should not replace physical examination by a qualified appraiser for high-value transactions.`
      }
    ]
  },
  {
    id: "portfolio",
    number: 8,
    title: "Portfolio Manager",
    icon: Briefcase,
    color: "from-teal-600 to-cyan-700",
    sections: [
      {
        heading: "Building Your Portfolio",
        body: `The Portfolio Manager (available under your account when logged in) lets you track the current value of your precious metals, coin, and gem holdings. As spot prices change, your portfolio value updates automatically.

To add an item:

Step 1 — Navigate to Portfolio from the top navigation.
Step 2 — Click Add Item.
Step 3 — Select the item type: Gold, Silver, Platinum, Palladium, Coin, Diamond, or Other.
Step 4 — Enter the details: description, quantity, weight, purity, and your acquisition cost.
Step 5 — Save. The item appears in your portfolio with its current melt or market value.`
      },
      {
        heading: "Tracking Performance",
        body: `The portfolio dashboard shows:

Total Portfolio Value — current market/melt value of all holdings.

Total Cost Basis — what you paid for your holdings.

Unrealized Gain/Loss — the difference between current value and cost basis, shown in dollars and as a percentage.

Individual Item Performance — each item shows its current value versus purchase price.

As spot prices move throughout the day, your portfolio value updates in real time.`
      },
      {
        heading: "Portfolio Tips",
        body: `Ask Simplicity for portfolio analysis at any time. She can review your holdings and provide commentary on concentration, diversification, and current market conditions relative to your positions.

You can also ask her to calculate the rebalancing needed to achieve a target allocation — for example, "I want 60% gold, 30% silver, and 10% platinum. Given my current holdings, what do I need to buy or sell?"`
      }
    ]
  },
  {
    id: "tickers",
    number: 9,
    title: "Market Intelligence Tickers",
    icon: BarChart2,
    color: "from-rose-600 to-pink-700",
    sections: [
      {
        heading: "Quantum Ticker — Metals & Diamonds",
        body: `The Quantum Ticker page provides live pricing for all four precious metals — gold, silver, platinum, and palladium — plus diamond pricing across multiple weight categories and quality grades.

Prices are aggregated from multiple sources and updated continuously. Each price shows the current value, 24-hour change in dollars, and 24-hour change as a percentage.

Use this page when you need a comprehensive, multi-source price check before executing a buy or sell.`
      },
      {
        heading: "Quantum Ticker 2056 — Stocks & Crypto",
        body: `The Quantum Ticker 2056 page tracks broader financial markets alongside precious metals — including major stock indices, individual equities, and cryptocurrency prices.

This is useful for understanding the macroeconomic context for metals prices. Gold and silver often move inversely to equity markets and the US dollar.`
      },
      {
        heading: "Quantum Ticker 2057 — AI Companies",
        body: `The Quantum Ticker 2057 page tracks AI company valuations and market intelligence specific to the technology sector. This is relevant for understanding the broader investment landscape and how capital flows between technology and hard assets.`
      },
      {
        heading: "Reading Price Changes",
        body: `On all ticker pages, color coding is consistent: green numbers indicate a price increase from the previous close; red numbers indicate a decrease. The percentage change shown is the 24-hour change.

For precious metals, pay attention to the relationship between gold and silver (the gold-silver ratio). Historically this ratio averages 60 to 80:1. When it is significantly above or below that range, it may indicate a buying opportunity in one of the metals. Ask Simplicity to analyze the current ratio for you.`
      }
    ]
  },
  {
    id: "gmail",
    number: 10,
    title: "Simplicity Mail Organizer",
    icon: Mail,
    color: "from-red-600 to-orange-600",
    sections: [
      {
        heading: "What the Simplicity Mail Organizer Does",
        body: `The Simplicity Mail Organizer connects your Google Gmail account to Simpleton Vision™ and uses Simplicity to automatically analyze, categorize, summarize, and prioritize your emails.

This is designed for professionals who receive high volumes of email — dealers, jewelers, and investors who need to quickly identify the emails that matter most.`
      },
      {
        heading: "Connecting Your Gmail Account",
        body: `Step 1 — Navigate to Simplicity Mail Organizer from the navigation bar.

Step 2 — Click Connect Gmail Account. You will be redirected to Google's authorization page.

Step 3 — Select the Google account you want to connect. Review the permissions (read-only access to read and label emails is requested).

Step 4 — Click Allow. You will be redirected back to <span className="simpleton-brand">Simpleton</span> Vision™ with your Gmail now connected.

If you encounter an error, click "Having trouble? Show setup instructions" for a step-by-step guide to configuring your Google OAuth credentials.`
      },
      {
        heading: "Using the Organizer",
        body: `Once connected, your inbox appears in the Simplicity Mail Organizer. For each email you can:

Analyze with Simplicity — click the Simplicity button on any email. Simplicity reads the email and returns a summary, a category (Finance, Work, Personal, Shopping, etc.), a priority level (High, Medium, Low), the overall sentiment, and a suggested action.

Apply labels — add or remove Gmail labels directly from the organizer interface without leaving the platform.

Archive — archive emails that have been reviewed.

The organizer reads your most recent emails from the label you select (Inbox, Sent, Spam, etc.) from the left panel.`
      }
    ]
  },
  {
    id: "appraisal",
    number: 11,
    title: "Jewelry Appraisal",
    icon: Star,
    color: "from-pink-600 to-rose-700",
    sections: [
      {
        heading: "AI-Powered Jewelry Appraisal",
        body: `The Jewelry Appraisal page provides an AI-driven preliminary appraisal service. Upload photos of a piece and provide details about the item, and Simplicity will generate an estimated value range based on visible characteristics, metal content, stone quality, and current market conditions.

This is intended as a preliminary assessment tool. For insurance appraisals, estate appraisals, or high-value transactions, a certified appraiser with physical examination is always recommended.`
      },
      {
        heading: "How to Get an Appraisal",
        body: `Step 1 — Navigate to Jewelry Appraisal from the navigation bar.

Step 2 — Upload clear photographs of the piece. Include: top view, side view, any hallmarks or stamps, and any stones. Good photography significantly improves accuracy.

Step 3 — Fill out the item details: metal type if known, approximate weight if known, any stones, brand or maker if identifiable, and condition.

Step 4 — Submit. Simplicity will analyze the images and details and return an estimated value range with her reasoning.

Step 5 — Review the assessment. You can ask Simplicity follow-up questions about any aspect of the appraisal directly in the chat.`
      }
    ]
  },
  {
    id: "education",
    number: 12,
    title: "Simpleducation Center & Resources",
    icon: GraduationCap,
    color: "from-blue-600 to-indigo-700",
    sections: [
      {
        heading: "The Simpleducation Center",
        body: `The Simpleducation Center (accessible from the navigation bar) contains a growing library of articles covering precious metals investing, diamond buying, coin collecting, Rolex authentication, and jewelry evaluation.

Articles are written for a range of knowledge levels. Beginner articles explain foundational concepts. Advanced articles cover topics like LBMA good delivery standards, Rapaport pricing mechanics, and numismatic grading methodology.`
      },
      {
        heading: "Asking Simplicity to Teach You",
        body: `The most efficient way to learn on the platform is simply to ask Simplicity. She can tailor a lesson to exactly your knowledge level and the specific topic you want to understand. Some prompts to try:

"Explain the gold-silver ratio and how investors use it."
"Teach me how to grade a diamond by eye."
"What should I know before buying my first silver bullion?"
"How do I detect a fake Rolex submariner?"
"What is Rapaport pricing and how do dealers use it?"
"Explain the Sheldon coin grading scale."

After each explanation, you can ask follow-up questions to go deeper on any point.`
      },
      {
        heading: "Exporting Your Data",
        body: `The Export Center (available under your account) lets you download your calculation history, portfolio data, and conversation history in CSV or PDF format. This is useful for record-keeping, tax preparation, and sharing data with partners or clients.`
      }
    ]
  }
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function UserGuide() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const chapter = CHAPTERS[activeChapter];
  const ChapterIcon = chapter.icon;

  const handlePrint = () => {
    window.print();
  };

  const goNext = () => { if (activeChapter < CHAPTERS.length - 1) setActiveChapter(activeChapter + 1); };
  const goPrev = () => { if (activeChapter > 0) setActiveChapter(activeChapter - 1); };

  return (
    <>
      {/* ── Print CSS ───────────────────────────────────────────────── */}
      <style>{`
        .print-book { display: none; }

        @media print {
          .interactive-ui { display: none !important; }
          .print-book { display: block !important; }
          body { background: white !important; color: #111 !important; font-family: Georgia, serif; }
          * { box-shadow: none !important; }
          @page { margin: 2.2cm 2.5cm; size: A4; }

          .print-cover { text-align: center; padding: 80px 0 60px; border-bottom: 3px solid #b8972a; margin-bottom: 40px; page-break-after: always; }
          .print-cover h1 { font-size: 36px; font-weight: bold; color: #111; margin-bottom: 12px; }
          .print-cover .subtitle { font-size: 16px; color: #555; margin-bottom: 8px; }
          .print-cover .author { font-size: 14px; color: #777; margin-top: 24px; }
          .print-cover .year { font-size: 13px; color: #999; margin-top: 6px; }

          .print-toc { page-break-after: always; padding-bottom: 40px; }
          .print-toc h2 { font-size: 22px; border-bottom: 2px solid #b8972a; padding-bottom: 8px; margin-bottom: 20px; }
          .print-toc ol { list-style: none; padding: 0; }
          .print-toc li { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dotted #ccc; font-size: 13px; }
          .print-toc li strong { color: #111; }
          .print-toc li span { color: #888; }

          .print-chapter { page-break-before: always; }
          .print-chapter-header { border-left: 5px solid #b8972a; padding: 14px 20px; background: #fafaf7; margin-bottom: 28px; }
          .print-chapter-header .ch-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #b8972a; font-weight: bold; margin-bottom: 4px; }
          .print-chapter-header h2 { font-size: 24px; color: #111; margin: 0; }

          .print-section { margin-bottom: 28px; }
          .print-section h3 { font-size: 15px; font-weight: bold; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
          .print-section p { font-size: 13px; color: #333; line-height: 1.75; margin-bottom: 12px; }

          .print-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #aaa; padding: 8px; border-top: 1px solid #eee; }
        }
      `}</style>

      {/* ── Full-book hidden div — renders during print only ─────────── */}
      <div className="print-book">
        {/* Cover Page */}
        <div className="print-cover">
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b8972a', marginBottom: 20 }}>Official Reference Manual</div>
          <h1><span className="simpleton-brand">Simpleton</span> Vision™</h1>
          <div className="subtitle">Complete User Guide</div>
          <div className="subtitle">Precious Metals · Diamonds · Rolex · Coins · AI Intelligence</div>
          <div className="author">Created by Demiris Brown</div>
          <div className="year">© {new Date().getFullYear()} Simpleton Vision™ · simpletonapp.com</div>
        </div>

        {/* Table of Contents */}
        <div className="print-toc">
          <h2>Table of Contents</h2>
          <ol>
            {CHAPTERS.map((ch, idx) => (
              <li key={ch.id}>
                <strong>{idx === 0 ? "Introduction" : `Chapter ${ch.number}`} — {ch.title}</strong>
                <span>{ch.sections.length} section{ch.sections.length !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* All Chapters */}
        {CHAPTERS.map((ch, idx) => (
          <div key={ch.id} className="print-chapter">
            <div className="print-chapter-header">
              <div className="ch-label">{idx === 0 ? "Introduction" : `Chapter ${ch.number}`}</div>
              <h2>{ch.title}</h2>
            </div>
            {ch.sections.map((section, sidx) => (
              <div key={sidx} className="print-section">
                <h3>{section.heading}</h3>
                {section.body.split("\n\n").map((para, pidx) => (
                  <p key={pidx}>{para}</p>
                ))}
              </div>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div className="print-footer">
          Simpleton Vision™ User Guide · simpletonapp.com · Powered by Simplicity
        </div>
      </div>

      <div className="interactive-ui min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navigation />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="pt-20 pb-6 px-4 border-b border-slate-700/40 no-print">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Simpleton Vision™ User Guide</h1>
                <p className="text-slate-400 text-sm">Complete platform reference — {CHAPTERS.length} chapters</p>
              </div>
            </div>
            <div className="flex items-center gap-3 no-print">
              <Button
                onClick={handlePrint}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-semibold gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6 relative">

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className={`
            no-print w-64 shrink-0 sticky top-24 self-start
            hidden lg:block
          `}>
            <nav className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-3 space-y-1">
              <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold px-2 pb-2">Chapters</p>
              {CHAPTERS.map((ch, idx) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(idx)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all ${
                      activeChapter === idx
                        ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="leading-tight">{ch.title}</span>
                    {activeChapter === idx && <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-yellow-400" />}
                  </button>
                );
              })}
            </nav>

            {/* Quick Lesson CTA */}
            <div className="mt-4 bg-violet-900/30 border border-violet-500/25 rounded-2xl p-4">
              <p className="text-violet-300 font-semibold text-sm mb-1">Want a live lesson?</p>
              <p className="text-slate-400 text-xs mb-3">Ask Simplicity to walk you through any chapter interactively.</p>
              <Link href="/ai-chat">
                <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Simplicity Chat
                </Button>
              </Link>
            </div>
          </aside>

          {/* ── Mobile sidebar toggle ─────────────────────────────────── */}
          <button
            className="lg:hidden no-print fixed bottom-6 left-6 z-50 bg-slate-800 border border-slate-600 text-white rounded-full p-3 shadow-xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {sidebarOpen && (
            <div className="lg:hidden no-print fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-700/50 p-4 pt-20 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold px-2 pb-2">Chapters</p>
                {CHAPTERS.map((ch, idx) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { setActiveChapter(idx); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-all mb-1 ${
                        activeChapter === idx
                          ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{ch.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Main Content ─────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 print-content" ref={printRef}>

            {/* Chapter Header */}
            <div className={`bg-gradient-to-r ${chapter.color} rounded-2xl p-6 mb-6 print-visible`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <ChapterIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
                  {chapter.number === 0 ? "Introduction" : `Chapter ${chapter.number}`}
                </span>
              </div>
              <h2 className="text-white font-bold text-2xl md:text-3xl">{chapter.title}</h2>
              <p className="text-white/60 text-sm mt-1">{chapter.sections.length} section{chapter.sections.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Sections */}
            <div className="space-y-6 chapter-body">
              {chapter.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-6"
                >
                  <h3 className="chapter-heading text-white font-semibold text-lg mb-4 pb-3 border-b border-slate-600/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    {section.heading}
                  </h3>
                  <div className="space-y-3">
                    {section.body.split("\n\n").map((para, pidx) => (
                      <p key={pidx} className="text-slate-300 leading-relaxed text-[15px]">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Ask Simplicity CTA */}
            <div className="no-print mt-6 bg-violet-900/20 border border-violet-500/20 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-violet-300 font-semibold text-sm">Get a live lesson on this chapter</p>
                <p className="text-slate-400 text-xs mt-0.5">Ask Simplicity to walk you through {chapter.title} interactively.</p>
              </div>
              <Link href={`/ai-chat?lesson=${encodeURIComponent(chapter.title)}`}>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5 shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Start Lesson
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Navigation Buttons */}
            <div className="no-print mt-6 flex justify-between items-center gap-4">
              <Button
                onClick={goPrev}
                disabled={activeChapter === 0}
                variant="ghost"
                className="text-slate-300 hover:text-white border border-slate-600/40 hover:border-slate-500 disabled:opacity-30 gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {activeChapter > 0 ? CHAPTERS[activeChapter - 1].title : "Previous"}
              </Button>

              <span className="text-slate-500 text-sm">
                {activeChapter + 1} of {CHAPTERS.length}
              </span>

              <Button
                onClick={goNext}
                disabled={activeChapter === CHAPTERS.length - 1}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/25 hover:border-yellow-400/40 disabled:opacity-30 gap-2"
              >
                {activeChapter < CHAPTERS.length - 1 ? CHAPTERS[activeChapter + 1].title : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
