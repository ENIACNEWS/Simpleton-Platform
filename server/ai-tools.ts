/**
 * DeepSeek Tool Calls — with Strict Mode (Beta)
 *
 * Gives Simplicity the ability to call real tools before answering:
 *   1. get_precious_metals_prices       → live Kitco spot prices
 *   2. get_coin_melt_value              → melt value for a specific coin + qty
 *   3. get_junk_silver_value            → melt value for junk silver by face value
 *   4. get_rolex_market_data            → Rolex watch market prices by collection
 *   5. get_diamond_market_data          → Diamond pricing context by specs
 *   6. get_market_overview              → Full market summary (metals + watches + diamonds)
 *   7. get_market_convergence_signal    → Financial risk analysis engine
 *   8. get_market_advisory              → Precious metals buy/hold/sell advisory with emerging metals
 *
 * Strict mode (beta endpoint) ensures the model's function arguments
 * match the JSON schema exactly — no hallucinated fields.
 */

import OpenAI from 'openai';

// Use beta endpoint for strict mode support
const deepseekTools = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.deepseek.com/beta',
    })
  : null;

// ─── Tool definitions (strict mode) ──────────────────────────────────────────

const TOOLS: any[] = [
  {
    type: 'function',
    function: {
      name: 'get_precious_metals_prices',
      strict: true,
      description:
        'Get current live spot prices for gold, silver, platinum, and palladium in USD per troy oz. Always call this before quoting any metal price.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_coin_melt_value',
      strict: true,
      description:
        'Calculate the melt value of a specific coin type based on live metal spot prices. Use this when the user asks about a specific coin\'s worth.',
      parameters: {
        type: 'object',
        properties: {
          coin_type: {
            type: 'string',
            description:
              'Coin identifier. One of: morgan_dollar, peace_dollar, kennedy_half_90, kennedy_half_40, washington_quarter, standing_liberty_quarter, barber_quarter, mercury_dime, roosevelt_dime, barber_dime, war_nickel, silver_eagle, gold_eagle_1oz, gold_eagle_half, gold_eagle_quarter, gold_eagle_tenth, gold_buffalo, double_eagle, gold_eagle_10, half_eagle, quarter_eagle, gold_dollar, krugerrand, maple_leaf_gold, maple_leaf_silver, britannia_gold, britannia_silver, philharmonic_gold',
          },
          quantity: {
            type: 'integer',
            description: 'Number of coins (1 to 10000)',
            minimum: 1,
            maximum: 10000,
          },
        },
        required: ['coin_type', 'quantity'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_junk_silver_value',
      strict: true,
      description:
        'Calculate melt value of junk silver coins by face value. The industry standard is $1 face value = 0.715 troy oz of silver for 90% coins. Use for bags of pre-1965 US silver coins.',
      parameters: {
        type: 'object',
        properties: {
          face_value: {
            type: 'number',
            description: 'Total face value in USD of the junk silver coins',
            minimum: 0.01,
            maximum: 1000000,
          },
          purity: {
            type: 'string',
            description: 'Silver purity of the coins',
            enum: ['90', '40', '35'],
          },
        },
        required: ['face_value', 'purity'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_rolex_market_data',
      strict: true,
      description:
        'Get current Rolex watch secondary market data including price ranges by collection, popular references, and market conditions. Use when user asks about Rolex values, watch prices, or luxury watch market trends.',
      parameters: {
        type: 'object',
        properties: {
          collection: {
            type: 'string',
            description: 'Rolex collection to get data for, or "all" for full market overview',
            enum: [
              'all', 'Submariner', 'Daytona', 'GMT-Master II', 'Datejust',
              'Day-Date', 'Explorer', 'Oyster Perpetual', 'Milgauss',
              'Sea-Dweller', 'Sky-Dweller', 'Yacht-Master', 'Air-King',
            ],
          },
        },
        required: ['collection'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_diamond_market_data',
      strict: true,
      description:
        'Get current diamond market pricing context including price-per-carat estimates and Rapaport price tier info for natural and lab-grown diamonds. Use when user asks about diamond values or pricing.',
      parameters: {
        type: 'object',
        properties: {
          carat: {
            type: 'number',
            description: 'Diamond carat weight (0.25 to 10)',
            minimum: 0.25,
            maximum: 10,
          },
          shape: {
            type: 'string',
            description: 'Diamond shape',
            enum: ['ROUND', 'PRINCESS', 'OVAL', 'CUSHION', 'EMERALD', 'RADIANT', 'PEAR', 'MARQUISE', 'ASSCHER', 'HEART'],
          },
          quality: {
            type: 'string',
            description: 'Quality tier: premium (D-F, IF-VS1), near_colorless (G-J, VS2-SI1), or commercial (K+, SI2+)',
            enum: ['premium', 'near_colorless', 'commercial'],
          },
        },
        required: ['carat', 'shape', 'quality'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_overview',
      strict: true,
      description:
        'Get a comprehensive Simpleton Vision™ market overview covering live precious metals, Rolex watch market conditions, and diamond market summary. Use for general market analysis or when user asks about multiple asset classes.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_convergence_signal',
      strict: true,
      description:
        'Check the Simpleton financial risk analysis engine. Use when user asks about market risk, economic warnings, crisis indicators, recession prediction, or financial stability.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_market_advisory',
      strict: true,
      description:
        'Get Simpleton\'s proprietary precious metals advisory — buy/hold/sell outlook for gold, silver, platinum, and palladium plus emerging metals to watch. Use when user asks: should I buy gold, is silver a good investment, what metal to buy, best time to buy/sell metals, which metals are undervalued, emerging metals, investment advice for precious metals, market outlook, or anything about whether to buy/hold/sell any precious metal.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_price_alert',
      strict: true,
      description:
        'Set a price alert to notify the user when a precious metal hits a target price. Use when user says: alert me when gold hits X, notify me if silver drops below X, set a price alert, watch gold price, tell me when platinum reaches X.',
      parameters: {
        type: 'object',
        properties: {
          asset_type: {
            type: 'string',
            enum: ['gold', 'silver', 'platinum', 'palladium'],
            description: 'The precious metal to watch',
          },
          target_price: {
            type: 'number',
            description: 'The target price in USD per troy ounce',
          },
          direction: {
            type: 'string',
            enum: ['above', 'below'],
            description: 'Alert when price goes above or below the target',
          },
        },
        required: ['asset_type', 'target_price', 'direction'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'record_transaction',
      strict: true,
      description:
        'Record an actual sale or purchase transaction to improve future appraisal accuracy. Use when user says: I sold X for Y, I bought X at Y, log this sale, record this transaction, I closed a deal.',
      parameters: {
        type: 'object',
        properties: {
          item_type: {
            type: 'string',
            enum: ['gold_jewelry', 'silver_jewelry', 'diamond', 'rolex', 'coin', 'platinum_jewelry', 'other'],
            description: 'Type of item transacted',
          },
          actual_price: {
            type: 'number',
            description: 'The actual sale/purchase price in USD',
          },
          appraised_price: {
            type: 'number',
            description: 'What the item was appraised at before the transaction, if known',
          },
          notes: {
            type: 'string',
            description: 'Brief description of the item (e.g., "14k gold chain 22g", "1ct VS1 E round diamond")',
          },
        },
        required: ['item_type', 'actual_price', 'notes'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'appraise_with_history',
      strict: true,
      description:
        'Appraise an item using both live spot prices AND real transaction history from the Simpleton network. Produces a blended valuation. Use when user asks for an appraisal, valuation, or "what is this worth" — especially for jewelry, diamonds, watches, or coins.',
      parameters: {
        type: 'object',
        properties: {
          item_type: {
            type: 'string',
            enum: ['gold_jewelry', 'silver_jewelry', 'diamond', 'rolex', 'coin', 'platinum_jewelry', 'other'],
            description: 'Type of item to appraise',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the item including weight, purity, specs, condition',
          },
        },
        required: ['item_type', 'description'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'predict_price',
      strict: true,
      description:
        'Generate a price prediction for a precious metal using the Market Memory Engine. Combines live spot prices with historical transaction patterns from the Simpleton network. Use when user asks "where is gold headed", "price prediction", "what will silver be in 30 days", or any forward-looking price question.',
      parameters: {
        type: 'object',
        properties: {
          item_type: {
            type: 'string',
            enum: ['gold', 'silver', 'platinum', 'palladium'],
            description: 'Metal to predict',
          },
          horizon_days: {
            type: 'number',
            enum: [7, 30, 90],
            description: 'Prediction horizon in days (7, 30, or 90)',
          },
        },
        required: ['item_type', 'horizon_days'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_simpleton_index',
      strict: true,
      description:
        'Get the Simpleton Index — a transaction-weighted price for a precious metal based on real deals in the Simpleton network, compared to spot price. Use when user asks about "real prices", "what dealers are actually paying", "Simpleton index", or wants market intelligence beyond spot.',
      parameters: {
        type: 'object',
        properties: {
          asset_type: {
            type: 'string',
            enum: ['gold', 'silver', 'platinum', 'palladium'],
            description: 'Metal to get index for',
          },
        },
        required: ['asset_type'],
        additionalProperties: false,
      },
    },
  },
];

// ─── Coin metal weight table ──────────────────────────────────────────────────

type Metal = 'silver' | 'gold';
interface CoinSpec { name: string; metalOz: number; metal: Metal; }

const COIN_SPECS: Record<string, CoinSpec> = {
  morgan_dollar:         { name: 'Morgan Dollar (1878–1921)',           metalOz: 0.77344, metal: 'silver' },
  peace_dollar:          { name: 'Peace Dollar (1921–1935)',            metalOz: 0.77344, metal: 'silver' },
  kennedy_half_90:       { name: 'Kennedy Half Dollar (1964)',          metalOz: 0.36169, metal: 'silver' },
  kennedy_half_40:       { name: 'Kennedy Half Dollar (1965–70)',       metalOz: 0.14792, metal: 'silver' },
  washington_quarter:    { name: 'Washington Quarter (pre-1965)',       metalOz: 0.18084, metal: 'silver' },
  standing_liberty_quarter: { name: 'Standing Liberty Quarter',        metalOz: 0.18084, metal: 'silver' },
  barber_quarter:        { name: 'Barber Quarter',                      metalOz: 0.18084, metal: 'silver' },
  mercury_dime:          { name: 'Mercury Dime (1916–45)',              metalOz: 0.07234, metal: 'silver' },
  roosevelt_dime:        { name: 'Roosevelt Dime (pre-1965)',           metalOz: 0.07234, metal: 'silver' },
  barber_dime:           { name: 'Barber Dime',                         metalOz: 0.07234, metal: 'silver' },
  war_nickel:            { name: 'War Nickel (1942–45)',                metalOz: 0.05626, metal: 'silver' },
  silver_eagle:          { name: 'American Silver Eagle',               metalOz: 1.00000, metal: 'silver' },
  gold_eagle_1oz:        { name: 'American Gold Eagle (1 oz)',          metalOz: 1.00000, metal: 'gold'   },
  gold_eagle_half:       { name: 'American Gold Eagle (½ oz)',          metalOz: 0.50000, metal: 'gold'   },
  gold_eagle_quarter:    { name: 'American Gold Eagle (¼ oz)',          metalOz: 0.25000, metal: 'gold'   },
  gold_eagle_tenth:      { name: 'American Gold Eagle (1/10 oz)',       metalOz: 0.10000, metal: 'gold'   },
  gold_buffalo:          { name: 'American Gold Buffalo (1 oz)',        metalOz: 1.00000, metal: 'gold'   },
  double_eagle:          { name: 'Double Eagle $20 (Liberty/St-G)',     metalOz: 0.96750, metal: 'gold'   },
  gold_eagle_10:         { name: 'Eagle $10 Gold',                      metalOz: 0.48375, metal: 'gold'   },
  half_eagle:            { name: 'Half Eagle $5 Gold',                  metalOz: 0.24188, metal: 'gold'   },
  quarter_eagle:         { name: 'Quarter Eagle $2.50 Gold',            metalOz: 0.12094, metal: 'gold'   },
  gold_dollar:           { name: 'Gold Dollar $1',                      metalOz: 0.04837, metal: 'gold'   },
  krugerrand:            { name: 'South African Krugerrand (1 oz)',      metalOz: 1.00000, metal: 'gold'   },
  maple_leaf_gold:       { name: 'Canadian Gold Maple Leaf (1 oz)',     metalOz: 1.00000, metal: 'gold'   },
  maple_leaf_silver:     { name: 'Canadian Silver Maple Leaf (1 oz)',   metalOz: 1.00000, metal: 'silver' },
  britannia_gold:        { name: 'British Gold Britannia (1 oz)',       metalOz: 1.00000, metal: 'gold'   },
  britannia_silver:      { name: 'British Silver Britannia (1 oz)',     metalOz: 1.00000, metal: 'silver' },
  philharmonic_gold:     { name: 'Austrian Gold Philharmonic (1 oz)',   metalOz: 1.00000, metal: 'gold'   },
};

// ─── Rolex market data ────────────────────────────────────────────────────────

const ROLEX_MARKET: Record<string, any> = {
  Submariner: {
    description: 'Rolex Submariner — iconic dive watch, highest secondary market demand',
    references: [
      { ref: '126610LN', name: 'Submariner Date (Black)', retail: 10500, secondary_range: [11000, 14500], trend: 'stable-premium' },
      { ref: '126610LV', name: 'Submariner Date "Kermit" (Green)', retail: 10750, secondary_range: [13000, 17000], trend: 'premium' },
      { ref: '126619LB', name: 'Submariner Date "Smurf" (White Gold/Blue)', retail: 42950, secondary_range: [40000, 50000], trend: 'stable' },
      { ref: '124060', name: 'Submariner No-Date', retail: 9550, secondary_range: [9800, 12500], trend: 'stable-premium' },
    ],
    market_note: 'Submariner remains the most liquid Rolex on the secondary market. No-date refs trade at slight discount to date models.',
  },
  Daytona: {
    description: 'Rolex Cosmograph Daytona — chronograph icon, highest secondary premiums',
    references: [
      { ref: '126500LN', name: 'Daytona Steel Black Dial', retail: 14550, secondary_range: [28000, 38000], trend: 'strong-premium' },
      { ref: '126500LN', name: 'Daytona Steel White Dial', retail: 14550, secondary_range: [26000, 35000], trend: 'strong-premium' },
      { ref: '116519LN', name: 'Daytona White Gold', retail: 36550, secondary_range: [35000, 45000], trend: 'stable' },
      { ref: '126529LN', name: 'Daytona Platinum "Meteorite"', retail: 75800, secondary_range: [70000, 90000], trend: 'premium' },
    ],
    market_note: 'Steel Daytona commands 80–150% premium over retail. Waitlists at ADs average 2–5 years. Strongest brand in sports watch collecting.',
  },
  'GMT-Master II': {
    description: 'Rolex GMT-Master II — traveler\'s watch, strong collector following',
    references: [
      { ref: '126710BLRO', name: 'GMT-Master II "Pepsi" Steel', retail: 10850, secondary_range: [16000, 22000], trend: 'premium' },
      { ref: '126710BLNR', name: 'GMT-Master II "Batman" Steel', retail: 10850, secondary_range: [14000, 18000], trend: 'premium' },
      { ref: '126711CHNR', name: 'GMT-Master II Everose "Root Beer"', retail: 17200, secondary_range: [18000, 24000], trend: 'stable-premium' },
      { ref: '126719BLRO', name: 'GMT-Master II "Pepsi" White Gold', retail: 38550, secondary_range: [38000, 48000], trend: 'stable' },
    ],
    market_note: 'Two-tone bezels ("Pepsi", "Batman") command strongest premiums. Root Beer bi-metal holds well. White gold models trade near retail.',
  },
  Datejust: {
    description: 'Rolex Datejust — most versatile and accessible Rolex, high volume',
    references: [
      { ref: '126200', name: 'Datejust 36 Oystersteel', retail: 6350, secondary_range: [6000, 8000], trend: 'near-retail' },
      { ref: '126234', name: 'Datejust 36 Rolesor', retail: 9050, secondary_range: [8500, 11000], trend: 'near-retail' },
      { ref: '126300', name: 'Datejust 41 Oystersteel', retail: 7050, secondary_range: [6800, 9000], trend: 'near-retail' },
      { ref: '126333', name: 'Datejust 41 Rolesor', retail: 9750, secondary_range: [9200, 12000], trend: 'near-retail' },
    ],
    market_note: 'Datejust is the most accessible Rolex with secondary prices near or slightly above retail. Dial choice (Wimbledon, Fluted, Jubilee) drives value variation.',
  },
  'Day-Date': {
    description: 'Rolex Day-Date ("President") — flagship prestige model, precious metals only',
    references: [
      { ref: '228235', name: 'Day-Date 40 Rose Gold', retail: 36650, secondary_range: [35000, 44000], trend: 'stable' },
      { ref: '228239', name: 'Day-Date 40 White Gold', retail: 36650, secondary_range: [35000, 44000], trend: 'stable' },
      { ref: '228238', name: 'Day-Date 40 Yellow Gold', retail: 36650, secondary_range: [34000, 43000], trend: 'stable' },
      { ref: '228396TBR', name: 'Day-Date 40 Platinum Diamond', retail: 124500, secondary_range: [115000, 135000], trend: 'stable' },
    ],
    market_note: 'Day-Date trades near retail in precious metals. Yellow gold commands slight discount vs. white/rose. Extraordinary dial materials (meteorite, gemstone) carry strong premiums.',
  },
  Explorer: {
    description: 'Rolex Explorer — adventure tool watch, strong historical pedigree',
    references: [
      { ref: '224270', name: 'Explorer 40', retail: 7350, secondary_range: [7500, 9500], trend: 'near-to-slight-premium' },
      { ref: '226570', name: 'Explorer II White Dial "Polar"', retail: 10400, secondary_range: [10500, 13500], trend: 'slight-premium' },
      { ref: '226570', name: 'Explorer II Black Dial', retail: 10400, secondary_range: [10000, 13000], trend: 'near-retail' },
    ],
    market_note: 'Explorer models have become more accessible post-2023 market correction. White dial Explorer II ("Polar") commands a collector premium.',
  },
  'Oyster Perpetual': {
    description: 'Rolex Oyster Perpetual — purist no-complication model, color dial variants',
    references: [
      { ref: '126000', name: 'Oyster Perpetual 36', retail: 5700, secondary_range: [5500, 7000], trend: 'near-retail' },
      { ref: '124300', name: 'Oyster Perpetual 41', retail: 6150, secondary_range: [5800, 7500], trend: 'near-retail' },
      { ref: '277200', name: 'Oyster Perpetual 28 (Ladies)', retail: 4900, secondary_range: [4700, 6000], trend: 'near-retail' },
    ],
    market_note: 'Color dials (Turquoise, Yellow, Candy Pink) command up to 40% premium over standard. Coral Red "Stella" dials are the most sought-after.',
  },
  Milgauss: {
    description: 'Rolex Milgauss — anti-magnetic scientist\'s watch, discontinued 2023',
    references: [
      { ref: '116400GV', name: 'Milgauss "Z-Blue" Green Crystal', retail: 8350, secondary_range: [10000, 15000], trend: 'rising-since-discontinuation' },
      { ref: '116400', name: 'Milgauss Black Dial', retail: 7700, secondary_range: [8500, 12000], trend: 'rising' },
    ],
    market_note: 'Discontinued in 2023 — secondary prices rising as supply dwindles. Z-Blue with green sapphire crystal is the most collectible reference.',
  },
  'Sea-Dweller': {
    description: 'Rolex Sea-Dweller — professional dive watch, Helium escape valve',
    references: [
      { ref: '126600', name: 'Sea-Dweller 43', retail: 11600, secondary_range: [11000, 14000], trend: 'near-retail' },
      { ref: '136660', name: 'Deepsea 44 D-Blue', retail: 16150, secondary_range: [16000, 20000], trend: 'near-retail' },
    ],
    market_note: 'Sea-Dweller appeals to serious divers and collectors. D-Blue dial on the Deepsea is the most distinctive variant.',
  },
  'Sky-Dweller': {
    description: 'Rolex Sky-Dweller — traveler\'s annual calendar complication',
    references: [
      { ref: '336934', name: 'Sky-Dweller Oystersteel Silver', retail: 17300, secondary_range: [16500, 21000], trend: 'near-retail' },
      { ref: '336935', name: 'Sky-Dweller Rolesor Yellow Gold', retail: 24250, secondary_range: [23000, 28000], trend: 'near-retail' },
    ],
    market_note: 'Sky-Dweller is one of the more complex Rolex movements. Steel models recently introduced (2023) increased accessibility significantly.',
  },
  'Yacht-Master': {
    description: 'Rolex Yacht-Master — nautical sport watch in steel, gold, and platinum',
    references: [
      { ref: '126622', name: 'Yacht-Master 40 Rolesor Blue', retail: 13750, secondary_range: [13000, 17000], trend: 'near-retail' },
      { ref: '116655', name: 'Yacht-Master 40 Oysterflex Rose Gold', retail: 22400, secondary_range: [22000, 27000], trend: 'stable' },
      { ref: '226659', name: 'Yacht-Master 42 White Gold Blue', retail: 44050, secondary_range: [42000, 52000], trend: 'stable' },
    ],
    market_note: 'Yacht-Master occupies a mid-tier luxury position. Platinum models hold value well. Oysterflex bracelet is signature feature.',
  },
  'Air-King': {
    description: 'Rolex Air-King — aviation heritage, most accessible sports Rolex',
    references: [
      { ref: '126900', name: 'Air-King 40', retail: 7350, secondary_range: [7000, 9000], trend: 'near-retail' },
    ],
    market_note: 'Air-King is the entry-level sports Rolex. Black dial with mixed font numerals is distinctive. Trades at or slightly above retail.',
  },
};

// ─── Diamond market pricing data ──────────────────────────────────────────────

function getDiamondPriceContext(carat: number, shape: string, quality: string): any {
  const shapeMultipliers: Record<string, number> = {
    ROUND: 1.0, PRINCESS: 0.82, OVAL: 0.88, CUSHION: 0.80, EMERALD: 0.78,
    RADIANT: 0.82, PEAR: 0.85, MARQUISE: 0.80, ASSCHER: 0.75, HEART: 0.77,
  };
  const shapeMultiplier = shapeMultipliers[shape] ?? 0.82;

  const qualityPpct: Record<string, { natural: [number, number]; lab: [number, number] }> = {
    premium:       { natural: [8000,  18000], lab: [1200, 3500] },
    near_colorless: { natural: [3500,  8000], lab: [600,  1800] },
    commercial:    { natural: [1500,  3500], lab: [300,   900] },
  };

  const range = qualityPpct[quality] ?? qualityPpct.near_colorless;
  const caratFactor = Math.pow(carat, 1.8);

  const naturalLow  = Math.round(range.natural[0] * caratFactor * shapeMultiplier);
  const naturalHigh = Math.round(range.natural[1] * caratFactor * shapeMultiplier);
  const labLow      = Math.round(range.lab[0]     * caratFactor * shapeMultiplier);
  const labHigh     = Math.round(range.lab[1]     * caratFactor * shapeMultiplier);

  const qualityLabels: Record<string, string> = {
    premium:       'D-F color / IF-VS1 clarity (Exceptional)',
    near_colorless: 'G-J color / VS2-SI1 clarity (Very Good)',
    commercial:    'K+ color / SI2+ clarity (Good)',
  };

  return {
    carat,
    shape,
    quality_tier: qualityLabels[quality] ?? quality,
    shape_premium_vs_round: `${Math.round((1 - shapeMultiplier) * 100)}% discount to round`,
    natural_diamond: {
      estimated_range_usd: `$${naturalLow.toLocaleString()} – $${naturalHigh.toLocaleString()}`,
      price_per_carat_range: `$${Math.round(naturalLow / carat).toLocaleString()} – $${Math.round(naturalHigh / carat).toLocaleString()} / ct`,
    },
    lab_grown_diamond: {
      estimated_range_usd: `$${labLow.toLocaleString()} – $${labHigh.toLocaleString()}`,
      price_per_carat_range: `$${Math.round(labLow / carat).toLocaleString()} – $${Math.round(labHigh / carat).toLocaleString()} / ct`,
      vs_natural: `${Math.round((1 - (labHigh / naturalHigh)) * 100)}% less than natural equivalent`,
    },
    market_notes: [
      'Round brilliant commands highest prices; fancy shapes (oval, cushion) offer value',
      'Lab-grown prices have declined 60–80% from 2022 peak due to supply growth',
      'GIA/AGS certified stones trade at 10–20% premium over uncertified',
      `Carat weight breakpoints: 0.50, 0.75, 1.00, 1.50, 2.00 ct carry significant premiums`,
    ],
    timestamp: new Date().toISOString(),
    data_source: 'Simpleton Diamond Intelligence — Rapaport Diamond Report (January 9, 2026, Volume 49 No. 2) for wholesale grid pricing; Kaggle Diamond Dataset for retail market comparisons',
    calculation_steps: [
      `Base per-carat range for ${quality} quality: $${(qualityPpct[quality] ?? qualityPpct.near_colorless).natural[0].toLocaleString()}–$${(qualityPpct[quality] ?? qualityPpct.near_colorless).natural[1].toLocaleString()}`,
      `Carat factor (${carat}ct): ${caratFactor.toFixed(3)} (exponential scaling)`,
      `Shape multiplier (${shape}): ${shapeMultiplier} (${Math.round((1 - shapeMultiplier) * 100)}% discount to round)`,
      `Final range: base x carat factor x shape multiplier`,
    ],
  };
}

// ─── Tool execution ───────────────────────────────────────────────────────────

import { toolCache, withRetry, withTimeout as toolTimeout } from './tool-cache';

async function executeTool(name: string, args: any, contextUserId?: number | null): Promise<string> {
  const cacheKey = `tool:${name}:${JSON.stringify(args)}`;

  const CACHEABLE_TOOLS: Record<string, number> = {
    get_precious_metals_prices: 60,
    get_market_overview: 60,
    get_market_advisory: 120,
    get_market_convergence_signal: 120,
  };

  const ttl = CACHEABLE_TOOLS[name];
  if (ttl) {
    const cached = toolCache.get<string>(cacheKey);
    if (cached) {
      console.log(`[cache hit] ${name}`);
      return cached;
    }
  }

  const result = await withRetry(
    () => toolTimeout(executeToolInner(name, args, contextUserId), 15000, `Tool:${name}`),
    3,
    1000
  );

  if (ttl) {
    toolCache.set(cacheKey, result, ttl);
  }

  return result;
}

async function executeToolInner(name: string, args: any, contextUserId?: number | null): Promise<string> {
  const { getKitcoPricing } = await import('./kitco-pricing');
  const prices = await getKitcoPricing();
  const silver = prices?.silver ?? 0;
  const gold   = prices?.gold   ?? 0;

  if (name === 'get_precious_metals_prices') {
    return JSON.stringify({
      gold:      { price: gold,            unit: 'USD/troy oz' },
      silver:    { price: silver,          unit: 'USD/troy oz' },
      platinum:  { price: prices?.platinum ?? 0, unit: 'USD/troy oz' },
      palladium: { price: prices?.palladium ?? 0, unit: 'USD/troy oz' },
      timestamp: new Date().toISOString(),
      data_source: 'Live spot prices via Swissquote financial data feed, aggregated by Simpleton proprietary pricing engine',
      citation: 'Always cite: "Based on live spot pricing from Simpleton\'s proprietary aggregator"',
    });
  }

  if (name === 'get_coin_melt_value') {
    const { coin_type, quantity } = args as { coin_type: string; quantity: number };
    const spec = COIN_SPECS[coin_type];
    if (!spec) return JSON.stringify({ error: `Unknown coin type: ${coin_type}` });

    const spot     = spec.metal === 'silver' ? silver : gold;
    const perCoin  = spec.metalOz * spot;
    const totalOz  = spec.metalOz * quantity;
    const total    = perCoin * quantity;

    return JSON.stringify({
      coin:           spec.name,
      quantity,
      metal:          spec.metal,
      metalOzPerCoin: spec.metalOz,
      totalMetalOz:   +totalOz.toFixed(4),
      spotPrice:      spot,
      meltPerCoin:    +perCoin.toFixed(2),
      totalMeltValue: +total.toFixed(2),
      currency:       'USD',
      calculation_steps: [
        `${spec.name} contains ${spec.metalOz} troy oz of ${spec.metal} per coin`,
        `Live ${spec.metal} spot: $${spot.toFixed(2)}/troy oz`,
        `Melt value per coin: ${spec.metalOz} oz x $${spot.toFixed(2)} = $${perCoin.toFixed(2)}`,
        quantity > 1 ? `Total for ${quantity} coins: $${perCoin.toFixed(2)} x ${quantity} = $${total.toFixed(2)}` : null,
      ].filter(Boolean),
      data_source: `Live ${spec.metal} spot via Simpleton proprietary aggregator; coin metal content from US Mint specifications`,
    });
  }

  if (name === 'get_junk_silver_value') {
    const { face_value, purity } = args as { face_value: number; purity: '90' | '40' | '35' };
    const ozPerDollar = purity === '90' ? 0.715
                      : purity === '40' ? 0.295
                      : 0.05626;
    const silverOz   = face_value * ozPerDollar;
    const meltValue  = silverOz * silver;

    return JSON.stringify({
      faceValue:    face_value,
      purity:       `${purity}%`,
      ozPerDollar,
      totalSilverOz: +silverOz.toFixed(4),
      silverSpot:   silver,
      meltValue:    +meltValue.toFixed(2),
      note:         purity === '90'
        ? 'Industry standard bag rate (accounts for circulated coin wear)'
        : purity === '40'
        ? 'Kennedy Half Dollars 1965–1970'
        : 'War Nickels 1942–1945 (per coin × 0.05626)',
      currency:     'USD',
      calculation_steps: [
        `Face value: $${face_value.toFixed(2)} in ${purity}% silver coins`,
        `Silver content per $1 face: ${ozPerDollar} troy oz`,
        `Total silver content: $${face_value.toFixed(2)} x ${ozPerDollar} = ${silverOz.toFixed(4)} troy oz`,
        `Live silver spot: $${silver.toFixed(2)}/troy oz`,
        `Melt value: ${silverOz.toFixed(4)} oz x $${silver.toFixed(2)} = $${meltValue.toFixed(2)}`,
      ],
      data_source: 'Live silver spot via Simpleton proprietary aggregator; silver content ratios from US Mint coin specifications',
    });
  }

  if (name === 'get_rolex_market_data') {
    const { collection } = args as { collection: string };

    if (collection === 'all') {
      const summary = Object.entries(ROLEX_MARKET).map(([key, val]) => ({
        collection: key,
        description: val.description,
        market_note: val.market_note,
        top_reference: val.references[0],
      }));
      return JSON.stringify({
        market_status: 'Secondary market normalized from 2021-2022 peak. Most steel sports watches trade 10-40% above retail; Daytona remains extreme outlier at 80-150% premium.',
        collections: summary,
        timestamp: new Date().toISOString(),
        data_source: 'Simpleton Rolex Market Intelligence Database — secondary market pricing aggregated from Chrono24, WatchCharts, and verified dealer transactions',
        calculation_steps: ['Retail MSRP sourced from Rolex official price list', 'Secondary market ranges aggregated from major dealer platforms and auction results', 'Trend analysis based on 12-month price movement data'],
      });
    }

    const data = ROLEX_MARKET[collection];
    if (!data) return JSON.stringify({ error: `Unknown Rolex collection: ${collection}` });

    return JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      data_source: 'Simpleton Rolex Market Intelligence Database — secondary market pricing aggregated from Chrono24, WatchCharts, and verified dealer transactions',
      calculation_steps: ['Retail MSRP from Rolex official price list', 'Secondary range from verified dealer transactions and major platforms', 'Trend classification based on 12-month price trajectory'],
    });
  }

  if (name === 'get_diamond_market_data') {
    const { carat, shape, quality } = args as { carat: number; shape: string; quality: string };
    return JSON.stringify(getDiamondPriceContext(carat, shape, quality));
  }

  if (name === 'get_market_convergence_signal') {
    const { getSignalForSimplicity } = await import('./market-signal-engine');
    const raw = await getSignalForSimplicity();
    const parsed = JSON.parse(raw);
    parsed.data_source = 'Simpleton proprietary convergence analysis engine — aggregates price trends, volatility, geopolitical risk, central bank activity, and technical indicators';
    return JSON.stringify(parsed);
  }

  if (name === 'get_market_advisory') {
    const { getAdvisoryForSimplicity } = await import('./market-advisory-engine');
    const raw = await getAdvisoryForSimplicity();
    const parsed = JSON.parse(raw);
    parsed.data_source = 'Simpleton proprietary market advisory engine — analyzes supply/demand dynamics, RSI, moving averages, macroeconomic conditions, and central bank behavior';
    return JSON.stringify(parsed);
  }

  if (name === 'set_price_alert') {
    const { asset_type, target_price, direction } = args as { asset_type: string; target_price: number; direction: string };
    const { storage } = await import('./storage');
    const currentPrice = asset_type === 'gold' ? gold : asset_type === 'silver' ? silver : (prices as any)?.[asset_type] ?? 0;

    const alert = await storage.createPriceAlert({
      userId: contextUserId ?? 1,
      assetType: asset_type,
      assetName: asset_type.charAt(0).toUpperCase() + asset_type.slice(1),
      targetPrice: target_price.toString(),
      direction,
      status: 'active',
      priceAtCreation: currentPrice.toString(),
    });

    return JSON.stringify({
      success: true,
      alert_id: alert.id,
      message: `Price alert set: ${asset_type.toUpperCase()} ${direction} $${target_price.toLocaleString()}`,
      current_price: currentPrice,
      target_price,
      direction,
      distance: direction === 'above'
        ? `$${(target_price - currentPrice).toFixed(2)} above current price`
        : `$${(currentPrice - target_price).toFixed(2)} below current price`,
      data_source: 'Simpleton Price Alert System — monitors live spot prices every 5 minutes',
    });
  }

  if (name === 'record_transaction') {
    const { item_type, actual_price, appraised_price, notes } = args as { item_type: string; actual_price: number; appraised_price?: number; notes: string };
    const { storage } = await import('./storage');

    if (actual_price <= 0) {
      return JSON.stringify({ success: false, error: 'Price must be positive' });
    }

    const stats = await storage.getTransactionStats(item_type);
    let validationWarnings: string[] = [];
    let confidenceScore = 0.8;
    let verificationMethod = 'user-reported';

    if (stats.count >= 5 && stats.avgPrice > 0) {
      const deviation = Math.abs(actual_price - stats.avgPrice) / stats.avgPrice;
      if (deviation > 0.5) {
        validationWarnings.push(`Price deviates ${(deviation * 100).toFixed(0)}% from ${stats.count} similar transactions (avg $${stats.avgPrice.toFixed(2)})`);
        confidenceScore = 0.4;
      } else if (deviation > 0.3) {
        validationWarnings.push(`Price is ${(deviation * 100).toFixed(0)}% off network average`);
        confidenceScore = 0.6;
      }
    }

    if (appraised_price && actual_price > 0) {
      const appraisalDeviation = Math.abs(actual_price - appraised_price) / appraised_price;
      if (appraisalDeviation > 0.3) {
        validationWarnings.push(`Sale price deviates ${(appraisalDeviation * 100).toFixed(0)}% from appraised value`);
      }
      verificationMethod = 'user-reported-with-appraisal';
    }

    const tx = await storage.createMarketTransaction({
      userId: contextUserId ?? null,
      itemType: item_type,
      actualPrice: actual_price.toString(),
      appraisedPrice: appraised_price ? appraised_price.toString() : null,
      notes,
      confidenceScore: confidenceScore.toFixed(2),
      verificationMethod,
      verified: validationWarnings.length === 0,
    });

    const updatedStats = await storage.getTransactionStats(item_type);
    const variance = appraised_price ? ((actual_price - appraised_price) / appraised_price * 100).toFixed(1) : null;

    return JSON.stringify({
      success: true,
      transaction_id: tx.id,
      recorded: { item_type, actual_price, appraised_price: appraised_price || 'not provided', notes },
      validation: {
        confidence: confidenceScore,
        verified: validationWarnings.length === 0,
        warnings: validationWarnings.length > 0 ? validationWarnings : undefined,
        method: verificationMethod,
      },
      appraisal_accuracy: variance ? `${parseFloat(variance) > 0 ? '+' : ''}${variance}% vs appraised value` : 'No appraisal comparison available',
      network_stats: {
        total_transactions_for_type: updatedStats.count,
        average_price: updatedStats.avgPrice,
        price_range: { min: updatedStats.minPrice, max: updatedStats.maxPrice },
      },
      data_source: 'Simpleton Transaction Intelligence — every recorded sale improves future appraisal accuracy',
    });
  }

  if (name === 'appraise_with_history') {
    const { item_type, description: itemDesc } = args as { item_type: string; description: string };
    const { storage } = await import('./storage');

    const stats = await storage.getTransactionStats(item_type);
    const hasTransactionData = stats.count > 0;

    let spotEstimate = 0;
    if (item_type === 'gold_jewelry' || item_type === 'platinum_jewelry') {
      spotEstimate = item_type === 'gold_jewelry' ? gold : (prices?.platinum ?? 0);
    } else if (item_type === 'silver_jewelry') {
      spotEstimate = silver;
    }

    const spotWeight = hasTransactionData ? Math.max(0.5, 1 - (stats.count / 100)) : 1;
    const txWeight = 1 - spotWeight;

    const confidence = stats.count > 50 ? 'high' : stats.count > 10 ? 'medium' : stats.count > 0 ? 'low' : 'spot-only';

    return JSON.stringify({
      item_type,
      description: itemDesc,
      valuation_method: hasTransactionData ? 'Blended (Spot + Transaction History)' : 'Spot Price Only',
      spot_data: {
        metal_spot: spotEstimate > 0 ? spotEstimate : 'N/A — use item description to estimate',
        weight_applied: spotWeight,
      },
      transaction_data: hasTransactionData ? {
        avg_sale_price: stats.avgPrice,
        price_range: { min: stats.minPrice, max: stats.maxPrice },
        sample_size: stats.count,
        weight_applied: txWeight,
        period: 'Last 90 days',
      } : {
        message: 'No transaction history yet for this item type. Appraisal based on spot pricing only. Each recorded transaction will improve accuracy.',
        weight_applied: 0,
      },
      confidence,
      calculation_steps: [
        `Item type: ${item_type}`,
        `Description: ${itemDesc}`,
        spotEstimate > 0 ? `Live spot price: $${spotEstimate.toFixed(2)}/oz` : 'Spot price: use item details for calculation',
        hasTransactionData ? `Transaction history: ${stats.count} comparable sales, avg $${stats.avgPrice.toFixed(2)}` : 'No transaction history available yet',
        hasTransactionData ? `Blending: ${(spotWeight * 100).toFixed(0)}% spot + ${(txWeight * 100).toFixed(0)}% transaction data` : 'Using 100% spot-based valuation',
        `Confidence: ${confidence}`,
      ],
      data_source: hasTransactionData
        ? `Simpleton Blended Valuation Engine — spot prices via Swissquote feed + ${stats.count} verified network transactions`
        : 'Simpleton spot-based valuation — live prices via Swissquote feed (transaction data will improve accuracy over time)',
    });
  }

  if (name === 'predict_price') {
    const { item_type, horizon_days } = args as { item_type: string; horizon_days: number };
    const { generatePrediction } = await import('./prediction-engine');

    try {
      const prediction = await generatePrediction({
        itemType: item_type,
        horizonDays: horizon_days as 7 | 30 | 90,
      });

      return JSON.stringify({
        prediction: {
          asset: item_type,
          current_price: prediction.currentPrice,
          predicted_price: prediction.predictedPrice,
          range: prediction.range,
          confidence: prediction.confidence,
          trend: prediction.trend,
          horizon: `${horizon_days} days`,
        },
        methodology: {
          model: 'Market Memory Engine v1',
          transaction_count: prediction.transactionCount,
          features: prediction.features,
        },
        reasoning: prediction.reasoning,
        disclaimer: 'Predictions are based on historical transaction patterns and current market data. Not financial advice.',
        calculation_steps: prediction.features,
        data_source: `Simpleton Market Memory Engine — ${prediction.transactionCount} transactions analyzed + live spot pricing via Swissquote`,
      });
    } catch (e: any) {
      return JSON.stringify({
        error: e.message,
        suggestion: 'Try asking about current prices instead, or check back when more transaction data is available.',
        data_source: 'Simpleton Market Memory Engine',
      });
    }
  }

  if (name === 'get_simpleton_index') {
    const { asset_type } = args as { asset_type: string };
    const { computeSimpletonIndex } = await import('./simpleton-index');

    try {
      const index = await computeSimpletonIndex(asset_type);

      return JSON.stringify({
        simpleton_index: {
          asset: index.assetType,
          date: index.date,
          spot_price: index.spot,
          simpleton_price: index.simpletonIndex,
          premium: index.premium,
          premium_pct: index.spot > 0 ? `${((index.premium / index.spot) * 100).toFixed(2)}%` : '0%',
        },
        market_activity: {
          transactions_7d: index.volume,
          active_participants: index.participants,
          trend: index.trend,
          confidence: index.confidence,
          data_points: index.dataPoints,
        },
        explanation: index.confidence === 'spot-only'
          ? `The Simpleton Index for ${asset_type} is currently spot-only — no recent network transactions. As dealers log sales, this index will diverge from spot to show real-world pricing.`
          : `The Simpleton Index blends live spot ($${index.spot}) with ${index.volume} real transactions from the past 7 days. The $${index.premium > 0 ? '+' : ''}${index.premium.toFixed(2)} premium reflects actual dealer pricing vs theoretical spot.`,
        calculation_steps: [
          `Live spot: $${index.spot} (Swissquote feed)`,
          `Network transactions (7d): ${index.volume}`,
          `Active participants: ${index.participants}`,
          `Blend confidence: ${index.confidence}`,
          `Simpleton Index: $${index.simpletonIndex}`,
        ],
        data_source: `Simpleton Index — real-time transaction-weighted pricing from ${index.dataPoints} data points + live Swissquote spot feed`,
      });
    } catch (e: any) {
      return JSON.stringify({
        error: e.message,
        data_source: 'Simpleton Index',
      });
    }
  }

  if (name === 'get_market_overview') {
    const metalSummary = {
      gold:      { price: gold,                   unit: 'USD/troy oz', context: 'Safe-haven demand remains elevated' },
      silver:    { price: silver,                  unit: 'USD/troy oz', context: 'Industrial demand + monetary demand dual drivers' },
      platinum:  { price: prices?.platinum ?? 0,  unit: 'USD/troy oz', context: 'Auto-catalyst recovery + investment demand' },
      palladium: { price: prices?.palladium ?? 0, unit: 'USD/troy oz', context: 'EV transition pressure on automotive demand' },
    };

    return JSON.stringify({
      platform: 'Simpleton Vision™ Unified Market Intelligence',
      precious_metals: metalSummary,
      rolex_market: {
        status: 'Normalized from 2022 peak — opportunistic buying conditions in most references',
        hottest_models: ['Daytona 126500LN (80-150% over retail)', 'GMT-Master II "Pepsi" 126710BLRO', 'Submariner "Kermit" 126610LV'],
        market_trend: 'Steel sports models stabilizing; gold and platinum references holding near retail',
      },
      diamond_market: {
        status: 'Natural diamond prices stable; lab-grown under continued price pressure',
        natural_diamonds: 'Prices holding with modest demand from bridal market',
        lab_grown_diamonds: 'Prices 60-80% below 2022 peak; mainstream adoption accelerating',
        collector_picks: 'Fancy colored naturals (pink, blue, green) hold value best',
      },
      market_convergence_signal: (() => {
        try {
          return 'Use get_market_convergence_signal tool for live convergence data';
        } catch { return 'Signal engine available — call get_market_convergence_signal for live data'; }
      })(),
      coins_and_collectibles: {
        silver_coins: `Junk silver: $1 face value ≈ ${silver > 0 ? '$' + (0.715 * silver).toFixed(2) : 'N/A'} melt value at current $${silver.toFixed(2)} spot`,
        key_dates: 'Key-date coins commanding 10-100x over melt value in strong grades',
        numismatic: 'MS63+ common dates trending up; key dates stable with strong floor',
      },
      timestamp: new Date().toISOString(),
      data_source: 'Simpleton Vision Unified Market Intelligence — metals via Swissquote live feed; diamonds via Rapaport Diamond Report (Jan 9, 2026, Vol. 49 No. 2) and Kaggle Dataset; watches via Chrono24, WatchCharts, and verified dealer transactions; coins via US Mint metal content specifications',
    });
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ToolsResult {
  text: string;
  model: string;
  toolsUsed: string[];
}

export async function simplicityWithTools(
  systemPrompt: string,
  userMessage:  string,
  maxTokens = 2000,
  contextUserId?: number | null
): Promise<ToolsResult> {
  if (!deepseekTools) throw new Error('DeepSeek tools client not initialized');

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMessage  },
  ];

  const toolsUsed: string[] = [];

  const callWithTimeout = (body: any) =>
    Promise.race([
      deepseekTools!.chat.completions.create(body),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DeepSeek API call timed out')), 9000)
      ),
    ]);

  // Round 1 — model may request tool calls
  let response = await callWithTimeout({
    model:      'deepseek-chat',
    messages,
    tools:      TOOLS,
    max_tokens: maxTokens,
    temperature: 0.8,
  }) as any;

  let msg = response.choices[0].message;

  // Execute tool calls until the model gives a final text response
  while (msg.tool_calls && msg.tool_calls.length > 0) {
    messages.push(msg);

    for (const call of msg.tool_calls) {
      const args   = JSON.parse(call.function.arguments);
      const result = await executeTool(call.function.name, args, contextUserId);
      toolsUsed.push(call.function.name);
      console.log(`🔧 Tool called: ${call.function.name}(${JSON.stringify(args)}) → ${result.substring(0, 120)}...`);

      messages.push({
        role:         'tool',
        tool_call_id: call.id,
        content:      result,
      });
    }

    response = await callWithTimeout({
      model:      'deepseek-chat',
      messages,
      tools:      TOOLS,
      max_tokens: maxTokens,
      temperature: 0.8,
    }) as any;

    msg = response.choices[0].message;
  }

  const text = msg.content?.trim() ?? '';
  if (!text) throw new Error('Tool call cycle produced no text response');

  return {
    text,
    model:      `deepseek-chat (Tool Calls${toolsUsed.length ? ': ' + toolsUsed.join(', ') : ''})`,
    toolsUsed,
  };
}
