// ═══════════════════════════════════════════════════════════════════════
//  SIMPLETON APPRAISAL TEMPLATES
//  Five genuinely distinct document designs, each inspired by a different
//  billion-dollar-class benchmark. Every template is its own visual world
//  rather than a recolored variant of the same layout.
//
//    Heritage  —  GIA laboratory dossier        (cream + navy + gold)
//    Atelier   —  Sotheby's editorial magazine  (white + black, typographic)
//    Boutique  —  Tiffany & Co. packaging       (eggshell + robin's egg)
//    Vault     —  Christie's auction catalogue  (navy + brass, lot format)
//    Ledger    —  Instappraise trifold brochure (three-panel corporate)
//
//  Legacy keys (classic/elegant/modern/professional/detailed) still route
//  so saved appraisals from before the rebrand continue to render.
// ═══════════════════════════════════════════════════════════════════════

export interface ItemSpecs {
  metalType?: string;
  karat?: string;
  weight?: string;
  measurements?: string;
  stoneType?: string;
  stoneWeight?: string;
  stoneColor?: string;
  stoneClarity?: string;
  stoneCut?: string;
  stoneShape?: string;
  condition?: string;
  brandMaker?: string;
  hallmarks?: string;
}

export interface AppraisalReport {
  materialAnalysis?: string;
  conditionGrade?: string;
  conditionNotes?: string;
  meltValue?: number;
  fairMarketLow?: number;
  fairMarketHigh?: number;
  retailReplacement?: number;
  estateValue?: number;
  liquidationValue?: number;
  valuationMath?: string;
  keyFactors?: string[];
  sources?: string[];
  recommendations?: string[];
  certificationAdvice?: string;
}

interface TemplateProps {
  appraisalNumber: string;
  customerName: string;
  customerAddress?: string | null;
  customerCityStateZip?: string | null;
  date: string;
  itemCategory?: string;
  description: string;
  retailValue: string;
  images: string[];
  isCertified?: boolean;
  certifiedBy?: string | null;
  certifiedAt?: string | null;
  itemSpecs?: ItemSpecs | null;
  report?: AppraisalReport | null;
  shareToken?: string | null;
}

// ───────────────────────────────────────────────────────────────────────
//  Shared utilities
// ───────────────────────────────────────────────────────────────────────
function fmtDate(s: string | null) {
  if (!s) return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const d = new Date(s.includes('T') ? s : s + 'T12:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtMoney(s: string | null) {
  if (!s) return '';
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return '';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function money0(n?: number) {
  if (n == null || isNaN(n) || n <= 0) return null;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function money2(n?: number) {
  if (n == null || isNaN(n) || n <= 0) return null;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function specRows(specs?: ItemSpecs | null): Array<{ label: string; value: string }> {
  if (!specs) return [];
  const rows: Array<{ label: string; value: string }> = [];
  if (specs.metalType) rows.push({ label: 'Metal Type', value: specs.metalType });
  if (specs.karat) rows.push({ label: 'Karat / Purity', value: specs.karat });
  if (specs.weight) rows.push({ label: 'Weight', value: specs.weight.includes('g') ? specs.weight : specs.weight + 'g' });
  if (specs.measurements) rows.push({ label: 'Measurements', value: specs.measurements });
  if (specs.stoneType) rows.push({ label: 'Stone Type', value: specs.stoneType });
  if (specs.stoneWeight) rows.push({ label: 'Stone Weight', value: specs.stoneWeight.includes('ct') ? specs.stoneWeight : specs.stoneWeight + ' ct' });
  if (specs.stoneColor) rows.push({ label: 'Stone Color', value: specs.stoneColor });
  if (specs.stoneClarity) rows.push({ label: 'Stone Clarity', value: specs.stoneClarity });
  if (specs.stoneCut) rows.push({ label: 'Stone Cut', value: specs.stoneCut });
  if (specs.stoneShape) rows.push({ label: 'Stone Shape', value: specs.stoneShape });
  if (specs.condition) rows.push({ label: 'Condition', value: specs.condition });
  if (specs.brandMaker) rows.push({ label: 'Brand / Maker', value: specs.brandMaker });
  if (specs.hallmarks) rows.push({ label: 'Hallmarks / Stamps', value: specs.hallmarks });
  return rows;
}

function QRCode({ shareToken, appraisalNumber, size = 70, light = false }: { shareToken?: string | null; appraisalNumber: string; size?: number; light?: boolean }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://simpletonapp.com';
  const url = shareToken ? `${origin}/appraisal/${shareToken}` : `${origin}/appraisal-verify?num=${encodeURIComponent(appraisalNumber)}`;
  const bg = light ? 'ffffff' : 'ffffff';
  const fg = light ? '000000' : '000000';
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(url)}&margin=0&color=${fg}&bgcolor=${bg}`;
  return (
    <img src={src} alt="Verification QR" style={{ width: size, height: size, display: 'block' }} />
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  1. HERITAGE — GIA laboratory dossier
//  Cream paper, navy ink, gold accents, double-rule frame, dossier data,
//  horizontal grading scale bars for diamonds.
// ═══════════════════════════════════════════════════════════════════════
export function HeritageTemplate(p: TemplateProps) {
  const C = { bg: '#faf7f0', ink: '#0a1733', gold: '#b8935a', goldDeep: '#8f6e35', hairline: '#d4c7a3', muted: '#5a6478' };
  const rows = specRows(p.itemSpecs);
  const retail = money0(p.report?.retailReplacement) || fmtMoney(p.retailValue);

  const GradingBar = ({ label, scale, position, note }: { label: string; scale: string[]; position: number; note?: string }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.ink }}>{label}</span>
        {note && <span style={{ fontSize: 9, fontStyle: 'italic', color: C.muted }}>{note}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scale.length}, 1fr)`, border: `0.5px solid ${C.hairline}`, background: '#fff', position: 'relative' }}>
        {scale.map((s, i) => (
          <div key={i} style={{
            padding: '4px 0', textAlign: 'center', fontSize: 8, fontFamily: '"Courier New", monospace',
            borderRight: i < scale.length - 1 ? `0.5px solid ${C.hairline}` : 'none',
            background: i === position ? C.gold : 'transparent',
            color: i === position ? '#fff' : C.ink,
            fontWeight: i === position ? 700 : 400,
          }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );

  const colorScale = ['D','E','F','G','H','I','J','K','L','M'];
  const clarityScale = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2'];
  const cutScale = ['EX','VG','G','F','P'];
  const colorIdx = p.itemSpecs?.stoneColor ? colorScale.findIndex(c => (p.itemSpecs!.stoneColor || '').toUpperCase().startsWith(c)) : -1;
  const clarityIdx = p.itemSpecs?.stoneClarity ? clarityScale.findIndex(c => (p.itemSpecs!.stoneClarity || '').toUpperCase().startsWith(c)) : -1;
  const cutIdx = p.itemSpecs?.stoneCut ? (() => {
    const s = (p.itemSpecs!.stoneCut || '').toLowerCase();
    if (s.includes('excellent')) return 0;
    if (s.includes('very good')) return 1;
    if (s.includes('good')) return 2;
    if (s.includes('fair')) return 3;
    if (s.includes('poor')) return 4;
    return -1;
  })() : -1;
  const showScales = colorIdx >= 0 || clarityIdx >= 0 || cutIdx >= 0;

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: 'Georgia, "Times New Roman", serif', position: 'relative', minHeight: '100%' }}>
      {/* Double-rule gold frame */}
      <div style={{
        position: 'absolute', inset: 6,
        border: `1.5px solid ${C.gold}`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 10,
        border: `0.5px solid ${C.gold}`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', padding: '30px 34px' }}>
        {/* Seal header */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.45em', color: C.goldDeep, textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
            Simpleton · Laboratory Services
          </div>
          <div style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 28, fontWeight: 400, color: C.ink, letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            Gemological Appraisal Report
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.gold, maxWidth: 80 }} />
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.goldDeep, textTransform: 'uppercase', fontWeight: 700 }}>
              Certificate № {p.appraisalNumber}
            </div>
            <div style={{ flex: 1, height: 1, background: C.gold, maxWidth: 80 }} />
          </div>
        </div>

        {/* Header data strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          border: `0.5px solid ${C.hairline}`, background: '#fff',
          fontSize: 9, marginBottom: 18,
        }}>
          {[
            ['Date of Issue', fmtDate(p.date)],
            ['Report Type', 'Retail Replacement'],
            ['Appraiser', 'Demiris Brown, GG'],
            ['Property Of', p.customerName || '—'],
          ].map(([k, v], i) => (
            <div key={i} style={{
              padding: '7px 10px',
              borderRight: i < 3 ? `0.5px solid ${C.hairline}` : 'none',
            }}>
              <div style={{ fontSize: 7, letterSpacing: '0.15em', color: C.goldDeep, textTransform: 'uppercase', marginBottom: 2, fontWeight: 700 }}>{k}</div>
              <div style={{ fontSize: 10, color: C.ink, fontFamily: '"Courier New", monospace' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Image + dossier data */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 18, marginBottom: 18 }}>
          <div>
            {p.images.length > 0 ? (
              <div style={{ border: `0.5px solid ${C.hairline}`, padding: 6, background: '#fff' }}>
                <img src={p.images[0]} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', background: '#faf7f0' }} />
                {p.images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 6 }}>
                    {p.images.slice(1, 4).map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', background: '#faf7f0', border: `0.5px solid ${C.hairline}` }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ border: `0.5px dashed ${C.hairline}`, aspectRatio: '1', background: '#fff' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.goldDeep, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
              — Dossier —
            </div>
            <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse', fontFamily: '"Courier New", monospace' }}>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `0.5px solid ${C.hairline}` }}>
                    <td style={{ padding: '5px 0', width: 120, color: C.muted, textTransform: 'uppercase', fontSize: 8, letterSpacing: '0.1em' }}>{r.label}</td>
                    <td style={{ padding: '5px 0', color: C.ink }}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showScales && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.goldDeep, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                  — Grading Scales —
                </div>
                {colorIdx >= 0 && <GradingBar label="Color" scale={colorScale} position={colorIdx} />}
                {clarityIdx >= 0 && <GradingBar label="Clarity" scale={clarityScale} position={clarityIdx} />}
                {cutIdx >= 0 && <GradingBar label="Cut" scale={cutScale} position={cutIdx} note="EX / VG / G / F / P" />}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.goldDeep, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            — Description of Article —
          </div>
          <div style={{ fontSize: 10.5, lineHeight: 1.75, textAlign: 'justify', whiteSpace: 'pre-wrap', color: C.ink }}>
            {p.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Description will appear here...</span>}
          </div>
        </div>

        {/* Tiered values */}
        {p.report && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.goldDeep, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
              — Certified Valuation —
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: `1px solid ${C.gold}`, background: '#fff' }}>
              {[
                ['Retail Replacement', money0(p.report.retailReplacement), true],
                ['Fair Market', p.report.fairMarketLow && p.report.fairMarketHigh ? `${money0(p.report.fairMarketLow)}–${money0(p.report.fairMarketHigh)}` : money0(p.report.fairMarketLow)],
                ['Estate', money0(p.report.estateValue)],
                ['Liquidation', money0(p.report.liquidationValue)],
                ['Intrinsic', money2(p.report.meltValue)],
              ].map(([label, value, emphasized], i) => value ? (
                <div key={i} style={{
                  padding: '10px 6px', textAlign: 'center',
                  borderRight: i < 4 ? `0.5px solid ${C.hairline}` : 'none',
                  background: emphasized ? '#fffef5' : '#fff',
                }}>
                  <div style={{ fontSize: 7, letterSpacing: '0.12em', color: C.goldDeep, textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: emphasized ? 13 : 11, fontWeight: 700, color: C.ink, fontFamily: '"Courier New", monospace' }}>{value}</div>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {!p.report && retail && (
          <div style={{ textAlign: 'center', margin: '18px 0' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.goldDeep, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              Estimated Retail Replacement
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, fontFamily: '"Courier New", monospace' }}>
              {retail}
            </div>
          </div>
        )}

        {/* Notes */}
        {p.report?.valuationMath && (
          <div style={{ marginBottom: 14, fontSize: 9, color: C.muted, fontStyle: 'italic', lineHeight: 1.6, borderTop: `0.5px solid ${C.hairline}`, paddingTop: 8 }}>
            <strong style={{ fontStyle: 'normal', color: C.ink }}>Methodology.</strong> {p.report.valuationMath}
          </div>
        )}

        {/* Signature + QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C.gold}` }}>
          <div>
            <div style={{
              fontFamily: '"Snell Roundhand", "Apple Chancery", cursive',
              fontSize: 22, color: C.ink, fontStyle: 'italic',
              borderBottom: `0.5px solid ${C.muted}`, paddingBottom: 2, width: 200,
            }}>
              Demiris Brown
            </div>
            <div style={{ fontSize: 8, color: C.muted, marginTop: 3, letterSpacing: '0.1em' }}>
              Demiris Brown, GIA Graduate Gemologist
            </div>
            <div style={{ fontSize: 8, color: C.muted, letterSpacing: '0.1em' }}>
              Accredited Jewelry Professional — Simpleton Laboratory Services
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <QRCode shareToken={p.shareToken} appraisalNumber={p.appraisalNumber} size={58} />
            <div style={{ fontSize: 7, color: C.muted, marginTop: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scan to Verify</div>
          </div>
        </div>

        <div style={{ fontSize: 7, color: C.muted, marginTop: 12, lineHeight: 1.6, fontStyle: 'italic', textAlign: 'center', paddingTop: 8, borderTop: `0.5px solid ${C.hairline}` }}>
          This document represents the considered opinion of the appraiser based on current market conditions, visible examination, and available reference data.
          Issued for the sole purpose of insurance replacement valuation. Not negotiable. Simpleton Laboratory Services — LaDale Industries LLC.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  2. ATELIER — Sotheby's editorial magazine
//  Warm white, pure typography, enormous hero image, Roman numeral
//  sections, generous whitespace, no ornament.
// ═══════════════════════════════════════════════════════════════════════
export function AtelierTemplate(p: TemplateProps) {
  const C = { bg: '#fcfbf8', ink: '#0a0a0a', muted: '#666', hairline: '#d8d4ca', accent: '#6b5840' };
  const rows = specRows(p.itemSpecs);
  const retail = money0(p.report?.retailReplacement) || fmtMoney(p.retailValue);

  const romans = ['I', 'II', 'III', 'IV', 'V'];
  let sectionIdx = 0;
  const nextRoman = () => romans[sectionIdx++] || '';

  const Section = ({ roman, title, children }: { roman: string; title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 10 }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 11, fontStyle: 'italic', color: C.accent, minWidth: 24, letterSpacing: '0.1em' }}>
          {roman}.
        </div>
        <div style={{
          fontFamily: '"Playfair Display", serif', fontSize: 13, fontWeight: 400,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ink,
        }}>
          {title}
        </div>
        <div style={{ flex: 1, height: 0.5, background: C.hairline, marginBottom: 4 }} />
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: '"Playfair Display", Georgia, serif', padding: '34px 40px', minHeight: '100%' }}>
      {/* Masthead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `0.5px solid ${C.ink}`, paddingBottom: 14, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1 }}>
            Simpleton
          </div>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: C.muted, textTransform: 'uppercase', marginTop: 3 }}>
            Atelier · Fine Jewellery
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, color: C.muted, fontFamily: '"Inter", sans-serif' }}>
          <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>Lot № {p.appraisalNumber}</div>
          <div style={{ marginTop: 3, fontStyle: 'italic', fontFamily: '"Playfair Display", serif' }}>{fmtDate(p.date)}</div>
        </div>
      </div>

      {/* HERO — full width image + headline */}
      {p.images.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <img src={p.images[0]} alt="" style={{
            width: '100%', aspectRatio: '16/9', objectFit: 'cover',
            display: 'block', background: '#f0ede4',
          }} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.muted, textTransform: 'uppercase', marginBottom: 16 }}>
          — The Property Of {p.customerName || 'A Private Collector'} —
        </div>
        <div style={{
          fontFamily: '"Playfair Display", serif', fontSize: 40, fontWeight: 400,
          lineHeight: 1.15, letterSpacing: '-0.01em', color: C.ink, maxWidth: '6in', margin: '0 auto',
        }}>
          {p.itemSpecs?.metalType && p.itemSpecs?.karat ? `${p.itemSpecs.karat} ${p.itemSpecs.metalType}` : 'A Fine Appraisal'}
          {p.itemSpecs?.stoneType && <>, <span style={{ fontStyle: 'italic' }}>with {p.itemSpecs.stoneType}</span></>}
        </div>
        {p.itemSpecs?.brandMaker && (
          <div style={{ fontSize: 13, fontStyle: 'italic', color: C.muted, marginTop: 10, letterSpacing: '0.02em' }}>
            attributed to {p.itemSpecs.brandMaker}
          </div>
        )}
      </div>

      {/* Secondary image row */}
      {p.images.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.images.length - 1, 3)}, 1fr)`, gap: 8, marginBottom: 32 }}>
          {p.images.slice(1, 4).map((img, i) => (
            <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', background: '#f0ede4' }} />
          ))}
        </div>
      )}

      <Section roman={nextRoman()} title="Description">
        <div style={{ fontSize: 12, lineHeight: 1.9, whiteSpace: 'pre-wrap', color: C.ink, textAlign: 'justify', fontFamily: '"Playfair Display", serif' }}>
          {p.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Description will appear here...</span>}
        </div>
      </Section>

      {rows.length > 0 && (
        <Section roman={nextRoman()} title="Specifications">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 40px', fontSize: 11, fontFamily: '"Inter", sans-serif' }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', borderBottom: `0.5px dotted ${C.hairline}`, padding: '4px 0' }}>
                <span style={{ color: C.muted, flex: 1, fontStyle: 'italic', fontFamily: '"Playfair Display", serif' }}>{r.label}</span>
                <span style={{ color: C.ink, textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Valuation — editorial style */}
      <Section roman={nextRoman()} title="Valuation">
        {p.report && (p.report.retailReplacement || p.report.fairMarketLow || p.report.meltValue) ? (
          <div>
            {p.report.retailReplacement && (
              <div style={{ textAlign: 'center', padding: '20px 0', borderTop: `0.5px solid ${C.ink}`, borderBottom: `0.5px solid ${C.ink}`, marginBottom: 20 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>
                  Retail Replacement Value
                </div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 46, fontWeight: 400, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1 }}>
                  {money0(p.report.retailReplacement)}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11, fontFamily: '"Playfair Display", serif', color: C.muted, fontStyle: 'italic' }}>
              {p.report.fairMarketLow && <div>Fair Market {money0(p.report.fairMarketLow)}–{money0(p.report.fairMarketHigh || p.report.fairMarketLow)}</div>}
              {p.report.estateValue && <div>Estate {money0(p.report.estateValue)}</div>}
              {p.report.meltValue && <div>Intrinsic {money2(p.report.meltValue)}</div>}
            </div>
          </div>
        ) : retail && (
          <div style={{ textAlign: 'center', padding: '24px 0', borderTop: `0.5px solid ${C.ink}`, borderBottom: `0.5px solid ${C.ink}` }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.muted, textTransform: 'uppercase', marginBottom: 10 }}>
              Estimated Value
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 46, fontWeight: 400, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {retail}
            </div>
          </div>
        )}
      </Section>

      {p.report?.conditionGrade && (
        <Section roman={nextRoman()} title="Condition & Notes">
          <div style={{ fontSize: 12, fontFamily: '"Playfair Display", serif', lineHeight: 1.8, color: C.ink }}>
            <span style={{ fontStyle: 'italic', color: C.accent }}>Condition —</span> {p.report.conditionGrade}.{' '}
            {p.report.conditionNotes}
          </div>
        </Section>
      )}

      {/* Footer */}
      <div style={{ marginTop: 48, paddingTop: 20, borderTop: `0.5px solid ${C.ink}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: '"Snell Roundhand", "Apple Chancery", cursive', fontSize: 22, fontStyle: 'italic', color: C.ink, borderBottom: `0.5px solid ${C.muted}`, paddingBottom: 2, width: 200 }}>
            Demiris Brown
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 4, fontStyle: 'italic' }}>
            Demiris Brown, GIA Graduate Gemologist
          </div>
          <div style={{ fontSize: 9, color: C.muted, fontStyle: 'italic' }}>
            Head of Appraisals · Simpleton Atelier
          </div>
        </div>
        <QRCode shareToken={p.shareToken} appraisalNumber={p.appraisalNumber} size={52} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  3. BOUTIQUE — Tiffany & Co. boutique packaging
//  Eggshell background, robin's-egg accent band, Didone-style serif,
//  narrow column, hairline borders, refined restraint.
// ═══════════════════════════════════════════════════════════════════════
export function BoutiqueTemplate(p: TemplateProps) {
  const C = { bg: '#f7f6f1', accent: '#81d8d0', ink: '#0a0a0a', muted: '#807a6a', hairline: '#bbb6a7' };
  const rows = specRows(p.itemSpecs);
  const retail = money0(p.report?.retailReplacement) || fmtMoney(p.retailValue);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: '"Playfair Display", Didot, "Bodoni MT", serif', minHeight: '100%', position: 'relative' }}>
      {/* Top Tiffany band */}
      <div style={{ height: 12, background: C.accent }} />

      <div style={{ padding: '32px 48px 24px', maxWidth: '6.5in', margin: '0 auto' }}>
        {/* Masthead */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: '"Playfair Display", Didot, serif', fontSize: 30, fontWeight: 400,
            letterSpacing: '0.15em', color: C.ink, lineHeight: 1,
          }}>
            SIMPLETON
          </div>
          <div style={{ fontSize: 7, letterSpacing: '0.5em', color: C.muted, marginTop: 5, textTransform: 'uppercase' }}>
            New York · Maison
          </div>
          <div style={{ margin: '18px auto', width: 1, height: 20, background: C.accent }} />
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.muted, textTransform: 'uppercase' }}>
            Certificate of Appraisal
          </div>
        </div>

        {/* Small details row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, letterSpacing: '0.08em', marginBottom: 28, padding: '6px 0', borderTop: `0.5px solid ${C.hairline}`, borderBottom: `0.5px solid ${C.hairline}` }}>
          <span>№ {p.appraisalNumber}</span>
          <span style={{ textTransform: 'uppercase' }}>{fmtDate(p.date)}</span>
          <span style={{ textTransform: 'uppercase' }}>Atelier</span>
        </div>

        {/* Centered hero image inside thin rule */}
        {p.images.length > 0 && (
          <div style={{
            border: `0.5px solid ${C.hairline}`, padding: 10, marginBottom: 22,
            background: '#fff', display: 'flex', justifyContent: 'center',
          }}>
            <img src={p.images[0]} alt="" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }} />
          </div>
        )}

        {/* Item title */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            fontFamily: '"Playfair Display", Didot, serif', fontSize: 22, fontWeight: 400,
            letterSpacing: '0.02em', color: C.ink, lineHeight: 1.3,
          }}>
            {p.itemSpecs?.metalType && p.itemSpecs?.karat
              ? `${p.itemSpecs.karat} ${p.itemSpecs.metalType}`
              : 'Fine Jewellery'}
            {p.itemSpecs?.stoneType ? ` with ${p.itemSpecs.stoneType}` : ''}
          </div>
          <div style={{ width: 40, height: 0.5, background: C.accent, margin: '12px auto' }} />
          <div style={{ fontSize: 10, color: C.muted, fontStyle: 'italic', letterSpacing: '0.04em' }}>
            prepared exclusively for {p.customerName || 'a valued client'}
          </div>
        </div>

        {/* Description in narrow column */}
        <div style={{
          fontSize: 11, lineHeight: 1.85, textAlign: 'justify',
          whiteSpace: 'pre-wrap', color: C.ink, marginBottom: 24,
          fontFamily: '"Playfair Display", serif',
        }}>
          {p.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Description will appear here...</span>}
        </div>

        {/* Specs in delicate table */}
        {rows.length > 0 && (
          <div style={{ marginBottom: 24, padding: '14px 0', borderTop: `0.5px solid ${C.hairline}`, borderBottom: `0.5px solid ${C.hairline}` }}>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: C.muted, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
              — Particulars —
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }}>
              {rows.map((r, i) => (
                <div key={i} style={{ display: 'flex', fontSize: 10, padding: '3px 0' }}>
                  <span style={{ flex: 1, color: C.muted, fontStyle: 'italic' }}>{r.label}</span>
                  <span style={{ color: C.ink }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tiered values as delicate pills */}
        {p.report && (p.report.retailReplacement || p.report.fairMarketLow) && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: C.muted, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              — Valuation —
            </div>
            {p.report.retailReplacement && (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Retail Replacement
                </div>
                <div style={{ fontFamily: '"Playfair Display", Didot, serif', fontSize: 32, color: C.ink, fontWeight: 400 }}>
                  {money0(p.report.retailReplacement)}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {[
                ['Fair Market', p.report.fairMarketLow ? `${money0(p.report.fairMarketLow)} – ${money0(p.report.fairMarketHigh || p.report.fairMarketLow)}` : null],
                ['Estate', money0(p.report.estateValue)],
                ['Liquidation', money0(p.report.liquidationValue)],
                ['Intrinsic', money2(p.report.meltValue)],
              ].filter(([, v]) => v).map(([label, value], i) => (
                <div key={i} style={{
                  border: `0.5px solid ${C.hairline}`, padding: '6px 14px', borderRadius: 20,
                  fontSize: 9, color: C.ink,
                }}>
                  <span style={{ color: C.muted, fontStyle: 'italic', marginRight: 6 }}>{label}</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {!p.report && retail && (
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>
              Retail Replacement
            </div>
            <div style={{ fontFamily: '"Playfair Display", Didot, serif', fontSize: 32, color: C.ink, fontWeight: 400 }}>
              {retail}
            </div>
          </div>
        )}

        {/* Signature */}
        <div style={{ marginTop: 28, paddingTop: 18, borderTop: `0.5px solid ${C.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{
              fontFamily: '"Snell Roundhand", "Apple Chancery", cursive',
              fontSize: 20, color: C.ink, fontStyle: 'italic',
              borderBottom: `0.5px solid ${C.muted}`, paddingBottom: 2, width: 180,
            }}>
              Demiris Brown
            </div>
            <div style={{ fontSize: 8, color: C.muted, marginTop: 3, letterSpacing: '0.08em', fontStyle: 'italic' }}>
              Demiris Brown, GIA Graduate Gemologist
            </div>
          </div>
          <QRCode shareToken={p.shareToken} appraisalNumber={p.appraisalNumber} size={52} />
        </div>

        <div style={{ fontSize: 7, color: C.muted, textAlign: 'center', marginTop: 20, letterSpacing: '0.04em', fontStyle: 'italic', lineHeight: 1.6 }}>
          Prepared with care for the recipient named herein. Simpleton Atelier · New York.<br />
          This document serves as a formal record of value as of the date of issue.
        </div>
      </div>

      <div style={{ height: 12, background: C.accent }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  4. VAULT — Christie's auction catalogue
//  Deep navy header, aged brass accents, lot number treatment, two-column
//  editorial split, italic annotations, catalog footer.
// ═══════════════════════════════════════════════════════════════════════
export function VaultTemplate(p: TemplateProps) {
  const C = { bg: '#f4f1ea', navy: '#0a1929', brass: '#a8873a', ink: '#1a1a1a', muted: '#6a6458', hairline: '#c7c0ad' };
  const rows = specRows(p.itemSpecs);
  const retail = money0(p.report?.retailReplacement) || fmtMoney(p.retailValue);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: 'Georgia, "Times New Roman", serif', minHeight: '100%' }}>
      {/* Navy header band */}
      <div style={{ background: C.navy, color: '#fff', padding: '22px 36px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: '0.35em', color: C.brass, textTransform: 'uppercase', marginBottom: 4 }}>
              Simpleton · Established MMXXIV
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1 }}>
              The Vault <span style={{ fontStyle: 'italic', color: C.brass }}>Appraisals</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.brass, textTransform: 'uppercase' }}>Catalogue Entry</div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, marginTop: 2, fontStyle: 'italic' }}>№ {p.appraisalNumber}</div>
          </div>
        </div>
      </div>

      {/* Brass rule */}
      <div style={{ height: 3, background: C.brass }} />

      <div style={{ padding: '28px 36px' }}>
        {/* Lot header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 12, fontStyle: 'italic', color: C.muted, letterSpacing: '0.08em' }}>
            Lot № 001 · Property of {p.customerName || 'a Private Collection'}
          </div>
        </div>

        {/* Two-column split: image left, spec block right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, marginBottom: 28 }}>
          <div>
            {p.images.length > 0 ? (
              <div>
                <div style={{ background: '#fff', padding: 8, border: `0.5px solid ${C.hairline}` }}>
                  <img src={p.images[0]} alt="" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', background: '#e8e4d5' }} />
                </div>
                {p.images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 6 }}>
                    {p.images.slice(1, 5).map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: `0.5px solid ${C.hairline}`, background: '#e8e4d5' }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#fff', padding: 8, border: `0.5px solid ${C.hairline}`, aspectRatio: '4/5' }} />
            )}
          </div>
          <div>
            <div style={{
              fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 400,
              lineHeight: 1.15, color: C.ink, marginBottom: 6, letterSpacing: '-0.005em',
            }}>
              {p.itemSpecs?.brandMaker || 'An Important'}
            </div>
            <div style={{
              fontFamily: '"Playfair Display", serif', fontSize: 18, fontStyle: 'italic',
              color: C.brass, marginBottom: 14, lineHeight: 1.2,
            }}>
              {p.itemSpecs?.metalType && p.itemSpecs?.karat
                ? `${p.itemSpecs.karat} ${p.itemSpecs.metalType}`
                : 'Fine Jewellery'}
              {p.itemSpecs?.stoneType ? ` ${p.itemSpecs.stoneType}` : ''}
            </div>

            {/* Spec lines */}
            <div style={{ borderTop: `0.5px solid ${C.hairline}`, paddingTop: 10 }}>
              {rows.slice(0, 10).map((r, i) => (
                <div key={i} style={{ display: 'flex', fontSize: 10, padding: '3px 0', borderBottom: i < rows.length - 1 ? `0.5px dotted ${C.hairline}` : 'none' }}>
                  <span style={{ flex: 1, color: C.muted, fontStyle: 'italic' }}>{r.label}</span>
                  <span style={{ color: C.ink, fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Auction-style estimate */}
            {p.report?.fairMarketLow && (
              <div style={{ marginTop: 14, padding: '10px 0', borderTop: `1px solid ${C.brass}`, borderBottom: `1px solid ${C.brass}` }}>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.brass, textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>
                  Estimate
                </div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: C.ink, fontStyle: 'italic' }}>
                  {money0(p.report.fairMarketLow)} – {money0(p.report.fairMarketHigh || p.report.fairMarketLow)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.brass, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
            — Cataloguer's Note —
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.85, textAlign: 'justify', whiteSpace: 'pre-wrap', color: C.ink, fontFamily: 'Georgia, serif' }}>
            {p.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Description will appear here...</span>}
          </div>
        </div>

        {/* Full tier valuation */}
        {p.report && (p.report.retailReplacement || p.report.meltValue) && (
          <div style={{ marginBottom: 20, background: '#fff', border: `1px solid ${C.brass}`, padding: '14px 18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.brass, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700, textAlign: 'center' }}>
              Valuation Tiers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 14 }}>
              {[
                ['Retail Replacement', money0(p.report.retailReplacement), true],
                ['Fair Market', p.report.fairMarketLow ? `${money0(p.report.fairMarketLow)}–${money0(p.report.fairMarketHigh || p.report.fairMarketLow)}` : null],
                ['Estate', money0(p.report.estateValue)],
                ['Liquidation', money0(p.report.liquidationValue)],
                ['Intrinsic', money2(p.report.meltValue)],
              ].map(([label, value, emph], i) => value ? (
                <div key={i} style={{ textAlign: 'center', padding: '0 4px', borderRight: i < 4 ? `0.5px solid ${C.hairline}` : 'none' }}>
                  <div style={{ fontSize: 7, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: '"Playfair Display", serif', fontSize: emph ? 14 : 11, color: C.ink, fontWeight: emph ? 700 : 400 }}>
                    {value}
                  </div>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {p.report?.conditionGrade && (
          <div style={{ marginBottom: 18, fontSize: 10, color: C.muted, fontStyle: 'italic', lineHeight: 1.7 }}>
            <span style={{ color: C.brass, fontStyle: 'normal', fontWeight: 700, textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.15em' }}>Condition.</span>{' '}
            {p.report.conditionGrade}.{p.report.conditionNotes && ` ${p.report.conditionNotes}`}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${C.brass}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{
              fontFamily: '"Snell Roundhand", "Apple Chancery", cursive',
              fontSize: 20, color: C.ink, fontStyle: 'italic',
              borderBottom: `0.5px solid ${C.muted}`, paddingBottom: 2, width: 180,
            }}>
              Demiris Brown
            </div>
            <div style={{ fontSize: 8, color: C.muted, marginTop: 3, letterSpacing: '0.08em', fontStyle: 'italic' }}>
              Demiris Brown, GG · Head of Appraisals
            </div>
            <div style={{ fontSize: 8, color: C.muted, fontStyle: 'italic' }}>
              The Vault · Simpleton Catalogue · New York
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <QRCode shareToken={p.shareToken} appraisalNumber={p.appraisalNumber} size={50} />
            <div style={{ fontSize: 6, color: C.muted, marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Verify</div>
          </div>
        </div>
      </div>

      {/* Bottom navy band */}
      <div style={{ background: C.navy, color: C.brass, padding: '10px 36px', display: 'flex', justifyContent: 'space-between', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        <span>Issued {fmtDate(p.date)}</span>
        <span>Simpleton · LaDale Industries</span>
        <span>Reference № {p.appraisalNumber}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  5. LEDGER — Instappraise trifold brochure
//  Three-panel modern corporate layout, navy header band, information
//  dense, prints well as a brochure.
// ═══════════════════════════════════════════════════════════════════════
export function LedgerTemplate(p: TemplateProps) {
  const C = { bg: '#ffffff', navy: '#0a1d3b', accent: '#2e5090', gold: '#c9a84c', ink: '#1a1a1a', muted: '#64748b', hairline: '#e2e8f0' };
  const rows = specRows(p.itemSpecs);
  const retail = money0(p.report?.retailReplacement) || fmtMoney(p.retailValue);

  const PanelHeader = ({ label }: { label: string }) => (
    <div style={{
      background: C.navy, color: '#fff',
      padding: '10px 14px', fontSize: 9,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      borderLeft: `3px solid ${C.gold}`,
      fontWeight: 600,
    }}>
      {label}
    </div>
  );

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: '"Inter", -apple-system, sans-serif', minHeight: '100%' }}>
      {/* Top band */}
      <div style={{ background: C.navy, color: '#fff', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', marginBottom: 2 }}>
            Simpleton Appraisal Services
          </div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 400, letterSpacing: '0.02em' }}>
            Ledger <span style={{ fontStyle: 'italic', color: C.gold }}>Report</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10 }}>
          <div style={{ color: C.gold, letterSpacing: '0.1em' }}>Appraisal № {p.appraisalNumber}</div>
          <div style={{ opacity: 0.75, marginTop: 2 }}>{fmtDate(p.date)}</div>
        </div>
      </div>
      <div style={{ height: 2, background: C.gold }} />

      {/* Three-panel grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>

        {/* PANEL 1 — Images + owner */}
        <div style={{ borderRight: `1px solid ${C.hairline}` }}>
          <PanelHeader label="01 · Subject" />
          <div style={{ padding: 16 }}>
            {p.images.length > 0 ? (
              <div>
                <img src={p.images[0]} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: `1px solid ${C.hairline}`, background: '#f8fafc' }} />
                {p.images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 6 }}>
                    {p.images.slice(1, 4).map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: `1px solid ${C.hairline}`, background: '#f8fafc' }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: '100%', aspectRatio: '1', border: `1px dashed ${C.hairline}`, background: '#f8fafc' }} />
            )}

            <div style={{ marginTop: 14, padding: '10px 0', borderTop: `1px solid ${C.hairline}` }}>
              <div style={{ fontSize: 8, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Prepared For</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink }}>{p.customerName || '—'}</div>
              {p.customerAddress && <div style={{ fontSize: 10, color: C.muted }}>{p.customerAddress}</div>}
              {p.customerCityStateZip && <div style={{ fontSize: 10, color: C.muted }}>{p.customerCityStateZip}</div>}
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 8, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Category</div>
              <div style={{ fontSize: 10, color: C.ink, textTransform: 'capitalize' }}>{p.itemCategory || 'jewelry'}</div>
            </div>
          </div>
        </div>

        {/* PANEL 2 — Description + specs */}
        <div style={{ borderRight: `1px solid ${C.hairline}` }}>
          <PanelHeader label="02 · Description & Specifications" />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 10, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: C.ink, marginBottom: 14, fontFamily: 'Georgia, serif' }}>
              {p.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Description will appear here...</span>}
            </div>

            {rows.length > 0 && (
              <div style={{ border: `1px solid ${C.hairline}`, borderRadius: 3, overflow: 'hidden' }}>
                {rows.map((r, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '95px 1fr',
                    fontSize: 9,
                    background: i % 2 === 0 ? '#f8fafc' : '#fff',
                    borderBottom: i < rows.length - 1 ? `0.5px solid ${C.hairline}` : 'none',
                  }}>
                    <div style={{ padding: '5px 8px', color: C.muted, fontWeight: 600, textTransform: 'uppercase', fontSize: 7, letterSpacing: '0.1em', borderRight: `0.5px solid ${C.hairline}` }}>
                      {r.label}
                    </div>
                    <div style={{ padding: '5px 8px', color: C.ink }}>{r.value}</div>
                  </div>
                ))}
              </div>
            )}

            {p.report?.materialAnalysis && (
              <div style={{ marginTop: 14, padding: '10px', background: '#f8fafc', borderLeft: `2px solid ${C.accent}`, fontSize: 9, lineHeight: 1.6, color: C.ink, fontStyle: 'italic' }}>
                <div style={{ fontSize: 7, color: C.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3, fontStyle: 'normal', fontWeight: 700 }}>Material Analysis</div>
                {p.report.materialAnalysis}
              </div>
            )}
          </div>
        </div>

        {/* PANEL 3 — Valuation + signature */}
        <div>
          <PanelHeader label="03 · Valuation & Certification" />
          <div style={{ padding: 16 }}>
            {p.report?.retailReplacement && (
              <div style={{
                textAlign: 'center', padding: '14px 10px',
                background: C.navy, color: '#fff', marginBottom: 12,
                border: `1px solid ${C.gold}`,
              }}>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Retail Replacement</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 400 }}>
                  {money0(p.report.retailReplacement)}
                </div>
              </div>
            )}

            {p.report && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  ['Fair Market', p.report.fairMarketLow ? `${money0(p.report.fairMarketLow)}–${money0(p.report.fairMarketHigh || p.report.fairMarketLow)}` : null],
                  ['Estate', money0(p.report.estateValue)],
                  ['Liquidation', money0(p.report.liquidationValue)],
                  ['Intrinsic', money2(p.report.meltValue)],
                ].filter(([, v]) => v).map(([label, value], i) => (
                  <div key={i} style={{ padding: '8px 10px', border: `1px solid ${C.hairline}`, borderRadius: 3 }}>
                    <div style={{ fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {!p.report && retail && (
              <div style={{
                textAlign: 'center', padding: '14px 10px',
                background: C.navy, color: '#fff', marginBottom: 12,
                border: `1px solid ${C.gold}`,
              }}>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Retail Value</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 400 }}>{retail}</div>
              </div>
            )}

            {p.report?.keyFactors && p.report.keyFactors.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 7, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Key Factors</div>
                <ul style={{ margin: 0, paddingLeft: 14, fontSize: 9, color: C.ink, lineHeight: 1.6 }}>
                  {p.report.keyFactors.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            {/* Signature block */}
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: `1px solid ${C.hairline}` }}>
              <div style={{
                fontFamily: '"Snell Roundhand", "Apple Chancery", cursive',
                fontSize: 16, fontStyle: 'italic', color: C.ink,
                borderBottom: `0.5px solid ${C.muted}`, paddingBottom: 2,
              }}>
                Demiris Brown
              </div>
              <div style={{ fontSize: 7, color: C.muted, marginTop: 2, fontWeight: 600 }}>
                DEMIRIS BROWN, GG
              </div>
              <div style={{ fontSize: 7, color: C.muted }}>
                GIA Graduate Gemologist
              </div>
            </div>

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <QRCode shareToken={p.shareToken} appraisalNumber={p.appraisalNumber} size={46} />
              <div style={{ fontSize: 7, color: C.muted, letterSpacing: '0.05em', lineHeight: 1.5 }}>
                Scan to verify this appraisal against the Simpleton record.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, color: 'rgba(255,255,255,0.7)', padding: '8px 28px', display: 'flex', justifyContent: 'space-between', fontSize: 7, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        <span>simpletonapp.com</span>
        <span>Simpleton Appraisal Services</span>
        <span>© {new Date().getFullYear()} LaDale Industries LLC</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  Router — maps template keys (new + legacy) to the rendered component
// ═══════════════════════════════════════════════════════════════════════
export function AppraisalTemplate({ templateStyle, ...props }: TemplateProps & { templateStyle: string }) {
  switch (templateStyle) {
    // New keys
    case 'heritage': return <HeritageTemplate {...props} />;
    case 'atelier':  return <AtelierTemplate {...props} />;
    case 'boutique': return <BoutiqueTemplate {...props} />;
    case 'vault':    return <VaultTemplate {...props} />;
    case 'ledger':   return <LedgerTemplate {...props} />;
    // Legacy aliases (pre-rebrand saved appraisals)
    case 'classic':      return <HeritageTemplate {...props} />;
    case 'elegant':      return <AtelierTemplate {...props} />;
    case 'modern':       return <BoutiqueTemplate {...props} />;
    case 'professional': return <VaultTemplate {...props} />;
    case 'detailed':     return <LedgerTemplate {...props} />;
    default:             return <HeritageTemplate {...props} />;
  }
}

// Legacy named exports so any stale imports elsewhere still resolve.
export const ClassicTemplate = HeritageTemplate;
export const ElegantTemplate = AtelierTemplate;
export const ModernTemplate = BoutiqueTemplate;
export const ProfessionalTemplate = VaultTemplate;
export const DetailedTemplate = LedgerTemplate;
