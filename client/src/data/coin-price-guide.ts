// ─── Simpleton Vision™ Coin Price Guide ─────────────────────────────────────
// Comprehensive graded pricing data for US coins, modeled after Red Book,
// Blue Book, Gray Sheet, and Coin Age valuations.
// Grades: G-4, VG-8, F-12, VF-20, EF-40, AU-50, MS-60, MS-63, MS-65, MS-67

export type CoinGrade = {
  grade: string;
  label: string;
  value: number | null;
};

export type CoinPriceEntry = {
  name: string;
  series: string;
  keyDates: string[];
  gradeValues: CoinGrade[];
  notes: string;
  investorGrade: 'A' | 'B' | 'C';
  silverContent?: number;
  goldContent?: number;
};

export type SeriesOverview = {
  years: string;
  composition: string;
  diameter: string;
  weight: string;
  designerObverse: string;
  designerReverse: string;
  totalMinted: string;
  numismaticHighlights: string;
  investmentAdvice: string;
  keyDatesAndRarities: Array<{ date: string; description: string; value: string }>;
};

// ─── Series Reference Database ──────────────────────────────────────────────

export const SERIES_OVERVIEW: Record<string, SeriesOverview> = {
  'Lincoln Cent': {
    years: '1909–present',
    composition: '1909–1942: 95% copper, 5% tin/zinc | 1943: zinc-coated steel | 1944–1982: 95% copper | 1983–present: 97.5% zinc, 2.5% copper plating',
    diameter: '19.05mm',
    weight: '3.11g (copper) / 2.50g (zinc)',
    designerObverse: 'Victor David Brenner (1909)',
    designerReverse: 'Victor Brenner (Wheat, 1909–1958) / Frank Gasparro (Memorial, 1959–2008)',
    totalMinted: 'Over 500 billion across all years',
    numismaticHighlights: 'First US coin to feature a real person. The 1909-S VDB is one of the most famous coins in American numismatics — only 484,000 struck before the designer initials were controversially removed. The 1943 steel cents were a wartime measure that created one of the most counterfeited coins in history. Genuine 1943 copper cents are among the greatest rarities in US coinage.',
    investmentAdvice: 'Key date wheat cents (1909-S VDB, 1914-D, 1922 plain, 1931-S) in high grades represent exceptional long-term value. MS-65 Red (RD) examples of common dates are affordable entry points. The 1943 copper and 1944 steel error coins are the ultimate rarities in this series — authentic examples in any condition are worth five to six figures.',
    keyDatesAndRarities: [
      { date: '1909-S VDB', description: 'Famous key date with designer initials — only 484,000 minted at San Francisco', value: 'G-4: $700 | VF-20: $1,100 | MS-63: $3,500 | MS-65 RD: $12,000' },
      { date: '1909-S', description: 'San Francisco mint, no VDB — key date', value: 'G-4: $60 | VF-20: $110 | MS-63: $350 | MS-65 RD: $1,800' },
      { date: '1914-D', description: 'Denver mint, low mintage — major key date', value: 'G-4: $200 | VF-20: $475 | MS-63: $3,500 | MS-65 RD: $25,000' },
      { date: '1922 Plain', description: 'No D mintmark due to die wear — error coin', value: 'G-4: $700 | VF-20: $1,600 | MS-60: $12,000' },
      { date: '1931-S', description: 'Depression-era low mintage — 866,000 struck', value: 'G-4: $85 | VF-20: $105 | MS-63: $280 | MS-65 RD: $800' },
      { date: '1943 Copper', description: 'Wrong-planchet error — should have been steel', value: 'Any grade: $100,000–$200,000+' },
      { date: '1944 Steel', description: 'Wrong-planchet error — should have been brass', value: 'Any grade: $75,000–$150,000+' },
      { date: '1955 DDO', description: 'Famous doubled-die obverse — very noticeable doubling', value: 'G-4: $1,000 | VF-20: $1,500 | MS-63: $8,000 | MS-65: $35,000' },
      { date: '1960-D Small Date', description: 'Small date variety, overdetermined', value: 'MS-65 RD: $2,500' },
      { date: '1972 DDO', description: 'Dramatic doubled die — strong doubling in LIBERTY and date', value: 'MS-63: $350 | MS-65: $1,100' },
    ],
  },
  'Buffalo Nickel': {
    years: '1913–1938',
    composition: '75% copper, 25% nickel',
    diameter: '21.2mm',
    weight: '5.00g',
    designerObverse: 'James Earle Fraser',
    designerReverse: 'James Earle Fraser',
    totalMinted: 'Approximately 1.2 billion across all dates/mints',
    numismaticHighlights: 'One of the most beloved American coin designs. The obverse features a composite Native American portrait; the reverse shows an American bison (Black Diamond of the Central Park Zoo was the primary model). The 1913 Type 1 (raised mound under buffalo) was replaced mid-year by Type 2 (flat ground) after the raised mound wore down quickly in circulation. The 1937-D Three-Legged Buffalo is one of the most famous varieties in numismatics.',
    investmentAdvice: 'Key dates (1913-S Type 2, 1916 DDO, 1918/7-D, 1921-S, 1926-S) in Fine or better condition are solid long-term holds. Fully struck MS-65 examples of common dates are surprisingly elusive due to weak striking. The design makes even circulated examples aesthetically appealing.',
    keyDatesAndRarities: [
      { date: '1913-S Type 2', description: 'Scarce first-year San Francisco issue on flat ground', value: 'G-4: $100 | VF-20: $375 | MS-63: $4,000 | MS-65: $30,000' },
      { date: '1916 DDO', description: 'Doubled die obverse — LIBERTY shows doubling', value: 'G-4: $600 | VF-20: $2,200 | MS-63: $25,000' },
      { date: '1918/7-D', description: 'Overdate — 8 struck over 7 at Denver mint', value: 'G-4: $400 | VF-20: $2,500 | MS-63: $50,000' },
      { date: '1921-S', description: 'Low-mintage San Francisco issue', value: 'G-4: $100 | VF-20: $400 | MS-63: $6,500 | MS-65: $45,000' },
      { date: '1926-S', description: 'Very scarce — 970,000 minted', value: 'G-4: $70 | VF-20: $250 | MS-63: $4,000 | MS-65: $35,000' },
      { date: '1937-D 3-Leg', description: 'Famous variety — one leg worn off die through overpolishing', value: 'G-4: $450 | VF-20: $900 | MS-63: $5,000 | MS-65: $22,000' },
    ],
  },
  'Mercury Dime': {
    years: '1916–1945',
    composition: '90% silver, 10% copper',
    diameter: '17.9mm',
    weight: '2.50g (0.07234 troy oz silver)',
    designerObverse: 'Adolph A. Weinman',
    designerReverse: 'Adolph A. Weinman',
    totalMinted: 'Over 2.7 billion across all dates/mints',
    numismaticHighlights: 'One of the most artistically acclaimed US coin designs. The obverse shows Liberty wearing a winged cap (commonly mistaken for Mercury). The reverse features the fasces — a bundle of rods symbolizing unity and strength. Full Split Bands (FSB) designation on the reverse dramatically impacts values. The 1916-D with only 264,000 struck is one of the key dates of 20th-century numismatics.',
    investmentAdvice: 'The 1916-D is the key date and in high demand at all grade levels. Common-date Mercury dimes in FSB condition command significant premiums. A complete set in VF-EF is an achievable goal that makes an impressive display. Silver melt adds a floor value to all examples.',
    keyDatesAndRarities: [
      { date: '1916-D', description: 'The key date — only 264,000 minted at Denver', value: 'G-4: $900 | VF-20: $2,200 | MS-63: $12,000 | MS-65 FSB: $85,000' },
      { date: '1921', description: 'Low mintage — only 1.23 million', value: 'G-4: $60 | VF-20: $250 | MS-63: $3,500' },
      { date: '1921-D', description: 'Low mintage Denver — 1.08 million', value: 'G-4: $65 | VF-20: $275 | MS-63: $3,200' },
      { date: '1926-S', description: 'Very scarce semi-key', value: 'G-4: $20 | VF-20: $65 | MS-63: $2,500 | MS-65 FSB: $30,000' },
      { date: '1931-D', description: 'Depression-era low mintage', value: 'G-4: $25 | VF-20: $65 | MS-63: $750' },
      { date: '1942/1', description: 'Overdate — 42 over 41 on both P and D mints', value: 'G-4: $500 | VF-20: $850 | MS-63: $3,200' },
    ],
  },
  'Washington Quarter': {
    years: '1932–1998 (90% silver through 1964)',
    composition: '1932–1964: 90% silver, 10% copper | 1965–present: copper-nickel clad',
    diameter: '24.3mm',
    weight: '6.25g (0.18084 troy oz silver in 90% issues)',
    designerObverse: 'John Flanagan',
    designerReverse: 'John Flanagan / Various (state quarters)',
    totalMinted: 'Over 25 billion total',
    numismaticHighlights: 'Washington quarters issued 1932–1964 are 90% silver and have strong collector and bullion demand. The 1932-D and 1932-S are the key dates of this series with only 436,800 and 408,000 minted respectively. The state quarter program (1999–2008) generated enormous public interest in coin collecting.',
    investmentAdvice: 'Pre-1965 Washington quarters trade near or above melt value in circulated grades. The 1932-D and 1932-S in Fine or better are strong investments. Silver Washington quarters remain one of the most efficient ways to accumulate junk silver.',
    keyDatesAndRarities: [
      { date: '1932-D', description: 'Key date — only 436,800 minted at Denver', value: 'G-4: $175 | VF-20: $325 | MS-63: $7,500 | MS-65: $40,000' },
      { date: '1932-S', description: 'Co-key date — 408,000 minted at San Francisco', value: 'G-4: $175 | VF-20: $350 | MS-63: $8,000 | MS-65: $40,000' },
      { date: '1934 DDO', description: 'Doubled die obverse — scarce variety', value: 'VF-20: $100 | MS-63: $750' },
      { date: '1937', description: 'Common date, strong collector demand in MS', value: 'MS-65: $350 | MS-67: $2,800' },
      { date: '1942-D', description: 'High mintage but sought in top grades', value: 'MS-65: $75 | MS-67: $3,500' },
    ],
  },
  'Walking Liberty Half Dollar': {
    years: '1916–1947',
    composition: '90% silver, 10% copper',
    diameter: '30.6mm',
    weight: '12.50g (0.36169 troy oz silver)',
    designerObverse: 'Adolph A. Weinman',
    designerReverse: 'Adolph A. Weinman',
    totalMinted: 'Approximately 485 million across all dates/mints',
    numismaticHighlights: 'Often called the most beautiful US coin ever struck, Walking Liberty halves feature Weinman\'s iconic depiction of Liberty walking toward the sunrise. The 1916 issues (especially 1916-D Obverse) had the mintmark on the obverse — moved to reverse in mid-1917. The 1921 issues are the scarcest 20th-century halves with only 246,000 and 208,000 struck at Philadelphia and Denver respectively.',
    investmentAdvice: 'Extremely popular with both collectors and silver stackers. The 1921 and 1921-D are the key dates — buy in G-VG condition for the most economical exposure. Common-date Walking Liberties in MS-63 or better are very attractive display coins with significant collector premiums above melt.',
    keyDatesAndRarities: [
      { date: '1916', description: 'First-year issue, relatively scarce', value: 'G-4: $30 | VF-20: $75 | MS-63: $650 | MS-65: $4,000' },
      { date: '1916-D Obverse', description: 'Mintmark on obverse — unique to 1916-D (obverse mint)', value: 'G-4: $55 | VF-20: $175 | MS-63: $1,800 | MS-65: $15,000' },
      { date: '1916-S', description: 'Low first-year mintage', value: 'G-4: $40 | VF-20: $130 | MS-63: $1,100 | MS-65: $8,500' },
      { date: '1921', description: 'Scarcest 20th-century half dollar — 246,000 minted', value: 'G-4: $200 | VF-20: $600 | MS-63: $12,000 | MS-65: $80,000' },
      { date: '1921-D', description: 'Co-key date — only 208,000 struck', value: 'G-4: $250 | VF-20: $700 | MS-63: $16,000 | MS-65: $90,000' },
      { date: '1921-S', description: 'Scarce San Francisco issue', value: 'G-4: $35 | VF-20: $175 | MS-63: $3,200' },
      { date: '1938-D', description: 'Lowest Denver mintage in series — 491,600', value: 'G-4: $60 | VF-20: $100 | MS-63: $450 | MS-65: $2,500' },
    ],
  },
  'Morgan Dollar': {
    years: '1878–1904, 1921',
    composition: '90% silver, 10% copper',
    diameter: '38.1mm',
    weight: '26.73g (0.77344 troy oz silver)',
    designerObverse: 'George T. Morgan',
    designerReverse: 'George T. Morgan',
    totalMinted: 'Over 657 million across all dates/mints',
    numismaticHighlights: 'The most widely collected US coin series. Morgan dollars were produced at five mints (Philadelphia, Carson City, New Orleans, San Francisco, Denver) creating hundreds of date/mint combinations. The Carson City (CC) mintmark is particularly prized — the mint operated from 1870 to 1893. The legendary 1893-S with only 100,000 minted is the key date. Many Morgans survived in mint bags in Treasury vaults until released in the 1960s–1970s GSA sales, meaning high-grade examples of some "common" dates are actually quite rare.',
    investmentAdvice: 'Morgan dollars represent one of the best risk/reward propositions in US numismatics. The combination of silver bullion value, broad collector base, and historical significance creates deep liquidity. Key dates (1893-S, 1895, 1884-S, 1886-O/86) require significant capital but appreciate steadily. GSA Morgan dollars with original sealed holders represent excellent value.',
    keyDatesAndRarities: [
      { date: '1893-S', description: 'The key date of the Morgan series — 100,000 struck', value: 'G-4: $4,500 | VF-20: $12,000 | MS-63: $180,000 | MS-65: $550,000+' },
      { date: '1895 Proof', description: 'Only proof Morgan — no business strikes known', value: 'PF-60: $55,000 | PF-63: $90,000 | PF-65: $175,000' },
      { date: '1889-CC', description: 'Extremely rare Carson City issue — 350,000 minted', value: 'G-4: $750 | VF-20: $3,500 | MS-63: $90,000' },
      { date: '1879-CC', description: 'First Carson City Morgan — low mintage', value: 'G-4: $150 | VF-20: $800 | MS-63: $16,000 | MS-65: $75,000' },
      { date: '1881-CC', description: 'Very popular CC date in high grade', value: 'G-4: $120 | VF-20: $275 | MS-63: $1,200 | MS-65: $3,500' },
      { date: '1884-CC', description: 'One of the more available CC Morgans', value: 'G-4: $100 | VF-20: $210 | MS-63: $650 | MS-65: $2,200' },
      { date: '1885-CC', description: 'Low mintage — 228,000 struck', value: 'G-4: $280 | VF-20: $550 | MS-63: $1,600 | MS-65: $5,500' },
      { date: '1893-CC', description: 'Last CC Morgan — scarce', value: 'G-4: $475 | VF-20: $1,800 | MS-63: $45,000' },
      { date: '1901', description: 'Conditionally rare — common in low grade but rare MS', value: 'G-4: $40 | VF-20: $80 | MS-63: $12,000 | MS-65: $185,000' },
      { date: '1921', description: 'Last year Morgan — high mintage but still popular', value: 'G-4: $22 | VF-20: $28 | MS-63: $85 | MS-65: $350' },
      { date: '1878 8 Tail Feathers', description: 'First-year issue — 8 tail feathers variety', value: 'G-4: $35 | VF-20: $55 | MS-63: $350 | MS-65: $2,500' },
      { date: '1878 7/8 TF', description: 'Overdate — 7 feathers over 8 feathers', value: 'G-4: $45 | VF-20: $75 | MS-63: $500 | MS-65: $3,500' },
      { date: '1880-S', description: 'Common date — excellent for high-grade sets', value: 'MS-63: $90 | MS-65: $275 | MS-67: $2,500' },
      { date: '1882-CC', description: 'Very affordable CC Morgan', value: 'G-4: $90 | VF-20: $170 | MS-63: $500 | MS-65: $2,000' },
      { date: '1883-CC', description: 'Popular CC date — good availability in MS', value: 'G-4: $80 | VF-20: $160 | MS-63: $475 | MS-65: $1,800' },
    ],
  },
  'Peace Dollar': {
    years: '1921–1928, 1934–1935',
    composition: '90% silver, 10% copper',
    diameter: '38.1mm',
    weight: '26.73g (0.77344 troy oz silver)',
    designerObverse: 'Anthony de Francisci',
    designerReverse: 'Anthony de Francisci',
    totalMinted: 'Approximately 190 million across all dates/mints',
    numismaticHighlights: 'Struck to commemorate peace after WWI, featuring de Francisci\'s wife Teresa as the model for Liberty. The 1921 high-relief issue is the most dramatically sculpted of all Peace dollars. The 1928 with only 360,000 struck is the key date. The 1964 Peace Dollar was authorized and struck but all were melted before distribution — making any survivor (extremely rare) worth millions.',
    investmentAdvice: 'Peace dollars offer a complete set opportunity at reasonable cost compared to Morgans. The 1921 high relief and 1928 are the two pieces to prioritize. MS-65 common dates are still affordable and make excellent display coins. The series has strong collector demand.',
    keyDatesAndRarities: [
      { date: '1921 High Relief', description: 'First year — dramatic high relief design', value: 'G-4: $125 | VF-20: $250 | MS-63: $1,800 | MS-65: $12,000' },
      { date: '1928', description: 'Key date — only 360,000 minted at Philadelphia', value: 'G-4: $200 | VF-20: $325 | MS-63: $2,800 | MS-65: $15,000' },
      { date: '1928-S', description: 'Scarce San Francisco issue', value: 'G-4: $45 | VF-20: $80 | MS-63: $1,200 | MS-65: $10,000' },
      { date: '1934-S', description: 'Low mintage — 1.01 million', value: 'G-4: $50 | VF-20: $80 | MS-63: $2,500 | MS-65: $35,000' },
      { date: '1925', description: 'Common date — best value for complete set', value: 'G-4: $22 | VF-20: $28 | MS-63: $75 | MS-65: $400' },
      { date: '1923', description: 'Highest mintage in series — good for type set', value: 'G-4: $22 | VF-20: $28 | MS-63: $75 | MS-65: $350' },
    ],
  },
  'Saint-Gaudens Double Eagle': {
    years: '1907–1933',
    composition: '90% gold, 10% copper',
    diameter: '34.0mm',
    weight: '33.436g (0.96750 troy oz gold)',
    designerObverse: 'Augustus Saint-Gaudens',
    designerReverse: 'Augustus Saint-Gaudens',
    totalMinted: 'Approximately 70 million across all dates/mints',
    numismaticHighlights: 'Widely considered the most beautiful US coin ever made. President Theodore Roosevelt commissioned Saint-Gaudens to redesign the coinage in the style of ancient Greek coins. The 1907 Ultra High Relief and High Relief are among the most prized US coins. The 1933 Double Eagle is the most famous and valuable US coin — technically illegal to privately own (one exception: an estate sale example sold for $18.9 million in 2021). The 1927-D is the rarest regular-issue Double Eagle with only 180,000 minted.',
    investmentAdvice: 'Saint-Gaudens Double Eagles are the blue-chip investment of US numismatics. Bullion value provides a strong floor. The 1927-D, 1920-S, 1921, and 1924-D/S/1925-D/S/1926-D/S constitute the "key date" group worth acquiring in any grade. MS-63 and better common dates (1924, 1925, 1926, 1927, 1928) appreciate consistently above gold spot.',
    keyDatesAndRarities: [
      { date: '1907 Ultra High Relief', description: 'Extremely rare pattern — most struck were melted', value: 'VF-30+: $1,500,000–$3,000,000' },
      { date: '1907 High Relief', description: 'First-year spectacular issue — very rare in MS', value: 'VF-20: $10,000 | EF-40: $15,000 | MS-63: $45,000 | MS-65: $120,000' },
      { date: '1927-D', description: 'Rarest regular-issue Double Eagle — 180,000 minted', value: 'MS-62: $1,200,000 | MS-63: $1,800,000+' },
      { date: '1920-S', description: 'Very rare — few survive in any grade', value: 'EF-40: $30,000 | AU-55: $75,000 | MS-62: $250,000' },
      { date: '1921', description: 'Very rare — only 528,500 struck, most melted', value: 'EF-40: $25,000 | AU-55: $65,000 | MS-62: $200,000' },
      { date: '1924', description: 'Common date — excellent for type collecting', value: 'EF-40: $2,100 | MS-63: $2,400 | MS-65: $4,500 | MS-67: $25,000' },
      { date: '1925', description: 'Common date — extremely popular', value: 'EF-40: $2,100 | MS-63: $2,400 | MS-65: $4,500' },
      { date: '1926', description: 'Common date — strong demand', value: 'EF-40: $2,100 | MS-63: $2,400 | MS-65: $5,500' },
      { date: '1928', description: 'Last common date before mass melting orders', value: 'EF-40: $2,100 | MS-63: $2,400 | MS-65: $4,800' },
      { date: '1933', description: 'Technically illegal to own privately — legendary rarity', value: '1 known legal example: $18,900,000 (2021)' },
    ],
  },
  'American Gold Eagle': {
    years: '1986–present',
    composition: '91.67% gold (22 karat), 5.33% silver, 3% copper',
    diameter: '32.7mm (1 oz)',
    weight: '33.931g (1.09 troy oz, 1.000 oz gold)',
    designerObverse: 'Augustus Saint-Gaudens (adapted by Miley Busiek)',
    designerReverse: 'Miley Busiek',
    totalMinted: 'Over 25 million 1-oz coins',
    numismaticHighlights: 'The official gold bullion coin of the United States. Modeled after the famous Saint-Gaudens design. Available in four sizes: 1/10 oz ($5), 1/4 oz ($10), 1/2 oz ($25), and 1 oz ($50). The proof versions (W mint) command significant numismatic premiums. The series includes burnished uncirculated issues from West Point (W) beginning 2006.',
    investmentAdvice: 'The most liquid 22k gold bullion coin in the US market. Spot + 3–5% in bullion grade. Proof (PR-70) versions are the investment targets — their limited mintages and sealed populations create collector demand above spot. The 1999-W Proof and early-series proofs (1986-W, 1987-W) command the highest premiums.',
    keyDatesAndRarities: [
      { date: '1986 Proof (1 oz)', description: 'First-year issue — strong collector premium', value: 'PR-69 DCAM: $2,600 | PR-70 DCAM: $4,500' },
      { date: '1991 Proof (1 oz)', description: 'Lower mintage year', value: 'PR-69 DCAM: $2,450 | PR-70 DCAM: $5,000' },
      { date: '1999-W Proof', description: '1999 proof with W mintmark', value: 'PR-69 DCAM: $2,600 | PR-70 DCAM: $5,500' },
      { date: '2014-W Rev Proof', description: 'Reverse proof — very popular', value: 'PR-70: $3,200' },
      { date: 'Any year bullion (MS)', description: 'Standard bullion grade', value: 'MS-69: Spot + $80–120 | MS-70: Spot + $500–1,000' },
    ],
  },
  'American Silver Eagle': {
    years: '1986–present',
    composition: '.999 fine silver',
    diameter: '40.6mm',
    weight: '31.103g (1.000 troy oz silver)',
    designerObverse: 'Adolph Weinman (Walking Liberty design)',
    designerReverse: 'John Mercanti (heraldic eagle, 1986–2020) / Emily Damstra (2021–present)',
    totalMinted: 'Over 500 million bullion coins',
    numismaticHighlights: 'The official silver bullion coin of the United States and the world\'s best-selling silver bullion coin. Based on Weinman\'s famous Walking Liberty design. Proof versions struck at West Point (W) and San Francisco (S). The 1995-W Proof was the first W-mint Silver Eagle and remains a prized rarity with only 30,125 struck. The 2019-S Enhanced Reverse Proof and 2020-S and 2021-S reverse proofs are modern key dates.',
    investmentAdvice: 'The most recognized silver bullion coin globally, commanding a higher premium than bars due to liquidity and US government guarantee of weight and purity. Key modern numismatic issues (1995-W Proof, 2019-S Enhanced, 2021-S Reverse Proof) represent strong collector investments. Common date proofs in PR-70 DCAM add 20–40% over spot.',
    keyDatesAndRarities: [
      { date: '1995-W Proof', description: 'The key date — only 30,125 struck', value: 'PR-69 DCAM: $4,500 | PR-70 DCAM: $9,000+' },
      { date: '1986 Proof', description: 'First-year issue', value: 'PR-69 DCAM: $80 | PR-70 DCAM: $600' },
      { date: '2019-S Enhanced Reverse Proof', description: 'Extremely popular modern issue', value: 'PR-70: $500–$800' },
      { date: '2021-S Reverse Proof', description: '35th anniversary issue', value: 'PR-70: $350–$500' },
      { date: 'Any year bullion (MS)', description: 'Standard bullion', value: 'MS-69: Spot + $3–5 | MS-70: Spot + $30–80' },
    ],
  },
  'Kennedy Half Dollar': {
    years: '1964–present',
    composition: '1964: 90% silver | 1965–1970: 40% silver | 1971–present: copper-nickel clad',
    diameter: '30.6mm',
    weight: '12.50g (1964) / 11.50g (40% silver) / 11.34g (clad)',
    designerObverse: 'Gilroy Roberts',
    designerReverse: 'Frank Gasparro',
    totalMinted: 'Over 5 billion total',
    numismaticHighlights: 'Issued to honor President John F. Kennedy, struck hurriedly just months after his assassination in November 1963. The 1964 full-silver issue was hoarded by the public and is widely collected. The 1964 accented hair variety (earlier die state) commands a premium. SMS (Special Mint Set) coins from 1965–1967 are collector issues.',
    investmentAdvice: '1964 Kennedy halves in MS-65 and better are undervalued relative to their beauty and historical significance. The 40% silver issues (1965–1970) are excellent for silver stacking. Modern proof issues in PR-70 DCAM provide modest but steady returns.',
    keyDatesAndRarities: [
      { date: '1964 Accented Hair', description: 'Early die state with stronger hair details', value: 'MS-65: $200 | PR-65: $175 | PR-67: $450' },
      { date: '1964', description: 'First-year 90% silver issue', value: 'MS-63: $16 | MS-65: $45 | PR-65: $30 | PR-67: $85' },
      { date: '1970-D', description: 'Only available in mint sets — not sold separately', value: 'MS-63: $12 | MS-65: $55' },
      { date: '1974-D DDO', description: 'Doubled die obverse variety', value: 'MS-65: $55' },
    ],
  },
  'Franklin Half Dollar': {
    years: '1948–1963',
    composition: '90% silver, 10% copper',
    diameter: '30.6mm',
    weight: '12.50g (0.36169 troy oz silver)',
    designerObverse: 'John R. Sinnock',
    designerReverse: 'John R. Sinnock',
    totalMinted: 'Approximately 450 million',
    numismaticHighlights: 'Features Benjamin Franklin on the obverse and the Liberty Bell on the reverse. Full Bell Lines (FBL) designation dramatically affects values — sharp horizontal lines on the Liberty Bell indicate a well-struck coin. The 1955 Franklin is the key date. Many Franklin halves were struck with clashed dies, which can be a popular variety.',
    investmentAdvice: 'Full Bell Lines Franklins in MS-65 represent excellent value — they are far scarcer than their non-FBL counterparts but trade at only a modest premium in many cases. The 1955 in FBL is a prized rarity.',
    keyDatesAndRarities: [
      { date: '1948', description: 'First year issue', value: 'MS-63: $35 | MS-65 FBL: $350 | MS-66 FBL: $2,500' },
      { date: '1955', description: 'Key date — only 2.5 million struck', value: 'MS-63: $150 | MS-65: $500 | MS-65 FBL: $3,500' },
      { date: '1955 FBL', description: 'Key date with full bell lines — rare combination', value: 'MS-65 FBL: $3,500 | MS-66 FBL: $15,000' },
      { date: '1949-S', description: 'Scarce San Francisco issue', value: 'MS-63: $75 | MS-65 FBL: $750' },
      { date: '1963', description: 'Last year issue — very popular', value: 'MS-63: $18 | MS-65: $40 | MS-65 FBL: $125' },
    ],
  },
  'Indian Head Cent': {
    years: '1859–1909',
    composition: '1859–1864: 88% copper, 12% nickel (CN) | 1864–1909: 95% copper, 5% tin/zinc (Bronze)',
    diameter: '19.05mm',
    weight: '4.67g (CN) / 3.11g (Bronze)',
    designerObverse: 'James Barton Longacre',
    designerReverse: 'James Barton Longacre',
    totalMinted: 'Approximately 1.8 billion',
    numismaticHighlights: 'A beautiful Victorian-era design showing Liberty wearing a Native American headdress — not actually a Native American portrait. The series includes the copper-nickel issues (1859–1864) and the bronze issues (1864–1909). The 1877 is the key date with only 852,500 struck. The 1908-S and 1909-S are the only San Francisco-minted Indian Head cents.',
    investmentAdvice: 'A complete set from 1859–1909 is an achievable goal in VG or F condition. The 1877 in any circulated grade is a solid investment. High-grade (MS-65 RB or RD) common dates appreciate steadily.',
    keyDatesAndRarities: [
      { date: '1877', description: 'Key date — only 852,500 struck', value: 'G-4: $350 | VF-20: $700 | MS-63 RB: $8,000 | MS-65 RD: $65,000' },
      { date: '1864-L', description: 'First year of bronze — with designer initial L on ribbon', value: 'G-4: $25 | VF-20: $100 | MS-63 RB: $850' },
      { date: '1908-S', description: 'Only San Francisco Indian Head — one of two S-mints', value: 'G-4: $50 | VF-20: $85 | MS-63 RB: $625 | MS-65 RD: $5,000' },
      { date: '1909-S', description: 'Last San Francisco Indian Head — 309,000 minted', value: 'G-4: $250 | VF-20: $425 | MS-63 RB: $3,000 | MS-65 RD: $18,000' },
      { date: '1871', description: 'Scarce early date', value: 'G-4: $50 | VF-20: $145 | MS-63 RB: $2,500' },
      { date: '1872', description: 'Scarce early date', value: 'G-4: $55 | VF-20: $150 | MS-63 RB: $2,800' },
    ],
  },
  'Morgan Dollar (Type Set)': {
    years: '1878–1921',
    composition: '90% silver, 10% copper',
    diameter: '38.1mm',
    weight: '26.73g (0.77344 troy oz silver)',
    designerObverse: 'George T. Morgan',
    designerReverse: 'George T. Morgan',
    totalMinted: 'Over 657 million',
    numismaticHighlights: 'The Morgan dollar type set concept allows collectors to focus on one example from each mint rather than every date. The five mint series: Philadelphia (no mintmark), Carson City (CC), New Orleans (O), San Francisco (S), and Denver (D, 1921 only). Each mint produced distinctly different quality levels — San Francisco was known for the sharpest strikes; New Orleans produced the most weak strikes.',
    investmentAdvice: 'Type set collecting is the ideal entry strategy for Morgan dollars. A set with one example from each mint in MS-62 or better can be assembled for under $2,000. Focus on high-grade S-mint examples for investment — the San Francisco Morgan dollar is the benchmark quality issue.',
    keyDatesAndRarities: [
      { date: 'Common Date MS-63', description: 'Philadelphia or San Francisco, strong grade', value: '$75–$120' },
      { date: 'Common Date MS-65', description: 'Premium grade — strong investment tier', value: '$250–$500' },
      { date: 'Carson City (CC) any date', description: 'Premium over Philadelphia for same grade', value: 'Add 50–100% premium for CC mintmark' },
      { date: 'New Orleans (O) dates', description: 'Generally weaker strikes', value: 'G-4: $22 | MS-63: $80–$200 depending on date' },
    ],
  },
};

// ─── Grade Scale Reference ────────────────────────────────────────────────────

export const GRADE_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  'P-1':   { label: 'Poor', description: 'Barely identifiable. Heavily worn.' },
  'FR-2':  { label: 'Fair', description: 'Heavily worn — major details visible.' },
  'AG-3':  { label: 'About Good', description: 'Very heavily worn, design clear but flat.' },
  'G-4':   { label: 'Good', description: 'Major design elements visible but worn smooth.' },
  'G-6':   { label: 'Good+', description: 'Better than G-4, some design texture remains.' },
  'VG-8':  { label: 'Very Good', description: 'Design clearly visible with some fine detail.' },
  'VG-10': { label: 'Very Good+', description: 'Better than VG-8.' },
  'F-12':  { label: 'Fine', description: 'Moderate even wear across all high points.' },
  'F-15':  { label: 'Fine+', description: 'Better than F-12.' },
  'VF-20': { label: 'Very Fine', description: 'Light to moderate wear, major details sharp.' },
  'VF-25': { label: 'Very Fine+', description: 'Better than VF-20.' },
  'VF-30': { label: 'Choice Very Fine', description: 'Light even wear across all surfaces.' },
  'VF-35': { label: 'Choice Very Fine+', description: 'Better than VF-30.' },
  'EF-40': { label: 'Extremely Fine', description: 'Light wear on high points only, all detail sharp.' },
  'EF-45': { label: 'Choice Extremely Fine', description: 'Slight wear on high points, nearly uncirculated.' },
  'AU-50': { label: 'About Uncirculated', description: 'Slight wear on highest points, mint luster visible.' },
  'AU-55': { label: 'Choice About Uncirculated', description: 'Minor wear only, significant luster remains.' },
  'AU-58': { label: 'Choice AU', description: 'Barely perceptible wear, nearly full luster.' },
  'MS-60': { label: 'Mint State Basal', description: 'No wear but many heavy contact marks.' },
  'MS-61': { label: 'Mint State', description: 'No wear, heavy marks and blemishes.' },
  'MS-62': { label: 'Mint State', description: 'No wear, some heavy marks but better eye appeal.' },
  'MS-63': { label: 'Choice Uncirculated', description: 'No wear, a few moderate contact marks.' },
  'MS-64': { label: 'Choice Uncirculated+', description: 'No wear, minor marks, good eye appeal.' },
  'MS-65': { label: 'Gem Uncirculated', description: 'No wear, strong luster, few minor marks.' },
  'MS-66': { label: 'Gem Uncirculated+', description: 'Exceptional luster and eye appeal.' },
  'MS-67': { label: 'Superb Gem', description: 'Nearly perfect. Exceptional in all respects.' },
  'MS-68': { label: 'Superb Gem+', description: 'Only the slightest imperfections under magnification.' },
  'MS-69': { label: 'Near Perfect', description: 'Virtually perfect with very minor flaws.' },
  'MS-70': { label: 'Perfect Uncirculated', description: 'Perfect coin — no flaws under 8x magnification.' },
  'PR-60': { label: 'Proof', description: 'Proof — impaired, heavy marks.' },
  'PR-63': { label: 'Choice Proof', description: 'Proof with a few noticeable blemishes.' },
  'PR-65': { label: 'Gem Proof', description: 'Proof with strong cameo contrast, few marks.' },
  'PR-67': { label: 'Superb Gem Proof', description: 'Near-perfect proof.' },
  'PR-69': { label: 'Near Perfect Proof', description: 'Virtually perfect proof.' },
  'PR-70': { label: 'Perfect Proof', description: 'Perfect coin with no flaws.' },
};

// ─── Standard Grade Points for Tabular Display ───────────────────────────────
export const STANDARD_GRADE_POINTS = ['G-4', 'VG-8', 'F-12', 'VF-20', 'EF-40', 'AU-50', 'MS-60', 'MS-63', 'MS-65'];

// ─── Lookup function ─────────────────────────────────────────────────────────
export function getCoinSeries(coinName: string): SeriesOverview | null {
  const name = coinName.toLowerCase();
  // First pass: exact key match within coin name (longest match wins)
  let bestMatch: SeriesOverview | null = null;
  let bestMatchLength = 0;
  for (const [key, data] of Object.entries(SERIES_OVERVIEW)) {
    const k = key.toLowerCase();
    if (name.includes(k) && k.length > bestMatchLength) {
      bestMatch = data;
      bestMatchLength = k.length;
    }
  }
  if (bestMatch) return bestMatch;
  // Second pass: coin name is contained in the key (e.g., "Morgan" in "Morgan Dollar")
  for (const [key, data] of Object.entries(SERIES_OVERVIEW)) {
    const k = key.toLowerCase();
    const words = name.split(' ').filter(w => w.length > 4);
    if (words.some(w => k.includes(w))) {
      return data;
    }
  }
  return null;
}

export function getSeriesKeyDates(coinName: string): SeriesOverview['keyDatesAndRarities'] {
  const data = getCoinSeries(coinName);
  return data?.keyDatesAndRarities || [];
}
