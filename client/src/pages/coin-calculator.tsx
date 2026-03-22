import { useState, useMemo } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, DollarSign, Scale, RefreshCw, ChevronDown } from "lucide-react";

// ─── Coin Data ────────────────────────────────────────────────────────────────
// ASW / AGW = Actual Silver/Gold Weight in troy oz

type Metal = "silver" | "gold";

interface CoinSpec {
  name: string;
  metal: Metal;
  metalOz: number;       // troy oz of actual metal per coin
  faceValue?: number;    // USD face value
  purity: number;        // 0–1
  notes?: string;
}

const COINS: Record<string, CoinSpec[]> = {
  "Junk Silver — 90%": [
    { name: "Morgan Dollar (1878–1921)",         metal: "silver", metalOz: 0.7734, faceValue: 1.00,  purity: 0.900 },
    { name: "Peace Dollar (1921–1935)",           metal: "silver", metalOz: 0.7734, faceValue: 1.00,  purity: 0.900 },
    { name: "Walking Liberty Half Dollar",        metal: "silver", metalOz: 0.3617, faceValue: 0.50,  purity: 0.900 },
    { name: "Franklin Half Dollar (1948–63)",     metal: "silver", metalOz: 0.3617, faceValue: 0.50,  purity: 0.900 },
    { name: "Kennedy Half Dollar (1964)",         metal: "silver", metalOz: 0.3617, faceValue: 0.50,  purity: 0.900 },
    { name: "Washington Quarter (pre-1965)",      metal: "silver", metalOz: 0.1809, faceValue: 0.25,  purity: 0.900 },
    { name: "Standing Liberty Quarter",           metal: "silver", metalOz: 0.1809, faceValue: 0.25,  purity: 0.900 },
    { name: "Barber Quarter",                     metal: "silver", metalOz: 0.1809, faceValue: 0.25,  purity: 0.900 },
    { name: "Mercury Dime (1916–45)",             metal: "silver", metalOz: 0.07234, faceValue: 0.10, purity: 0.900 },
    { name: "Roosevelt Dime (pre-1965)",          metal: "silver", metalOz: 0.07234, faceValue: 0.10, purity: 0.900 },
    { name: "Barber Dime",                        metal: "silver", metalOz: 0.07234, faceValue: 0.10, purity: 0.900 },
  ],
  "Junk Silver — 40%": [
    { name: "Kennedy Half Dollar (1965–70)",      metal: "silver", metalOz: 0.1479, faceValue: 0.50,  purity: 0.400, notes: "40% silver" },
  ],
  "Junk Silver — 35%": [
    { name: "War Nickel (1942–45)",               metal: "silver", metalOz: 0.05626, faceValue: 0.05, purity: 0.350, notes: "35% silver" },
  ],
  "US Bullion — Silver": [
    { name: "American Silver Eagle",              metal: "silver", metalOz: 1.0000, faceValue: 1.00,  purity: 0.999 },
  ],
  "US Bullion — Gold": [
    { name: "American Gold Eagle (1 oz)",         metal: "gold",   metalOz: 1.0000, faceValue: 50.00, purity: 0.9167 },
    { name: "American Gold Eagle (½ oz)",         metal: "gold",   metalOz: 0.5000, faceValue: 25.00, purity: 0.9167 },
    { name: "American Gold Eagle (¼ oz)",         metal: "gold",   metalOz: 0.2500, faceValue: 10.00, purity: 0.9167 },
    { name: "American Gold Eagle (1/10 oz)",      metal: "gold",   metalOz: 0.1000, faceValue: 5.00,  purity: 0.9167 },
    { name: "American Gold Buffalo (1 oz)",       metal: "gold",   metalOz: 1.0000, faceValue: 50.00, purity: 0.9999 },
    { name: "American Gold Buffalo (½ oz)",       metal: "gold",   metalOz: 0.5000, faceValue: 25.00, purity: 0.9999, notes: "2008 only" },
    { name: "American Gold Buffalo (¼ oz)",       metal: "gold",   metalOz: 0.2500, faceValue: 10.00, purity: 0.9999, notes: "2008 only" },
    { name: "American Gold Buffalo (1/10 oz)",    metal: "gold",   metalOz: 0.1000, faceValue: 5.00,  purity: 0.9999, notes: "2008 only" },
    { name: "American Liberty Gold (1 oz)",       metal: "gold",   metalOz: 1.0000, faceValue: 100.00, purity: 0.9999, notes: "2015–present" },
    { name: "First Spouse Gold (½ oz)",           metal: "gold",   metalOz: 0.5000, faceValue: 10.00, purity: 0.9999, notes: "2007–2016" },
  ],
  "World Silver": [
    { name: "Canadian Silver Maple Leaf (1 oz)",  metal: "silver", metalOz: 1.0000, purity: 0.9999 },
    { name: "British Silver Britannia (1 oz)",    metal: "silver", metalOz: 1.0000, purity: 0.999  },
    { name: "Austrian Silver Philharmonic (1 oz)",metal: "silver", metalOz: 1.0000, purity: 0.999  },
    { name: "Mexican Silver Libertad (1 oz)",     metal: "silver", metalOz: 1.0000, purity: 0.999  },
  ],
  "World Gold": [
    { name: "South African Krugerrand (1 oz)",    metal: "gold",   metalOz: 1.0000, purity: 0.9167 },
    { name: "Canadian Gold Maple Leaf (1 oz)",    metal: "gold",   metalOz: 1.0000, purity: 0.9999 },
    { name: "British Gold Britannia (1 oz)",      metal: "gold",   metalOz: 1.0000, purity: 0.9999 },
    { name: "Austrian Gold Philharmonic (1 oz)",  metal: "gold",   metalOz: 1.0000, purity: 0.9999 },
  ],
  "Vintage US Gold — Double Eagle ($20)": [
    { name: "Liberty Head Type 1 — No Motto ($20, 1850–1866)",              metal: "gold", metalOz: 0.9675, faceValue: 20.00, purity: 0.900 },
    { name: "Liberty Head Type 2 — Motto, \"Twenty D.\" ($20, 1866–1876)", metal: "gold", metalOz: 0.9675, faceValue: 20.00, purity: 0.900 },
    { name: "Liberty Head Type 3 — Motto, \"Twenty Dollars\" ($20, 1877–1907)", metal: "gold", metalOz: 0.9675, faceValue: 20.00, purity: 0.900 },
    { name: "Saint-Gaudens High Relief ($20, 1907)",                         metal: "gold", metalOz: 0.9675, faceValue: 20.00, purity: 0.900, notes: "Ultra High/High Relief — extremely rare" },
    { name: "Saint-Gaudens — No Motto ($20, 1907–1908)",                    metal: "gold", metalOz: 0.9675, faceValue: 20.00, purity: 0.900 },
    { name: "Saint-Gaudens — With Motto \"In God We Trust\" ($20, 1908–1933)", metal: "gold", metalOz: 0.9675, faceValue: 20.00, purity: 0.900 },
  ],
  "Vintage US Gold — Eagle ($10)": [
    { name: "Capped Bust Right, Small Eagle Reverse ($10, 1795–1797)",  metal: "gold", metalOz: 0.5157, faceValue: 10.00, purity: 0.9167, notes: "22k — first US eagle design" },
    { name: "Capped Bust Right, Heraldic Eagle Reverse ($10, 1797–1804)", metal: "gold", metalOz: 0.5157, faceValue: 10.00, purity: 0.9167, notes: "22k — pre-1834 standard" },
    { name: "Liberty Head — No Motto ($10, 1838–1866)",                 metal: "gold", metalOz: 0.4839, faceValue: 10.00, purity: 0.900 },
    { name: "Liberty Head — With Motto \"In God We Trust\" ($10, 1866–1907)", metal: "gold", metalOz: 0.4839, faceValue: 10.00, purity: 0.900 },
    { name: "Indian Head ($10, 1907–1933)",                              metal: "gold", metalOz: 0.4839, faceValue: 10.00, purity: 0.900 },
  ],
  "Vintage US Gold — Half Eagle ($5)": [
    { name: "Capped Bust Right, Small Eagle Reverse ($5, 1795–1798)",   metal: "gold", metalOz: 0.2579, faceValue: 5.00, purity: 0.9167, notes: "22k — first US gold coin" },
    { name: "Capped Bust Right, Heraldic Eagle Reverse ($5, 1795–1807)", metal: "gold", metalOz: 0.2579, faceValue: 5.00, purity: 0.9167, notes: "22k" },
    { name: "Capped Bust Left / Draped Bust ($5, 1807–1812)",           metal: "gold", metalOz: 0.2579, faceValue: 5.00, purity: 0.9167, notes: "22k" },
    { name: "Capped Head, Large Diameter ($5, 1813–1829)",              metal: "gold", metalOz: 0.2579, faceValue: 5.00, purity: 0.9167, notes: "22k" },
    { name: "Capped Head, Reduced Diameter ($5, 1829–1834)",            metal: "gold", metalOz: 0.2579, faceValue: 5.00, purity: 0.9167, notes: "22k" },
    { name: "Classic Head ($5, 1834–1838)",                             metal: "gold", metalOz: 0.2416, faceValue: 5.00, purity: 0.8992 },
    { name: "Liberty Head — No Motto ($5, 1839–1866)",                  metal: "gold", metalOz: 0.2419, faceValue: 5.00, purity: 0.900 },
    { name: "Liberty Head — With Motto \"In God We Trust\" ($5, 1866–1908)", metal: "gold", metalOz: 0.2419, faceValue: 5.00, purity: 0.900 },
    { name: "Indian Head ($5, 1908–1929)",                              metal: "gold", metalOz: 0.2419, faceValue: 5.00, purity: 0.900 },
  ],
  "Vintage US Gold — Quarter Eagle ($2.50)": [
    { name: "Capped Bust Right, No Stars ($2.50, 1796)",                metal: "gold", metalOz: 0.1289, faceValue: 2.50, purity: 0.9167, notes: "22k — only 963 known, one of rarest US coins" },
    { name: "Capped Bust Right, Stars ($2.50, 1796–1807)",              metal: "gold", metalOz: 0.1289, faceValue: 2.50, purity: 0.9167, notes: "22k" },
    { name: "Capped Bust Left — 1808 only ($2.50, 1808)",               metal: "gold", metalOz: 0.1289, faceValue: 2.50, purity: 0.9167, notes: "22k — single year issue, 2,710 struck" },
    { name: "Capped Head, Large Diameter ($2.50, 1821–1827)",           metal: "gold", metalOz: 0.1289, faceValue: 2.50, purity: 0.9167, notes: "22k" },
    { name: "Capped Head, Reduced Diameter ($2.50, 1829–1834)",         metal: "gold", metalOz: 0.1289, faceValue: 2.50, purity: 0.9167, notes: "22k" },
    { name: "Classic Head ($2.50, 1834–1839)",                          metal: "gold", metalOz: 0.1209, faceValue: 2.50, purity: 0.8992 },
    { name: "Liberty Head / Coronet ($2.50, 1840–1907)",                metal: "gold", metalOz: 0.1209, faceValue: 2.50, purity: 0.900 },
    { name: "Indian Head ($2.50, 1908–1929)",                           metal: "gold", metalOz: 0.1209, faceValue: 2.50, purity: 0.900 },
  ],
  "Vintage US Gold — Three Dollar & Dollar": [
    { name: "Three Dollar Gold Indian Princess ($3, 1854–1889)",             metal: "gold", metalOz: 0.1451, faceValue: 3.00, purity: 0.900 },
    { name: "Gold Dollar Type 1 — Liberty Head ($1, 1849–1854)",            metal: "gold", metalOz: 0.04837, faceValue: 1.00, purity: 0.900 },
    { name: "Gold Dollar Type 2 — Indian Princess Small Head ($1, 1854–1856)", metal: "gold", metalOz: 0.04837, faceValue: 1.00, purity: 0.900, notes: "Only 3 years struck" },
    { name: "Gold Dollar Type 3 — Indian Princess Large Head ($1, 1856–1889)", metal: "gold", metalOz: 0.04837, faceValue: 1.00, purity: 0.900 },
  ],
};

const ALL_COINS: CoinSpec[] = Object.values(COINS).flat();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const fmtUSD = (n: number) =>
  "$" + fmt(n, 2);

// ─── Junk Silver Bag Calculator ───────────────────────────────────────────────
// Industry standard: $1 face value of 90% silver = 0.715 troy oz (accounts for wear)
// Theoretical: 0.7234 oz. We offer both.
const JUNK_90_PER_DOLLAR  = 0.715;   // industry "bag" standard (worn)
const JUNK_90_THEO        = 0.7234;  // theoretical (uncirculated)
const JUNK_40_PER_DOLLAR  = 0.2950;
const JUNK_35_PER_NICKEL  = 0.05626; // per coin (not per dollar)

function JunkSilverTab({ silverSpot }: { silverSpot: number }) {
  const [purity, setPurity] = useState<"90" | "40" | "35">("90");
  const [faceValue, setFaceValue] = useState("");
  const [qty, setQty] = useState("");
  const [mode, setMode] = useState<"face" | "qty">("face");

  const ozPerDollar = purity === "90" ? JUNK_90_PER_DOLLAR
                    : purity === "40" ? JUNK_40_PER_DOLLAR
                    : JUNK_35_PER_NICKEL;

  const totalOz = useMemo(() => {
    if (mode === "face") {
      const fv = parseFloat(faceValue) || 0;
      return purity === "35" ? fv * JUNK_35_PER_NICKEL : fv * ozPerDollar;
    } else {
      const q = parseFloat(qty) || 0;
      if (purity === "90") return q * JUNK_90_PER_DOLLAR;
      if (purity === "40") return q * JUNK_40_PER_DOLLAR;
      return q * JUNK_35_PER_NICKEL;
    }
  }, [mode, faceValue, qty, purity, ozPerDollar]);

  const meltValue = totalOz * silverSpot;

  const theoreticalOz = useMemo(() => {
    if (purity !== "90") return null;
    if (mode === "face") return (parseFloat(faceValue) || 0) * JUNK_90_THEO;
    return (parseFloat(qty) || 0) * JUNK_90_THEO;
  }, [mode, faceValue, qty, purity]);

  const rows = [
    { label: "90% Junk Silver",   hint: "Pre-1965 halves, quarters, dimes, dollars" },
    { label: "40% Kennedy Half",  hint: "Kennedy Half Dollars 1965–1970" },
    { label: "35% War Nickel",    hint: "Nickels minted 1942–1945" },
  ];

  return (
    <div className="space-y-5">
      {/* Purity selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Silver Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(["90","40","35"] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPurity(p); setFaceValue(""); setQty(""); }}
              className="py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                background: purity === p ? "var(--primary)" : "rgba(255,255,255,0.06)",
                color: purity === p ? "#fff" : "var(--foreground)",
                border: `1px solid ${purity === p ? "var(--primary)" : "rgba(255,255,255,0.12)"}`,
              }}
            >
              {p}% Silver
            </button>
          ))}
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
          {rows.find((_,i) => (["90","40","35"])[i] === purity)?.hint}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
        {[{ id: "face" as const, label: "By Face Value ($)" }, { id: "qty" as const, label: "By Coin Count" }].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: mode === m.id ? "var(--primary)" : "transparent",
              color: mode === m.id ? "#fff" : "var(--muted-foreground)",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input */}
      {mode === "face" ? (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>
            Face Value (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: "var(--primary)" }}>$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 100"
              value={faceValue}
              onChange={e => setFaceValue(e.target.value)}
              className="w-full pl-9 pr-4 py-3.5 rounded-xl text-lg font-semibold outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
            {purity === "35" ? "Enter number of War Nickels" : `Enter total face value — e.g. $100 = a small bag of mixed ${purity}% coins`}
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Number of Coins</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 40"
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl text-lg font-semibold outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
      )}

      {/* Results */}
      {totalOz > 0 && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--primary)" }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Silver Ounces (industry std)</span>
            <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{fmt(totalOz, 4)} oz</span>
          </div>
          {theoreticalOz && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Silver Ounces (theoretical)</span>
              <span className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>{fmt(theoreticalOz, 4)} oz</span>
            </div>
          )}
          <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Silver Spot</span>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{fmtUSD(silverSpot)}/oz</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-base font-bold" style={{ color: "var(--foreground)" }}>Melt Value</span>
            <span className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>{fmtUSD(meltValue)}</span>
          </div>
        </div>
      )}

      {/* Reference table */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Quick Reference — 90% Silver</p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            { face: "$1.00 (10 dimes)",    oz: 0.715,  label: "Standard bag weight" },
            { face: "$1.00 (4 quarters)",  oz: 0.715,  label: "Standard bag weight" },
            { face: "$1.00 (2 halves)",    oz: 0.715,  label: "Standard bag weight" },
            { face: "$100 face",           oz: 71.5,   label: "Common dealer unit" },
            { face: "$1,000 bag",          oz: 715,    label: "Full junk silver bag" },
          ].map((r, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-2.5 text-xs" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent" }}>
              <span style={{ color: "var(--foreground)" }}>{r.face}</span>
              <span style={{ color: "var(--primary)" }}>{fmt(r.oz, 3)} oz Ag</span>
              <span style={{ color: "var(--muted-foreground)" }}>{fmtUSD(r.oz * silverSpot)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Individual Coin Calculator ────────────────────────────────────────────────
function CoinPickerTab({ silverSpot, goldSpot, groups }: { silverSpot: number; goldSpot: number; groups: string[] }) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [selectedCoin, setSelectedCoin] = useState<CoinSpec>(COINS[groups[0]][0]);
  const [qty, setQty] = useState("");

  const spot = selectedCoin.metal === "silver" ? silverSpot : goldSpot;
  const perCoin = selectedCoin.metalOz * spot;
  const total = perCoin * (parseFloat(qty) || 0);
  const totalOz = selectedCoin.metalOz * (parseFloat(qty) || 0);

  return (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Category</label>
        <div className="relative">
          <select
            value={selectedGroup}
            onChange={e => {
              setSelectedGroup(e.target.value);
              setSelectedCoin(COINS[e.target.value][0]);
              setQty("");
            }}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-xl text-sm font-medium outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
        </div>
      </div>

      {/* Coin */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Coin</label>
        <div className="relative">
          <select
            value={selectedCoin.name}
            onChange={e => {
              const coin = COINS[selectedGroup].find(c => c.name === e.target.value);
              if (coin) setSelectedCoin(coin);
            }}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-xl text-sm font-medium outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            {COINS[selectedGroup].map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
        </div>
        <div className="flex gap-3 mt-2">
          <Badge variant="outline" className="text-xs" style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
            {(selectedCoin.purity * 100).toFixed(1)}% {selectedCoin.metal === "silver" ? "Ag" : "Au"}
          </Badge>
          <Badge variant="outline" className="text-xs" style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--muted-foreground)" }}>
            {fmt(selectedCoin.metalOz, 4)} troy oz / coin
          </Badge>
          {selectedCoin.faceValue && (
            <Badge variant="outline" className="text-xs" style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--muted-foreground)" }}>
              ${selectedCoin.faceValue.toFixed(2)} face
            </Badge>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>Quantity</label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Enter number of coins"
          value={qty}
          onChange={e => setQty(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl text-lg font-semibold outline-none"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        />
      </div>

      {/* Per Coin result (always visible) */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Per Coin</p>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Metal weight</span>
          <span className="font-semibold" style={{ color: "var(--foreground)" }}>{fmt(selectedCoin.metalOz, 4)} oz</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{selectedCoin.metal === "silver" ? "Silver" : "Gold"} spot</span>
          <span className="font-semibold" style={{ color: "var(--foreground)" }}>{fmtUSD(spot)}/oz</span>
        </div>
        <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Melt Value / coin</span>
          <span className="text-xl font-extrabold" style={{ color: "var(--primary)" }}>{fmtUSD(perCoin)}</span>
        </div>
      </div>

      {/* Total when qty > 0 */}
      {(parseFloat(qty) || 0) > 0 && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--primary)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Total for {qty} coins</p>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total metal</span>
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>{fmt(totalOz, 4)} oz</span>
          </div>
          <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="text-base font-bold" style={{ color: "var(--foreground)" }}>Total Melt Value</span>
            <span className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>{fmtUSD(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoinCalculator() {
  const { prices, isLoading } = useLivePricing();

  const silverSpot = prices?.silver ?? 0;
  const goldSpot   = prices?.gold   ?? 0;

  const junkGroups     = ["Junk Silver — 90%", "Junk Silver — 40%", "Junk Silver — 35%"];
  const bullionGroups  = ["US Bullion — Silver", "US Bullion — Gold", "World Silver", "World Gold"];
  const vintageGroups  = [
    "Vintage US Gold — Double Eagle ($20)",
    "Vintage US Gold — Eagle ($10)",
    "Vintage US Gold — Half Eagle ($5)",
    "Vintage US Gold — Quarter Eagle ($2.50)",
    "Vintage US Gold — Three Dollar & Dollar",
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Coins className="w-7 h-7" style={{ color: "var(--primary)" }} />
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
              Coin Calculator
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Live melt value for junk silver, bullion & vintage coins
          </p>
        </div>

        {/* Live Spot Strip */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Silver Spot", value: silverSpot, icon: <Scale className="w-4 h-4" />, suffix: "/oz" },
            { label: "Gold Spot",   value: goldSpot,   icon: <TrendingUp className="w-4 h-4" />, suffix: "/oz" },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)", color: "#fff" }}>
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
                {isLoading ? (
                  <div className="h-5 w-20 rounded animate-pulse mt-0.5" style={{ background: "rgba(255,255,255,0.1)" }} />
                ) : (
                  <p className="text-base font-bold" style={{ color: "var(--primary)" }}>
                    {fmtUSD(item.value)}<span className="text-xs font-normal ml-0.5" style={{ color: "var(--muted-foreground)" }}>{item.suffix}</span>
                  </p>
                )}
              </div>
              {!isLoading && (
                <RefreshCw className="w-3 h-3 ml-auto animate-spin opacity-30" style={{ color: "var(--primary)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Main Calculator Tabs */}
        <Card style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
          <CardContent className="p-0">
            <Tabs defaultValue="junk">
              <TabsList className="w-full rounded-t-xl rounded-b-none grid grid-cols-3 h-12" style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--border)" }}>
                <TabsTrigger value="junk"    className="text-xs font-semibold rounded-none rounded-tl-xl data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white">
                  Junk Silver
                </TabsTrigger>
                <TabsTrigger value="coins"   className="text-xs font-semibold rounded-none data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white">
                  Coin Picker
                </TabsTrigger>
                <TabsTrigger value="vintage" className="text-xs font-semibold rounded-none rounded-tr-xl data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white">
                  Vintage Gold
                </TabsTrigger>
              </TabsList>

              <div className="p-5">
                <TabsContent value="junk" className="mt-0">
                  <JunkSilverTab silverSpot={silverSpot} />
                </TabsContent>

                <TabsContent value="coins" className="mt-0">
                  <CoinPickerTab
                    silverSpot={silverSpot}
                    goldSpot={goldSpot}
                    groups={[...junkGroups, ...bullionGroups]}
                  />
                </TabsContent>

                <TabsContent value="vintage" className="mt-0">
                  <CoinPickerTab
                    silverSpot={silverSpot}
                    goldSpot={goldSpot}
                    groups={vintageGroups}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: "var(--primary)" }}>
                <DollarSign className="w-4 h-4" /> Junk Silver Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                $1 face value of 90% pre-1965 US coins = <strong className="text-white">0.715 troy oz</strong> of silver (industry bag standard, accounts for wear). Theoretical uncirculated = 0.7234 oz.
              </p>
            </CardContent>
          </Card>

          <Card style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: "var(--primary)" }}>
                <Scale className="w-4 h-4" /> Troy Ounce vs. Gram
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                All precious metals trade by the <strong className="text-white">troy ounce</strong> (31.1035g) — not the standard ounce (28.35g). All calculations here use troy oz.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs pb-4" style={{ color: "var(--muted-foreground)" }}>
          Melt values are for reference only. Numismatic (collector) value may exceed melt value significantly.
        </p>
      </div>

      <Footer />
    </div>
  );
}
