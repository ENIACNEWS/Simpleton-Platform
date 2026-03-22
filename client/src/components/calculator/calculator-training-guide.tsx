import { useState, useCallback } from "react";
import { X, ChevronRight, BookOpen, Sparkles, Calculator, Scale, Coins, ArrowUpDown, RotateCcw, Percent, HardDrive, Gem, Diamond, Layers, TrendingUp, Eye, Grid3X3, History, Zap } from "lucide-react";

interface FeatureItem {
  id: string;
  title: string;
  shortDesc: string;
  fullExplanation: string;
  icon: any;
  category: string;
}

const METALS_FEATURES: FeatureItem[] = [
  {
    id: 'spot-live',
    title: 'SPOT LIVE Price',
    shortDesc: 'Real-time market spot price from live feeds',
    fullExplanation: "The SPOT LIVE button shows you the current real-time market price for whatever metal you have selected (Gold, Silver, or Platinum). This price updates automatically from live market feeds every few seconds. When this button is highlighted green, it means you're calculating based on the actual current market price — what dealers and investors call the \"spot price.\" This is the baseline price per troy ounce that all other calculations are built from. When you enter a weight and press equals, the calculator uses this live spot price to determine the melt value of your metal.",
    icon: TrendingUp,
    category: 'Price Modes'
  },
  {
    id: 'custom-loan',
    title: 'CUSTOM LOAN Price',
    shortDesc: 'Set a custom loan-to-value percentage',
    fullExplanation: "CUSTOM LOAN lets you calculate what a pawn shop, lender, or buyer would offer as a loan against your metal. It works as a percentage of the live spot price. For example, if spot gold is $2,000/oz and you set the loan rate to 70%, the calculator will show you values based on $1,400/oz instead. This is incredibly useful for pawn shops, lending businesses, or anyone who needs to quickly calculate what percentage of spot they're willing to lend. Use the +/- buttons that appear when this mode is active to adjust the percentage up or down by 1% at a time.",
    icon: Percent,
    category: 'Price Modes'
  },
  {
    id: 'custom-sell',
    title: 'CUSTOM SELL Price',
    shortDesc: 'Set a custom selling percentage',
    fullExplanation: "CUSTOM SELL works similarly to Custom Loan, but it's designed for setting your selling price. If you're a dealer or reseller, you might buy gold at 85% of spot price. Set that percentage here and the calculator instantly shows what you'd pay for any weight of metal at your buy rate. This lets you quickly quote customers a fair purchase price. The percentage is adjustable with +/- buttons, and both the loan and sell percentages are saved so they persist between sessions.",
    icon: Coins,
    category: 'Price Modes'
  },
  {
    id: 'gold-button',
    title: 'GOLD Button',
    shortDesc: 'Switch calculator to gold pricing mode',
    fullExplanation: "Pressing GOLD switches the entire calculator to use gold spot prices. All calculations — live price, loan price, and sell price — will be based on the current gold market price. When Gold is selected, the karat buttons (10K through 24K) appear so you can select the purity of the gold you're calculating. Gold is priced per troy ounce (31.1 grams), and the calculator automatically handles all the conversions for you whether you're working in grams or troy ounces.",
    icon: Coins,
    category: 'Metal Selection'
  },
  {
    id: 'silver-button',
    title: 'SILVER Button',
    shortDesc: 'Switch calculator to silver pricing mode',
    fullExplanation: "Pressing SILVER switches to silver pricing. Silver purity options are different from gold — instead of karats, silver uses purity percentages like .999 (pure silver), .925 (sterling silver), .900 (coin silver), and .800. Sterling silver (.925) is the most common for jewelry, while .999 is used for bullion bars and coins. The calculator automatically adjusts all pricing and purity calculations when you switch to silver mode.",
    icon: Coins,
    category: 'Metal Selection'
  },
  {
    id: 'platinum-button',
    title: 'PLATINUM Button',
    shortDesc: 'Switch calculator to platinum pricing mode',
    fullExplanation: "PLATINUM mode switches to platinum spot pricing. Platinum is typically found in very high purity (.950 or .999), so the purity options are more limited than gold. Platinum is rarer than gold and its price can be higher or lower depending on market conditions. The calculator uses the same weight-to-value formulas but pulls the current platinum spot price for all calculations.",
    icon: Coins,
    category: 'Metal Selection'
  },
  {
    id: 'karat-buttons',
    title: 'Karat Buttons (10K-24K)',
    shortDesc: 'Select gold purity level for calculations',
    fullExplanation: "The karat buttons let you select the purity of gold you're working with. Here's what each means:\n\n• 24K = 99.9% pure gold (investment bars, some coins)\n• 22K = 91.7% pure (American Gold Eagles, some high-end jewelry)\n• 18K = 75.0% pure (fine jewelry, European standard)\n• 14K = 58.3% pure (most common US jewelry)\n• 10K = 41.7% pure (entry-level gold jewelry)\n\nWhen you select a karat, the calculator automatically adjusts the price per gram based on the gold content. For example, 14K gold is worth about 58.3% of the pure gold price because it's only 58.3% gold — the rest is alloy metals.",
    icon: Layers,
    category: 'Purity Selection'
  },
  {
    id: 'grams-oz',
    title: 'GRAMS / TROY OZ Toggle',
    shortDesc: 'Switch between grams and troy ounces',
    fullExplanation: "This toggle switches the weight unit used for all calculations. \n\n• GRAMS: The metric unit most people are familiar with. Ideal for weighing jewelry on a gram scale.\n• TROY OZ: The standard unit used in precious metals trading. 1 troy ounce = 31.1035 grams (slightly heavier than a regular ounce which is 28.35g).\n\nWhen you type a number and calculate, the result is based on whichever unit is currently selected. If your scale reads in grams, use grams. If you're looking at bullion prices (which are quoted per troy ounce), use troy oz.",
    icon: Scale,
    category: 'Weight & Units'
  },
  {
    id: 'fractional-oz',
    title: 'Fractional Ounce Button',
    shortDesc: 'Cycle through 1/2, 1/4, 1/10, 1/100 oz',
    fullExplanation: "The fractional ounce button lets you quickly calculate values for common bullion coin sizes without typing decimals. Each press cycles through:\n\n• 1/2 OZ — Half-ounce coins (like the 1/2 oz Gold Eagle)\n• 1/4 OZ — Quarter-ounce coins\n• 1/10 OZ — Tenth-ounce coins (popular small gold coins)\n• 1/100 OZ — Hundredth-ounce (small gold pieces)\n\nThis saves time when you're pricing multiple fractional coins — just press the button to cycle to the size you need, and the calculator instantly shows the melt value for that weight.",
    icon: Coins,
    category: 'Weight & Units'
  },
  {
    id: 'number-keys',
    title: 'Number Keys (0-9)',
    shortDesc: 'Enter weight values for calculation',
    fullExplanation: "The number keys work just like a regular calculator. Type the weight of the metal you want to calculate. For example, if you have a 14K gold chain that weighs 15.5 grams, you'd type 1, 5, decimal, 5. The number appears on the main display as you type. You can enter weights in either grams or troy ounces depending on which unit is currently selected at the top of the display.",
    icon: Calculator,
    category: 'Basic Operations'
  },
  {
    id: 'decimal',
    title: 'Decimal Point (.)',
    shortDesc: 'Add decimal points for precise weights',
    fullExplanation: "The decimal button lets you enter fractional weights with precision. Press it between digits to add a decimal point. For example: 3.75 grams, 0.5 troy ounces, 12.8 grams. The calculator supports high precision for professional accuracy. You can only add one decimal point per number entry.",
    icon: Calculator,
    category: 'Basic Operations'
  },
  {
    id: 'equals',
    title: 'Equals (=)',
    shortDesc: 'Calculate the melt value',
    fullExplanation: "The equals button is where the magic happens. After you've entered a weight, selected your metal and karat/purity, pressing equals calculates the melt value instantly. The three LED price displays at the top update simultaneously:\n\n• SPOT LIVE shows value at current market price\n• CUSTOM LOAN shows value at your loan percentage\n• CUSTOM SELL shows value at your sell percentage\n\nAll three values appear at once so you can instantly see the full picture — what it's worth at market, what to lend against it, and what to buy it for.",
    icon: Zap,
    category: 'Basic Operations'
  },
  {
    id: 'clear',
    title: 'Clear (C)',
    shortDesc: 'Reset the calculator display',
    fullExplanation: "The C button clears the current entry and resets the display. It clears the number you've typed but keeps your metal, karat, and unit selections. This is the button to press when you want to start a fresh calculation without changing any of your settings. After pressing C, the display shows 'SELECT METAL & KARAT' to remind you to make your selections before calculating.",
    icon: RotateCcw,
    category: 'Basic Operations'
  },
  {
    id: 'ac-button',
    title: 'All Clear (AC)',
    shortDesc: 'Full reset of calculator state',
    fullExplanation: "AC (All Clear) performs a more thorough reset than C. It clears the display, the current input, and resets the calculator to its starting state. Use this when you want a completely fresh start. Your saved loan and sell percentages are preserved, but the current calculation is wiped clean.",
    icon: RotateCcw,
    category: 'Basic Operations'
  },
  {
    id: 'ce-button',
    title: 'Clear Entry (CE)',
    shortDesc: 'Clear just the last digit entered',
    fullExplanation: "CE (Clear Entry) removes the last digit you typed, like a backspace key. If you accidentally press a wrong number, CE lets you correct it without clearing everything. Press it multiple times to remove multiple digits. This is much faster than clearing everything and retyping when you just need to fix a typo.",
    icon: RotateCcw,
    category: 'Basic Operations'
  },
  {
    id: 'memory-clear',
    title: 'Memory Clear (MC)',
    shortDesc: 'Clear the stored memory value',
    fullExplanation: "MC clears whatever number is currently stored in the calculator's memory. The memory system lets you save a value, do other calculations, and then recall it later. MC wipes that saved value so the memory is empty. Use this when you're done with a batch of calculations and want to start fresh.",
    icon: HardDrive,
    category: 'Memory Functions'
  },
  {
    id: 'memory-recall',
    title: 'Memory Recall (MR)',
    shortDesc: 'Recall the stored memory value',
    fullExplanation: "MR brings back whatever number you previously saved to memory using M+. This is incredibly useful when you're calculating multiple items and need to keep a running total. For example, if you're pricing a bag of mixed gold jewelry, you can calculate each piece, add it to memory with M+, then recall the total with MR at the end. The recalled value appears on the display and can be used in further calculations.",
    icon: HardDrive,
    category: 'Memory Functions'
  },
  {
    id: 'memory-add',
    title: 'Memory Add (M+)',
    shortDesc: 'Add current value to memory',
    fullExplanation: "M+ adds the current displayed value to whatever is already in memory. This is the key to batch calculations. Here's a real-world example:\n\n1. Weigh first gold chain → Calculate → M+ (saves $150)\n2. Weigh second chain → Calculate → M+ (adds $200, memory = $350)\n3. Weigh ring → Calculate → M+ (adds $85, memory = $435)\n4. Press MR → See total: $435\n\nThis is exactly how professional dealers price mixed lots of jewelry — piece by piece, adding each value to memory for a running total.",
    icon: HardDrive,
    category: 'Memory Functions'
  },
  {
    id: 'trad-mode',
    title: 'TRAD (Traditional Mode)',
    shortDesc: 'Switch to standard calculator mode',
    fullExplanation: "TRAD toggles Traditional Calculator Mode on and off. When active, the calculator functions as a regular math calculator — addition, subtraction, multiplication, and division — without any precious metals pricing. This is useful when you need to do general math while on the calculator page, like calculating a discount percentage or adding up quantities. Press TRAD again to return to the precious metals calculator mode.",
    icon: Calculator,
    category: 'Special Functions'
  },
  {
    id: 'reset-rates',
    title: 'RESET RATES',
    shortDesc: 'Reset loan and sell percentages to defaults',
    fullExplanation: "RESET RATES restores your Custom Loan and Custom Sell percentages back to their default values. If you've been adjusting your buy/sell percentages and want to start over with the standard rates, this button does it instantly. It only affects the loan and sell rate percentages — it doesn't change your metal selection, weight units, or any other settings.",
    icon: RotateCcw,
    category: 'Special Functions'
  },
  {
    id: 'percentage',
    title: 'Percentage (%)',
    shortDesc: 'Calculate percentage of current value',
    fullExplanation: "The % button lets you quickly calculate percentages. This is handy for figuring out what percentage of spot price a certain value represents, or for calculating discounts and markups. Enter a number, press %, and it divides by 100 to give you the decimal equivalent for percentage calculations.",
    icon: Percent,
    category: 'Special Functions'
  },
  {
    id: 'divide',
    title: 'Divide (÷)',
    shortDesc: 'Division operation',
    fullExplanation: "The divide button performs standard division. Useful for splitting values between items, calculating per-piece prices from lot totals, or converting between different units. Enter the first number, press ÷, enter the second number, and press = to see the result.",
    icon: Calculator,
    category: 'Math Operations'
  },
  {
    id: 'multiply',
    title: 'Multiply (×)',
    shortDesc: 'Multiplication operation',
    fullExplanation: "The multiply button performs standard multiplication. Useful for calculating the value of multiple identical items (like 5 identical coins), applying markups, or converting weights. Enter the first number, press ×, enter the second number, and press = to get the result.",
    icon: Calculator,
    category: 'Math Operations'
  },
  {
    id: 'subtract',
    title: 'Subtract (−)',
    shortDesc: 'Subtraction operation',
    fullExplanation: "The subtract button performs standard subtraction. Use it to calculate differences between prices, deduct fees, or find the change in value between two amounts. Enter the first number, press −, enter the second number, and press = to see the difference.",
    icon: Calculator,
    category: 'Math Operations'
  },
  {
    id: 'add',
    title: 'Add (+)',
    shortDesc: 'Addition operation',
    fullExplanation: "The add button performs standard addition. Useful for totaling multiple calculations, adding premiums to spot price, or combining weights. Enter the first number, press +, enter the second number, and press = to get the sum.",
    icon: Calculator,
    category: 'Math Operations'
  },
  {
    id: 'loan-adjust',
    title: 'Loan +/- Adjustment',
    shortDesc: 'Fine-tune loan percentage by 1% increments',
    fullExplanation: "When Custom Loan mode is active, the +/- buttons let you adjust the loan-to-value percentage in 1% increments. Press + to increase (e.g., from 70% to 71%) or - to decrease (e.g., from 70% to 69%). The loan price LED updates instantly to reflect the new percentage. This gives you precise control over your lending rates and lets you quickly adjust for different customers or situations.",
    icon: ArrowUpDown,
    category: 'Rate Adjustments'
  },
  {
    id: 'sell-adjust',
    title: 'Sell +/- Adjustment',
    shortDesc: 'Fine-tune sell percentage by 1% increments',
    fullExplanation: "When Custom Sell mode is active, the +/- buttons adjust your selling/buying rate in 1% increments. This is how dealers fine-tune their buy prices. You might pay 82% for a regular customer and 85% for a large lot — just tap the + button a few times to adjust. The sell price LED updates in real-time so you can see exactly what you'd be paying.",
    icon: ArrowUpDown,
    category: 'Rate Adjustments'
  },
  {
    id: 'display-area',
    title: 'Main Display Area',
    shortDesc: 'Shows weight, values, and metal info',
    fullExplanation: "The main display area is your command center. It shows:\n\n• Top Left: Current weight unit (GRAMS or TROY OZ), tap to switch\n• Top Right: Selected metal and purity (e.g., GOLD • 58.3% PURE)\n• Center: The big number — your entered weight or calculated value\n• Three LED Strips: Spot Live (green), Custom Loan (blue), Custom Sell (orange) — all showing real-time values\n\nThe display uses high-contrast LED-style fonts for readability and updates instantly as you type or change settings.",
    icon: Eye,
    category: 'Display & Interface'
  },
];

const DIAMOND_FEATURES: FeatureItem[] = [
  {
    id: 'carat-weight',
    title: 'Carat Weight Entry',
    shortDesc: 'Enter the diamond weight in carats',
    fullExplanation: "Carat weight is the most important factor in diamond pricing. One carat equals 0.2 grams. The calculator lets you enter precise carat weights using the number buttons. Important: Diamond prices don't scale linearly — a 2-carat diamond isn't just twice the price of a 1-carat diamond, it can be 3-4 times more expensive because larger diamonds are exponentially rarer. There are also \"magic numbers\" at 0.50ct, 1.00ct, 1.50ct, and 2.00ct where prices jump significantly.",
    icon: Scale,
    category: 'Diamond Specifications'
  },
  {
    id: 'diamond-shapes',
    title: 'Diamond Shape Selection',
    shortDesc: 'Choose from Round, Princess, Oval, and more',
    fullExplanation: "Shape significantly affects diamond pricing. The calculator supports all major shapes:\n\n• Round Brilliant: The most popular and typically most expensive shape, with the best light performance\n• Princess: Square shape, second most popular, generally 20-30% less than round\n• Oval: Elongated, appears larger than round for same carat weight\n• Emerald: Rectangular step-cut, emphasizes clarity over brilliance\n• Cushion: Soft square/rectangular, vintage appeal\n• Pear: Teardrop shape, unique and elegant\n• Marquise: Elongated with pointed ends, appears very large\n• Asscher: Square step-cut, Art Deco style\n• Radiant: Combines brilliance of round with rectangular shape\n• Heart: Romantic shape, requires high carat for visibility\n\nRound diamonds command a premium because they require more rough stone to be cut away, resulting in more waste.",
    icon: Diamond,
    category: 'Diamond Specifications'
  },
  {
    id: 'color-grade',
    title: 'Color Grade (D-M)',
    shortDesc: 'Select diamond color from D (colorless) to M',
    fullExplanation: "Diamond color is graded on a scale from D (completely colorless) to Z (light yellow/brown). The calculator uses grades D through M:\n\n• D-F: Colorless — Most valuable, differences only visible to gemologists\n• G-H: Near Colorless — Excellent value, face-up colorless to most people\n• I-J: Near Colorless — Slight warmth, great value especially in yellow gold settings\n• K-M: Faint Color — Noticeable warmth, significant price reduction\n\nColor grade has a major impact on price. A D-color diamond can be 30-50% more expensive than the same diamond in H color. For the best value, most experts recommend G-H color — they look colorless when set in jewelry but cost significantly less than D-E-F.",
    icon: Eye,
    category: 'Diamond Specifications'
  },
  {
    id: 'clarity-grade',
    title: 'Clarity Grade (IF-I3)',
    shortDesc: 'Select clarity from Internally Flawless to Included',
    fullExplanation: "Clarity measures internal imperfections (inclusions) and surface blemishes:\n\n• IF (Internally Flawless): No inclusions visible at 10x magnification\n• VVS1-VVS2: Very, Very Slightly Included — extremely difficult to see at 10x\n• VS1-VS2: Very Slightly Included — minor inclusions visible at 10x\n• SI1-SI2: Slightly Included — noticeable at 10x, may be visible to naked eye\n• I1-I3: Included — visible to naked eye, affects brilliance\n\nFor the best value, SI1 is often the sweet spot — inclusions typically aren't visible to the naked eye, but the price is significantly lower than VS or VVS grades. The calculator factors clarity into the per-carat price using industry-standard pricing matrices.",
    icon: Eye,
    category: 'Diamond Specifications'
  },
  {
    id: 'cut-grade',
    title: 'Cut Grade Selection',
    shortDesc: 'Choose Excellent, Very Good, Good, or Fair',
    fullExplanation: "Cut grade measures how well a diamond is proportioned and finished:\n\n• Excellent/Ideal: Maximum brilliance and fire, light returns perfectly\n• Very Good: Slightly less ideal proportions, still exceptional beauty\n• Good: Reflects most light, good value choice\n• Fair: Some light escapes, noticeable difference in sparkle\n\nCut is considered the most important of the 4Cs for a diamond's beauty because it directly affects how the diamond handles light. An Excellent cut diamond will sparkle significantly more than a Fair cut, even if color and clarity are the same. The calculator applies appropriate premiums or discounts based on cut quality.",
    icon: Sparkles,
    category: 'Diamond Specifications'
  },
  {
    id: 'natural-vs-lab',
    title: 'Natural vs Lab-Grown Toggle',
    shortDesc: 'Switch between natural and lab-grown pricing',
    fullExplanation: "This toggle switches between natural diamond and lab-grown diamond pricing. Lab-grown diamonds are chemically identical to natural diamonds but created in a laboratory. Key differences:\n\n• Lab-grown diamonds typically cost 70-85% less than natural\n• Lab-grown prices have been decreasing over time as production scales up\n• Natural diamonds hold value better for resale\n• Both are real diamonds with identical physical properties\n\nThe calculator applies the appropriate pricing model based on your selection, so you can instantly compare what a diamond is worth as natural versus lab-grown.",
    icon: Gem,
    category: 'Pricing Modes'
  },
  {
    id: 'rapaport-price',
    title: 'Market Price Display',
    shortDesc: 'Shows estimated market value per carat',
    fullExplanation: "The main price display shows the estimated retail market value for the diamond based on all the specifications you've entered. This price is calculated using comprehensive pricing matrices that factor in carat weight, color, clarity, shape, and cut. The price shown is a retail market estimate — actual prices can vary based on certification (GIA, IGI), fluorescence, specific proportions, and market conditions. Use this as a strong baseline for negotiation and comparison shopping.",
    icon: TrendingUp,
    category: 'Pricing Modes'
  },
  {
    id: 'loan-price-diamond',
    title: 'Diamond Loan Price',
    shortDesc: 'Calculate loan-to-value for diamond collateral',
    fullExplanation: "The Loan Price shows what a diamond would be worth as collateral for a loan. It applies a percentage discount to the retail value (typically 30-50% of retail). This is what pawn shops and diamond lending services use to determine how much they'd lend against a diamond. You can adjust the loan percentage to match your lending criteria, giving you instant loan values for any diamond specification.",
    icon: Percent,
    category: 'Pricing Modes'
  },
  {
    id: 'wholesale-price',
    title: 'Diamond Wholesale/Sell Price',
    shortDesc: 'Calculate dealer buy price for diamonds',
    fullExplanation: "The Wholesale/Sell Price shows what a dealer would typically pay to purchase the diamond. This is lower than retail but higher than loan value. Wholesale prices vary based on demand, but the calculator gives you a strong estimate. You can adjust the wholesale percentage to match your market. This is essential for dealers who need to quickly determine their buy price to ensure profitability when reselling.",
    icon: Coins,
    category: 'Pricing Modes'
  },
  {
    id: 'calculate-button',
    title: 'Calculate Button',
    shortDesc: 'Run the diamond valuation',
    fullExplanation: "The Calculate button runs the full diamond valuation algorithm. It takes all your inputs — carat weight, shape, color, clarity, and cut — and calculates three values simultaneously:\n\n1. Retail market value (what a consumer would pay)\n2. Loan value (what a lender would offer as collateral value)\n3. Wholesale value (what a dealer would pay to buy it)\n\nThe calculation uses industry-standard pricing matrices and applies appropriate multipliers for shape, cut quality, and size brackets. Results appear on the three LED price displays at the top of the calculator.",
    icon: Zap,
    category: 'Calculator Operations'
  },
  {
    id: 'clear-diamond',
    title: 'Clear / Reset',
    shortDesc: 'Reset all diamond specifications',
    fullExplanation: "The Clear button resets all diamond specifications back to their starting state. This clears the carat weight, resets shape/color/clarity/cut selections, and clears the price displays. Use this when you want to start evaluating a completely new diamond. Your loan and wholesale percentage settings are preserved.",
    icon: RotateCcw,
    category: 'Calculator Operations'
  },
  {
    id: 'backspace-diamond',
    title: 'Backspace',
    shortDesc: 'Delete the last digit of carat weight',
    fullExplanation: "The backspace button removes the last digit you entered for the carat weight, just like pressing backspace on a keyboard. If you accidentally type 1.55 instead of 1.5, just press backspace once to fix it. This is much faster than clearing everything and starting over.",
    icon: RotateCcw,
    category: 'Calculator Operations'
  },
  {
    id: 'calculation-history',
    title: 'Calculation History',
    shortDesc: 'View your last 10 diamond calculations',
    fullExplanation: "The History feature saves your last 10 diamond calculations so you can review and compare them. Each saved calculation shows the date/time, diamond specifications (carat, shape, color, clarity, cut), and the calculated values. This is invaluable when comparing multiple diamonds — you can calculate each one, then review the history to see which offers the best value. History is saved in your browser so it persists between sessions.",
    icon: History,
    category: 'Advanced Features'
  },
  {
    id: 'price-grid',
    title: 'Price Grid System',
    shortDesc: 'View and edit per-carat price matrices',
    fullExplanation: "The Price Grid System shows complete pricing matrices organized by carat weight range, color, and clarity. These grids show price-per-carat values (multiply by carat weight for total price). You can view grids for both Round and Pear/Fancy shapes. Advanced users can even edit individual cells to match their local market pricing. Changes are saved locally so your custom pricing persists. This is essentially a digital version of the Rapaport price list that diamond dealers use.",
    icon: Grid3X3,
    category: 'Advanced Features'
  },
  {
    id: 'loan-adjust-diamond',
    title: 'Loan % Adjustment (+/-)',
    shortDesc: 'Fine-tune diamond loan percentage',
    fullExplanation: "When viewing the Loan price, the +/- buttons let you adjust the loan-to-value percentage in 1% increments. This gives you precise control over your lending rate. For example, you might offer 40% for a lower-quality diamond but 55% for a GIA-certified excellent-cut stone. The loan price updates instantly as you adjust, making it easy to find the right number for each transaction.",
    icon: ArrowUpDown,
    category: 'Rate Adjustments'
  },
  {
    id: 'wholesale-adjust',
    title: 'Wholesale % Adjustment (+/-)',
    shortDesc: 'Fine-tune diamond wholesale percentage',
    fullExplanation: "The wholesale +/- buttons adjust your buy/sell percentage for diamonds in 1% increments. Different diamonds command different wholesale percentages — a highly desirable 1-carat round D/VS1 might trade at 85% of retail, while a less desirable shape/quality might only fetch 65%. Adjusting this lets you accurately price diamonds based on their marketability.",
    icon: ArrowUpDown,
    category: 'Rate Adjustments'
  },
  {
    id: 'comparison-panel',
    title: 'Diamond Comparison Panel',
    shortDesc: 'Compare two diamonds side by side',
    fullExplanation: "The Diamond Comparison Panel (below the calculator) lets you compare two different diamonds side by side. Enter the specifications for each diamond and see which offers better value per carat, which has better investment potential, and how they differ in price. This is exactly what smart diamond shoppers should do — always compare multiple options before buying.",
    icon: Layers,
    category: 'Enhancement Panels'
  },
  {
    id: 'fluorescence-panel',
    title: 'Fluorescence Panel',
    shortDesc: 'Understand how fluorescence affects value',
    fullExplanation: "Fluorescence is the glow some diamonds emit under UV light. This panel explains how fluorescence affects diamond value:\n\n• None/Faint: No impact on price\n• Medium Blue: Can actually improve appearance of lower-color diamonds (I-M)\n• Strong/Very Strong: Can reduce value by 5-15% for higher color grades (D-G) because it may cause a hazy appearance\n\nFluorescence is often overlooked but can be a source of value — a medium blue fluorescent G-color diamond may look whiter and cost less than a non-fluorescent G.",
    icon: Sparkles,
    category: 'Enhancement Panels'
  },
  {
    id: 'certification-panel',
    title: 'Certification Premium Panel',
    shortDesc: 'See how GIA vs IGI certification affects price',
    fullExplanation: "Different gemological laboratories grade diamonds with varying strictness, which affects market value. GIA (Gemological Institute of America) is the most respected and commands a premium. IGI (International Gemological Institute) is widely accepted especially for lab-grown diamonds. This panel shows the price premiums associated with each certification so you can factor it into your valuations.",
    icon: Eye,
    category: 'Enhancement Panels'
  },
  {
    id: 'investment-calc',
    title: 'Investment Calculator Panel',
    shortDesc: 'Calculate diamond investment returns',
    fullExplanation: "The Investment Calculator Panel helps you evaluate diamonds as investment vehicles. Enter a purchase price, expected holding period, and the panel estimates potential appreciation based on historical diamond price trends. While diamonds aren't traditional investments, high-quality stones (D-F color, VS+ clarity, excellent cut, 1ct+) have historically appreciated over long periods. This tool helps you make informed decisions about diamond purchases from an investment perspective.",
    icon: TrendingUp,
    category: 'Enhancement Panels'
  },
  {
    id: 'ring-setting',
    title: 'Ring Setting Estimator',
    shortDesc: 'Estimate total ring cost including setting',
    fullExplanation: "The Ring Setting Estimator adds the cost of a ring setting to your diamond calculation. Settings can range from simple solitaires ($500-$2,000) to elaborate designs with side stones ($3,000-$15,000+). This panel gives you a more realistic total cost estimate for a finished piece of jewelry, which is what most consumers actually want to know — not just the loose diamond price, but the total ring cost.",
    icon: Gem,
    category: 'Enhancement Panels'
  },
];

interface TrainingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'metals' | 'diamonds';
  onAskSimplicity?: (question: string) => void;
}

export function CalculatorTrainingGuide({ isOpen, onClose, type, onAskSimplicity }: TrainingGuideProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const features = type === 'metals' ? METALS_FEATURES : DIAMOND_FEATURES;
  const themeColor = type === 'metals' ? 'rgba(255,215,0' : 'rgba(185,220,255';
  const themeName = type === 'metals' ? 'Precious Metals' : 'Diamond';
  const accentHex = type === 'metals' ? '#FFD700' : '#b9dcff';

  const categories = Array.from(new Set(features.map(f => f.category)));

  const filteredFeatures = searchTerm
    ? features.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : features;

  const filteredCategories = categories.filter(cat =>
    filteredFeatures.some(f => f.category === cat)
  );

  const toggleFeature = useCallback((id: string) => {
    setExpandedFeature(prev => prev === id ? null : id);
  }, []);

  const handleAskSimplicity = useCallback((feature: FeatureItem) => {
    if (onAskSimplicity) {
      onAskSimplicity(`Explain the ${feature.title} feature on the ${themeName} Calculator in detail. How do I use it and when would I need it?`);
    }
    onClose();
  }, [onAskSimplicity, onClose, themeName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-2xl mx-2 sm:mx-4 my-4 sm:my-8 rounded-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: 'calc(100vh - 2rem)',
          background: 'linear-gradient(135deg, rgba(12,12,22,0.98) 0%, rgba(8,8,16,0.99) 100%)',
          border: `1px solid ${themeColor},0.2)`,
          boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 40px ${themeColor},0.05)`,
        }}
      >
        <div className="flex items-center justify-between p-4 sm:p-5" style={{
          background: `linear-gradient(135deg, ${themeColor},0.08) 0%, ${themeColor},0.03) 100%)`,
          borderBottom: `1px solid ${themeColor},0.12)`,
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${themeColor},0.2), ${themeColor},0.1))`,
              border: `1px solid ${themeColor},0.2)`,
            }}>
              <BookOpen className="w-5 h-5" style={{ color: accentHex }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                {themeName} Calculator Training
              </h2>
              <p className="text-xs" style={{ color: `${themeColor},0.5)` }}>
                {features.length} features — tap any to learn more
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: `${themeColor},0.6)` }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${themeColor},0.08)` }}>
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${themeColor},0.1)`,
              color: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ scrollbarWidth: 'thin' }}>
          {filteredCategories.map(category => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: `${themeColor},0.5)` }}>
                {category}
              </h3>
              <div className="space-y-2">
                {filteredFeatures.filter(f => f.category === category).map(feature => {
                  const Icon = feature.icon;
                  const isExpanded = expandedFeature === feature.id;
                  return (
                    <div
                      key={feature.id}
                      className="rounded-xl overflow-hidden transition-all duration-200"
                      style={{
                        background: isExpanded ? `${themeColor},0.06)` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isExpanded ? `${themeColor},0.15)` : `${themeColor},0.06)`}`,
                      }}
                    >
                      <button
                        onClick={() => toggleFeature(feature.id)}
                        className="w-full flex items-center gap-3 p-3 text-left transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                          background: `${themeColor},0.08)`,
                        }}>
                          <Icon className="w-4 h-4" style={{ color: accentHex }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
                            {feature.title}
                          </h4>
                          <p className="text-xs truncate" style={{ color: `${themeColor},0.4)` }}>
                            {feature.shortDesc}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                          style={{
                            color: `${themeColor},0.3)`,
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1">
                          <div className="rounded-lg p-3 mb-3" style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: `1px solid ${themeColor},0.06)`,
                          }}>
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.75)' }}>
                              {feature.fullExplanation}
                            </p>
                          </div>
                          {onAskSimplicity && (
                            <button
                              onClick={() => handleAskSimplicity(feature)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                              style={{
                                background: `linear-gradient(135deg, ${themeColor},0.15), ${themeColor},0.08))`,
                                border: `1px solid ${themeColor},0.2)`,
                                color: accentHex,
                              }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Ask Simplicity AI for more details
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: `${themeColor},0.4)` }}>No features match your search</p>
            </div>
          )}
        </div>

        <div className="p-4" style={{
          borderTop: `1px solid ${themeColor},0.08)`,
          background: `${themeColor},0.02)`,
        }}>
          <p className="text-xs text-center" style={{ color: `${themeColor},0.35)` }}>
            Tap any feature to expand its full explanation — or ask Simplicity AI for a personalized walkthrough
          </p>
        </div>
      </div>
    </div>
  );
}
