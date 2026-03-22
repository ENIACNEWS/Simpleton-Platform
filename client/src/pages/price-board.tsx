/**
 * MOTOR CITY PRICE BOARD
 * Route: /price-board
 *
 * Live digital version of the whiteboard.
 * Designed for a large TV or monitor behind the counter.
 * - Updates every 30 seconds from live spot
 * - All prices rounded to nearest $1
 * - Shows loan and sell columns for all karats
 * - Full screen, high contrast, readable from 10+ feet
 * - Includes silver coins section (face value multipliers)
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPricing } from '@/lib/pricing-api';
import { Maximize2, Minimize2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const TROY = 31.1034768;

// ── Algorithm (from MCPB whiteboard) ─────────────────────────────────────────
// These are adjustable via the settings panel on screen
const DEFAULT_CONFIG = {
  goldLoanPct:     0.79,   // 79% of melt
  goldSellSpread:  4.00,   // +$4/gram over loan
  silverLoanPct:   0.39,   // 39% of melt
  silverSellSpread:0.25,   // +$0.25/gram over loan
  platLoanPct:     0.75,   // 75% of melt
  platSellSpread:  4.00,   // +$4/gram over loan
};

// Round to nearest $1 (no cents on the board)
const round1 = (n: number) => Math.round(n);

// Gold karats to display (matching your board)
const GOLD_KARATS = [
  { label: '10kt', purity: 41.7 },
  { label: '14kt', purity: 58.3 },
  { label: '18kt', purity: 75.0 },
  { label: '21kt', purity: 87.5 },
  { label: '22kt', purity: 91.7 },
  { label: '24kt', purity: 99.9 },
];

const SILVER_COINS = [
  { label: 'Pre-1964 Silver Coins',      loanMult: 30, sellMult: 35, unit: 'x Face' },
  { label: '1965-1970 Half Dollars',     loanMult: 12, sellMult: 14, unit: 'x Face' },
  { label: 'Pre-1935 Silver Dollars',    loanFixed: 30, sellFixed: 40, unit: '/coin' },
  { label: 'Canadian Silver',            loanMult: 12, sellMult: 14, unit: 'x Face' },
];

function calcGoldRates(spotPerOz: number, cfg = DEFAULT_CONFIG) {
  if (!spotPerOz || spotPerOz <= 0) return {};
  const perGram = spotPerOz / TROY;
  const result: Record<string, { loan: number; sell: number; melt: number }> = {};
  GOLD_KARATS.forEach(({ label, purity }) => {
    const melt = perGram * (purity / 100);
    const loan = round1(melt * cfg.goldLoanPct);
    const sell = round1(loan + cfg.goldSellSpread);
    result[label] = { loan, sell, melt };
  });
  return result;
}

function calcSilverRates(spotPerOz: number, cfg = DEFAULT_CONFIG) {
  if (!spotPerOz || spotPerOz <= 0) return { loan: 0, sell: 0, melt: 0 };
  const perGram = spotPerOz / TROY;
  const loan = Math.round(perGram * cfg.silverLoanPct * 100) / 100;
  const sell = Math.round((loan + cfg.silverSellSpread) * 100) / 100;
  return { loan, sell, melt: perGram };
}

function calcPlatRates(spotPerOz: number, cfg = DEFAULT_CONFIG) {
  if (!spotPerOz || spotPerOz <= 0) return { loan: 0, sell: 0 };
  const perGram = spotPerOz / TROY;
  const loan = round1(perGram * cfg.platLoanPct);
  const sell = round1(loan + cfg.platSellSpread);
  return { loan, sell };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriceBoard() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastChange, setLastChange] = useState<Record<string, 'up' | 'down' | null>>({});
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Live prices
  const { data: prices, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['live-pricing-v3'],
    queryFn: fetchLatestPricing,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const gold = (prices as any)?.gold || 0;
  const silver = (prices as any)?.silver || 0;
  const platinum = (prices as any)?.platinum || 0;

  // Track price changes for flash animation
  useEffect(() => {
    if (!gold && !silver) return;
    const changes: Record<string, 'up' | 'down' | null> = {};
    if (prevPrices.gold && gold) changes.gold = gold > prevPrices.gold ? 'up' : gold < prevPrices.gold ? 'down' : null;
    if (prevPrices.silver && silver) changes.silver = silver > prevPrices.silver ? 'up' : silver < prevPrices.silver ? 'down' : null;
    if (prevPrices.platinum && platinum) changes.platinum = platinum > prevPrices.platinum ? 'up' : platinum < prevPrices.platinum ? 'down' : null;
    setLastChange(changes);
    setPrevPrices({ gold, silver, platinum });
    const timer = setTimeout(() => setLastChange({}), 3000);
    return () => clearTimeout(timer);
  }, [gold, silver, platinum]);

  const goldRates = calcGoldRates(gold, cfg);
  const silverRates = calcSilverRates(silver, cfg);
  const platRates = calcPlatRates(platinum, cfg);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const lastUpdatedText = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  const isLive = !error && gold > 0;

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      width: '100%',
      color: '#fff',
      fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative',
      userSelect: 'none',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 28px',
        background: '#111',
        borderBottom: '2px solid #333',
      }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/simpleton-logo.jpeg" alt="" style={{ height: 42, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.04em' }}>
              GUARANTEED HIGHEST PRICES
            </div>
            <div style={{ fontSize: 12, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Motor City Pawn Brokers · Live Market Rates
            </div>
          </div>
        </div>

        {/* Spot prices + clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Spot prices */}
          {[
            { label: 'GOLD', value: gold, key: 'gold', color: '#c9a84c' },
            { label: 'SILVER', value: silver, key: 'silver', color: '#aaa' },
            { label: 'PLAT', value: platinum, key: 'platinum', color: '#8be0f4' },
          ].map(({ label, value, key, color }) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#555', letterSpacing: '0.1em' }}>{label}/OZ</div>
              <div style={{
                fontSize: 20, fontWeight: 900, color,
                transition: 'color 0.3s',
                textShadow: lastChange[key] === 'up' ? '0 0 12px #22c55e' : lastChange[key] === 'down' ? '0 0 12px #ef4444' : 'none',
              }}>
                {value > 0 ? `$${value.toFixed(0)}` : '—'}
                {lastChange[key] === 'up' && <span style={{ color: '#22c55e', fontSize: 14, marginLeft: 4 }}>▲</span>}
                {lastChange[key] === 'down' && <span style={{ color: '#ef4444', fontSize: 14, marginLeft: 4 }}>▼</span>}
              </div>
            </div>
          ))}

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12, borderLeft: '1px solid #333' }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: isLive ? '#22c55e' : '#ef4444',
              boxShadow: isLive ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
              animation: isLive ? 'pulse 2s infinite' : 'none',
            }} />
            <div style={{ fontSize: 11, color: '#555' }}>
              {isLive ? `LIVE · ${lastUpdatedText}` : 'OFFLINE'}
            </div>
          </div>

          {/* Clock */}
          <div style={{ fontSize: 24, fontWeight: 900, color: '#444', fontVariantNumeric: 'tabular-nums', minWidth: 100 }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowSettings(s => !s)} style={{ background: '#222', border: '1px solid #444', borderRadius: 6, padding: '6px 10px', color: '#888', cursor: 'pointer', fontSize: 11 }}>
              ⚙ Rates
            </button>
            <button onClick={toggleFullscreen} style={{ background: '#222', border: '1px solid #444', borderRadius: 6, padding: '6px 10px', color: '#888', cursor: 'pointer' }}>
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        padding: '2px',
        height: 'calc(100vh - 74px)',
      }}>

        {/* LEFT: Gold karats */}
        <div style={{ background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
          {/* Column header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            background: '#1a1400', borderBottom: '1px solid #333',
            padding: '10px 20px',
          }}>
            <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 700, letterSpacing: '0.08em' }}>KARAT</div>
            <div style={{ fontSize: 13, color: '#5b9bd5', fontWeight: 700, textAlign: 'center', letterSpacing: '0.08em' }}>LOAN</div>
            <div style={{ fontSize: 13, color: '#e8793a', fontWeight: 700, textAlign: 'right', letterSpacing: '0.08em' }}>SELL</div>
          </div>

          {/* Gold rows */}
          {GOLD_KARATS.map(({ label, purity }, i) => {
            const rates = goldRates[label];
            const isAlt = i % 2 === 1;
            return (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                flex: 1,
                alignItems: 'center',
                padding: '0 20px',
                background: isAlt ? '#111' : '#0d0d0d',
                borderBottom: '1px solid #1a1a1a',
              }}>
                <div>
                  <div style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.02em', lineHeight: 1 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{purity}% pure</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 900, color: '#5b9bd5', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {rates ? `$${rates.loan}` : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: '#333' }}>/gram</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 900, color: '#e8793a', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {rates ? `$${rates.sell}` : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>/gram</div>
                </div>
              </div>
            );
          })}

          {/* Platinum row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            flex: 1,
            alignItems: 'center',
            padding: '0 20px',
            background: '#0d0d0d',
            borderTop: '2px solid #333',
          }}>
            <div>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 900, color: '#8be0f4', letterSpacing: '0.02em', lineHeight: 1 }}>
                PLAT
              </div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>950</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 900, color: '#5b9bd5', fontVariantNumeric: 'tabular-nums' }}>
                {platRates.loan > 0 ? `$${platRates.loan}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333' }}>/gram</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 900, color: '#e8793a', fontVariantNumeric: 'tabular-nums' }}>
                {platRates.sell > 0 ? `$${platRates.sell}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>/gram</div>
            </div>
          </div>

          {/* Silver row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            flex: 1,
            alignItems: 'center',
            padding: '0 20px',
            background: '#111',
            borderTop: '1px solid #1a1a1a',
          }}>
            <div>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', fontWeight: 900, color: '#aaa', letterSpacing: '0.02em', lineHeight: 1 }}>
                SILVER
              </div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>.999 fine</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 900, color: '#5b9bd5', fontVariantNumeric: 'tabular-nums' }}>
                {silverRates.loan > 0 ? `$${silverRates.loan.toFixed(2)}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333' }}>/gram</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 900, color: '#e8793a', fontVariantNumeric: 'tabular-nums' }}>
                {silverRates.sell > 0 ? `$${silverRates.sell.toFixed(2)}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>/gram</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Silver coins + other */}
        <div style={{ background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>

          {/* Column header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
            background: '#0d1a1a', borderBottom: '1px solid #333',
            padding: '10px 20px',
          }}>
            <div style={{ fontSize: 13, color: '#aaa', fontWeight: 700, letterSpacing: '0.08em' }}>SILVER COINS</div>
            <div style={{ fontSize: 13, color: '#5b9bd5', fontWeight: 700, textAlign: 'center', letterSpacing: '0.08em' }}>LOAN</div>
            <div style={{ fontSize: 13, color: '#e8793a', fontWeight: 700, textAlign: 'right', letterSpacing: '0.08em' }}>SELL</div>
          </div>

          {/* Silver coin rows */}
          {SILVER_COINS.map(({ label, loanMult, sellMult, loanFixed, sellFixed, unit }, i) => {
            const isAlt = i % 2 === 1;
            const loanDisplay = loanFixed !== undefined ? `$${loanFixed}` : `${loanMult}x`;
            const sellDisplay = sellFixed !== undefined ? `$${sellFixed}` : `${sellMult}x`;
            const unitLabel = unit;
            return (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                flex: 1,
                alignItems: 'center',
                padding: '0 20px',
                background: isAlt ? '#111' : '#0d0d0d',
                borderBottom: '1px solid #1a1a1a',
              }}>
                <div style={{ fontSize: 'clamp(13px, 1.4vw, 20px)', color: '#ccc', fontWeight: 700, lineHeight: 1.2, paddingRight: 10 }}>
                  {label}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(28px, 3.2vw, 50px)', fontWeight: 900, color: '#5b9bd5', fontVariantNumeric: 'tabular-nums' }}>
                    {loanDisplay}
                  </div>
                  <div style={{ fontSize: 10, color: '#333' }}>{unitLabel}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'clamp(28px, 3.2vw, 50px)', fontWeight: 900, color: '#e8793a', fontVariantNumeric: 'tabular-nums' }}>
                    {sellDisplay}
                  </div>
                  <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>{unitLabel}</div>
                </div>
              </div>
            );
          })}

          {/* Gold Bullion row */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            background: '#0d0d0d',
            borderTop: '2px solid #333',
            gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 36px)', fontWeight: 900, color: '#c9a84c' }}>GOLD BULLION</div>
              <div style={{ fontSize: 'clamp(13px, 1.4vw, 18px)', color: '#666', marginTop: 4 }}>See Manager</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(13px, 1.4vw, 18px)', color: '#888', lineHeight: 1.6 }}>
                <div>Pre-1934 Gold Coins</div>
                <div style={{ color: '#666', fontSize: '0.85em' }}>($2.50, $5, $10, $20)</div>
                <div style={{ color: '#c9a84c', fontWeight: 900, marginTop: 4 }}>
                  {gold > 0 ? `≈ ${Math.round((gold / 31.1035) * 0.9 * 0.79 * 100) / 100 > 0
                    ? `$${Math.round((gold / 31.1035) * 0.9)}` : '—'}/g melt` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Silver bullion + Silver Eagles row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
            flex: 1,
            alignItems: 'center',
            padding: '0 20px',
            background: '#111',
            borderTop: '1px solid #1a1a1a',
          }}>
            <div style={{ fontSize: 'clamp(14px, 1.5vw, 22px)', color: '#ccc', fontWeight: 700, lineHeight: 1.2 }}>
              SILVER BULLION
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 38px)', fontWeight: 900, color: '#5b9bd5' }}>
                {silver > 0 ? `$${Math.round((silver - 25) * 10) / 10}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333' }}>under spot</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 38px)', fontWeight: 900, color: '#e8793a' }}>
                {silver > 0 ? `$${Math.round((silver - 20) * 10) / 10}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>under spot</div>
            </div>
          </div>

          {/* Silver Eagles row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
            flex: 1,
            alignItems: 'center',
            padding: '0 20px',
            background: '#0d0d0d',
            borderTop: '1px solid #1a1a1a',
          }}>
            <div style={{ fontSize: 'clamp(14px, 1.5vw, 22px)', color: '#ccc', fontWeight: 700, lineHeight: 1.2 }}>
              SILVER EAGLES
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 38px)', fontWeight: 900, color: '#5b9bd5' }}>
                {silver > 0 ? `$${Math.round((silver - 15) * 10) / 10}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333' }}>under spot</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 38px)', fontWeight: 900, color: '#e8793a' }}>
                {silver > 0 ? `$${Math.round((silver - 10) * 10) / 10}` : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>under spot</div>
            </div>
          </div>

          {/* Copper Bullion row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
            flex: 1,
            alignItems: 'center',
            padding: '0 20px',
            background: '#111',
            borderTop: '1px solid #1a1a1a',
          }}>
            <div style={{ fontSize: 'clamp(14px, 1.5vw, 22px)', color: '#cd7f32', fontWeight: 700 }}>
              COPPER BULLION
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 38px)', fontWeight: 900, color: '#5b9bd5' }}>$0.50</div>
              <div style={{ fontSize: 10, color: '#333' }}>/oz</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 38px)', fontWeight: 900, color: '#e8793a' }}>$1.00</div>
              <div style={{ fontSize: 10, color: '#333', textAlign: 'right' }}>/oz</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom ticker ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#111', borderTop: '1px solid #222',
        padding: '6px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#333' }}>
          All prices per gram · Rates update automatically with live spot · Powered by Simpleton™ simpletonapp.com
        </div>
        <div style={{ fontSize: 11, color: '#333' }}>
          Gold {cfg.goldLoanPct * 100}% loan · +${cfg.goldSellSpread}/g sell spread
        </div>
      </div>

      {/* ── Settings overlay ── */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setShowSettings(false)}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: 12,
            padding: 32, minWidth: 400, maxWidth: 500,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#c9a84c', marginBottom: 24 }}>Rate Settings</div>

            {[
              { key: 'goldLoanPct', label: 'Gold Loan %', min: 50, max: 95, step: 1, display: (v: number) => `${Math.round(v * 100)}%`, parse: (v: number) => v / 100 },
              { key: 'goldSellSpread', label: 'Gold Sell Spread ($/g)', min: 1, max: 15, step: 0.5, display: (v: number) => `+$${v}`, parse: (v: number) => v },
              { key: 'silverLoanPct', label: 'Silver Loan %', min: 20, max: 80, step: 1, display: (v: number) => `${Math.round(v * 100)}%`, parse: (v: number) => v / 100 },
              { key: 'silverSellSpread', label: 'Silver Sell Spread ($/g)', min: 0, max: 2, step: 0.05, display: (v: number) => `+$${v.toFixed(2)}`, parse: (v: number) => v },
              { key: 'platLoanPct', label: 'Platinum Loan %', min: 50, max: 90, step: 1, display: (v: number) => `${Math.round(v * 100)}%`, parse: (v: number) => v / 100 },
            ].map(({ key, label, min, max, step, display, parse }) => {
              const rawVal = (cfg as any)[key];
              const sliderVal = key.endsWith('Pct') ? Math.round(rawVal * 100) : rawVal;
              return (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, color: '#aaa' }}>{label}</label>
                    <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 700 }}>{display(rawVal)}</span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={sliderVal}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      setCfg(prev => ({ ...prev, [key]: parse(v) }));
                    }}
                    style={{ width: '100%', accentColor: '#c9a84c' }}
                  />
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setCfg(DEFAULT_CONFIG)} style={{ flex: 1, background: '#333', border: 'none', borderRadius: 8, padding: '10px', color: '#aaa', cursor: 'pointer', fontSize: 13 }}>
                Reset to MCPB Defaults
              </button>
              <button onClick={() => setShowSettings(false)} style={{ flex: 1, background: '#c9a84c', border: 'none', borderRadius: 8, padding: '10px', color: '#000', fontWeight: 900, cursor: 'pointer', fontSize: 13 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
