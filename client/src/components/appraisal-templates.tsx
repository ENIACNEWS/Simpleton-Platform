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
}

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

function Watermark() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '5in', height: '5in',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 0, opacity: 0.06,
    }}>
      <img src="/simpleton-logo.jpeg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%)' }} />
    </div>
  );
}

function BrandHeader({ centered }: { centered?: boolean }) {
  if (centered) {
    return (
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 50, objectFit: 'contain', display: 'inline-block' }} />
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.08em', color: '#1a1a1a', marginTop: 4, fontFamily: '"Playfair Display", Georgia, serif' }}>
          Simpleton
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', marginTop: 2 }}>
          Precision Pricing, Simplified
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 50, objectFit: 'contain', display: 'block' }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.08em', color: '#1a1a1a', fontFamily: '"Playfair Display", Georgia, serif' }}>
          Simpleton
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', marginTop: 2 }}>
          Precision Pricing, Simplified
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({ isCertified, certifiedAt }: { isCertified: boolean; certifiedAt?: string | null }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
        fontStyle: 'italic', fontSize: 18,
        borderBottom: '1px solid #444', paddingBottom: 4, marginBottom: 5,
        color: '#1a1a1a',
      }}>
        {isCertified ? 'Demiris Brown' : '________________'}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700 }}>Demiris Brown</div>
      <div style={{ fontSize: 10, lineHeight: 1.5, color: '#333' }}>
        GIA Certified Jewelry Appraiser<br />
        LaDale Industries LLC
      </div>
    </div>
  );
}

function Disclaimer({ isCertified, certifiedAt, appraisalNumber }: { isCertified: boolean; certifiedAt?: string | null; appraisalNumber: string }) {
  return (
    <div style={{ fontSize: 9, color: '#888', lineHeight: 1.6, borderTop: '0.5px solid #ccc', paddingTop: 10 }}>
      {isCertified
        ? `This document is an officially CERTIFIED AND LEGALLY RECOGNIZED APPRAISAL, personally reviewed and confirmed by Demiris Brown, GIA Certified Jewelry Appraiser, on ${fmtDate(certifiedAt || null)}. Certification reference: ${appraisalNumber}.`
        : 'This appraisal represents the appraiser\'s opinion of the described item based on examination, market research, and current market conditions. Values stated are estimates for the purpose indicated. This appraisal is for informational purposes only and does not constitute a guarantee of value. Professional authentication and in-person evaluation is recommended for all significant transactions. All appraisals conducted by a GIA Certified Jewelry Appraiser.'
      }
    </div>
  );
}

function SpecsGrid({ specs, style }: { specs?: ItemSpecs | null; style?: 'classic' | 'elegant' | 'modern' | 'professional' | 'detailed' }) {
  if (!specs) return null;
  const rows: { label: string; value: string }[] = [];
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
  if (rows.length === 0) return null;

  const isElegant = style === 'elegant';
  const borderColor = isElegant ? '#e0d5c0' : '#ddd';
  const headerBg = isElegant ? '#fffef5' : style === 'detailed' ? '#1a1a2e' : '#f8f8f8';
  const headerColor = style === 'detailed' ? '#fff' : isElegant ? '#8a7340' : '#444';

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: headerColor, background: headerBg,
        padding: '6px 10px', borderTop: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`,
        borderTopLeftRadius: 3, borderTopRightRadius: 3,
      }}>
        Item Specifications
      </div>
      <div style={{ border: `1px solid ${borderColor}`, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', borderBottom: i < rows.length - 1 ? `1px solid ${borderColor}` : 'none',
            fontSize: 11.5, lineHeight: 1.6,
          }}>
            <div style={{
              width: 140, flexShrink: 0, fontWeight: 700, padding: '5px 10px',
              background: i % 2 === 0 ? (isElegant ? '#fffef8' : '#fafafa') : '#fff',
              color: '#333', borderRight: `1px solid ${borderColor}`,
            }}>
              {r.label}
            </div>
            <div style={{
              flex: 1, padding: '5px 10px',
              background: i % 2 === 0 ? (isElegant ? '#fffef8' : '#fafafa') : '#fff',
              color: '#1a1a1a',
            }}>
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClassicTemplate(p: TemplateProps) {
  const money = fmtMoney(p.retailValue);
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Watermark />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <BrandHeader />
          <div style={{ textAlign: 'right', fontSize: 13, paddingTop: 8, color: '#1a1a1a' }}>
            {fmtDate(p.date)}
          </div>
        </div>

        <div style={{ borderTop: '2.5px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '9px 0', textAlign: 'center', margin: '8px 0 14px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Jewelry Identification and Appraisal
          </div>
        </div>

        <div style={{ fontSize: 13, marginBottom: 14, lineHeight: 1.7 }}>
          <span style={{ fontWeight: 700 }}>Property of:&nbsp;</span>
          <span>{p.customerName || '\u00A0'}</span>
          {p.customerAddress && <><br /><span style={{ paddingLeft: '7em' }}>{p.customerAddress}</span></>}
          {p.customerCityStateZip && <><br /><span style={{ paddingLeft: '7em' }}>{p.customerCityStateZip}</span></>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #888', paddingBottom: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Jewelry Appraisal No.&nbsp;{p.appraisalNumber}</div>
          <div style={{ fontSize: 13 }}>Page 1 of 1</div>
        </div>

        <SpecsGrid specs={p.itemSpecs} style="classic" />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#1a1a1a', marginBottom: 8 }}>
          <span>Description of Article</span>
          <span>Retail Value at Simpleton</span>
        </div>

        <div style={{ display: 'flex', gap: 20, minHeight: 200, marginBottom: 16 }}>
          <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.75, textAlign: 'justify', whiteSpace: 'pre-wrap', color: '#1a1a1a' }}>
            {p.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Description will appear here...</span>}
          </div>
          {p.images.length > 0 && (
            <div style={{ width: 150, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              {p.images.slice(0, 3).map((img, i) => (
                <img key={i} src={img} alt={`Item ${i + 1}`} style={{ width: '100%', borderRadius: 3, objectFit: 'contain', border: '1px solid #ddd', maxHeight: 120 }} />
              ))}
            </div>
          )}
        </div>

        {money && (
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <div style={{ display: 'inline-block', fontSize: 20, fontWeight: 700, borderTop: '1.5px solid #1a1a1a', borderBottom: '1.5px solid #1a1a1a', padding: '5px 0', minWidth: 160, textAlign: 'right' }}>
              {money}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid #bbb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Simpleton</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Appraisal Department</div>
            <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 44, objectFit: 'contain' }} />
          </div>
          <SignatureBlock isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} />
        </div>

        <Disclaimer isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} appraisalNumber={p.appraisalNumber} />
      </div>
    </div>
  );
}

export function ElegantTemplate(p: TemplateProps) {
  const money = fmtMoney(p.retailValue);
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Watermark />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <svg width="50" height="50" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
              <path d="M50 5 L60 25 L45 15 L55 15 L40 25 Z" fill="#c9a84c" opacity="0.9" />
              <path d="M25 20 C15 30, 10 45, 25 55 C10 50, 5 35, 15 25 Z" fill="#c9a84c" opacity="0.7" />
              <path d="M75 20 C85 30, 90 45, 75 55 C90 50, 95 35, 85 25 Z" fill="#c9a84c" opacity="0.7" />
              <path d="M20 50 C15 60, 20 70, 30 72 C18 68, 14 58, 18 48 Z" fill="#c9a84c" opacity="0.6" />
              <path d="M80 50 C85 60, 80 70, 70 72 C82 68, 86 58, 82 48 Z" fill="#c9a84c" opacity="0.6" />
              <path d="M30 70 C35 80, 45 85, 50 85 C40 82, 33 76, 28 68 Z" fill="#c9a84c" opacity="0.5" />
              <path d="M70 70 C65 80, 55 85, 50 85 C60 82, 67 76, 72 68 Z" fill="#c9a84c" opacity="0.5" />
            </svg>
            <div>
              <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 40, objectFit: 'contain', display: 'block' }} />
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', color: '#1a1a1a', marginTop: 2, fontFamily: '"Playfair Display", Georgia, serif' }}>
                Simpleton
              </div>
            </div>
          </div>
          <div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#8a7340', textTransform: 'uppercase', marginTop: 4 }}>
            Precision Pricing, Simplified
          </div>
        </div>

        <div style={{ borderTop: '3px solid #c9a84c', borderBottom: '1px solid #c9a84c', padding: '12px 0', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
            Jewelry Appraisal Report
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 16 }}>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Appraisal Number: </span>
            <span>{p.appraisalNumber}</span>
          </div>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Date: </span>
            <span>{fmtDate(p.date)}</span>
          </div>
        </div>

        <SpecsGrid specs={p.itemSpecs} style="elegant" />

        <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, marginBottom: 16, lineHeight: 1.7 }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Description: </span>
              <span style={{ fontSize: 12 }}>{p.customerName}'s item</span>
            </div>

            <div style={{ fontSize: 12.5, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#1a1a1a' }}>
              {p.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Description will appear here...</span>}
            </div>

            {p.customerName && (
              <div style={{ marginTop: 20, padding: '10px 0', borderTop: '1px solid #e0d5c0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8a7340', marginBottom: 6 }}>Prepared For</div>
                <div style={{ fontSize: 12 }}>{p.customerName}</div>
                {p.customerAddress && <div style={{ fontSize: 12 }}>{p.customerAddress}</div>}
                {p.customerCityStateZip && <div style={{ fontSize: 12 }}>{p.customerCityStateZip}</div>}
              </div>
            )}
          </div>

          {p.images.length > 0 && (
            <div style={{ width: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', paddingTop: 30 }}>
              {p.images.slice(0, 3).map((img, i) => (
                <img key={i} src={img} alt={`Item ${i + 1}`} style={{
                  width: '100%', borderRadius: 4, objectFit: 'contain',
                  border: '1px solid #e0d5c0', maxHeight: 130, padding: 4, background: '#fffef5',
                }} />
              ))}
            </div>
          )}
        </div>

        {money && (
          <div style={{
            background: '#fffef5', border: '2px solid #c9a84c', borderRadius: 4,
            padding: '12px 20px', textAlign: 'center', marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a7340', marginBottom: 4 }}>
              Estimated Retail Value
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>
              {money}
            </div>
          </div>
        )}

        <div style={{ borderTop: '2px solid #c9a84c', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 40, objectFit: 'contain', marginBottom: 4 }} />
            <div style={{ fontSize: 10, color: '#8a7340', fontWeight: 600 }}>Simpleton Appraisals</div>
          </div>
          <SignatureBlock isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} />
        </div>

        <Disclaimer isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} appraisalNumber={p.appraisalNumber} />
      </div>
    </div>
  );
}

export function ModernTemplate(p: TemplateProps) {
  const money = fmtMoney(p.retailValue);
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <BrandHeader centered />

        <div style={{ textAlign: 'center', fontSize: 10, color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
          demiris@simpletonapp.com · simpletonapp.com
        </div>

        <div style={{ textAlign: 'center', margin: '16px 0', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '14px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            Jewelry Appraisal Report
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 24, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <div>
            <span style={{ fontWeight: 700 }}>Appraisal Number: </span>{p.appraisalNumber}
          </div>
          <div>
            <span style={{ fontWeight: 700 }}>Date: </span>{fmtDate(p.date)}
          </div>
        </div>

        <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <div style={{ marginBottom: 20, fontSize: 13 }}>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em', marginBottom: 6, color: '#444' }}>Prepared For</div>
            <div style={{ color: '#333' }}>{p.customerName}</div>
            {p.customerAddress && <div style={{ color: '#333' }}>{p.customerAddress}</div>}
            {p.customerCityStateZip && <div style={{ color: '#333' }}>{p.customerCityStateZip}</div>}
          </div>

          <SpecsGrid specs={p.itemSpecs} style="modern" />

          {p.images.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <img
                src={p.images[0]}
                alt="Item"
                style={{
                  maxWidth: 280, maxHeight: 220, objectFit: 'contain',
                  borderRadius: 6, border: '1px solid #e0e0e0',
                }}
              />
            </div>
          )}

          <div style={{ fontSize: 12.5, lineHeight: 1.85, whiteSpace: 'pre-wrap', color: '#1a1a1a', marginBottom: 24 }}>
            {p.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Description will appear here...</span>}
          </div>

          {money && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '14px 0', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444' }}>Estimated Retail Value</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{money}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, paddingTop: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: 8 }}>Certified By</div>
            <SignatureBlock isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} />
          </div>
        </div>

        <Disclaimer isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} appraisalNumber={p.appraisalNumber} />
      </div>
    </div>
  );
}

export function ProfessionalTemplate(p: TemplateProps) {
  const money = fmtMoney(p.retailValue);
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Watermark />
      <div style={{ position: 'relative', zIndex: 1, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <BrandHeader />
        </div>

        <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: 20, paddingBottom: 4 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 12 }}>
          <div style={{ lineHeight: 1.7 }}>
            {p.customerName && <div style={{ fontWeight: 500 }}>{p.customerName}</div>}
            {p.customerAddress && <div>{p.customerAddress}</div>}
            {p.customerCityStateZip && <div>{p.customerCityStateZip}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><span style={{ fontWeight: 700 }}>Appraisal Report No: </span>{p.appraisalNumber}</div>
          </div>
        </div>

        {p.images.length > 0 && (
          <div style={{ float: 'right', marginLeft: 20, marginBottom: 10 }}>
            <img src={p.images[0]} alt="Item" style={{
              width: 160, height: 160, objectFit: 'contain', borderRadius: 4,
              border: '1px solid #ddd',
            }} />
          </div>
        )}

        <div style={{ marginBottom: 16, fontSize: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <span>Purpose of Appraisal: </span>
            <span style={{ fontWeight: 700 }}>Estimated Retail Replacement Value</span>
          </div>
          <div>
            <span>Function of Appraisal: </span>
            <span style={{ fontWeight: 700 }}>Insurance</span>
          </div>
        </div>

        <SpecsGrid specs={p.itemSpecs} style="professional" />

        <div style={{ fontSize: 12, lineHeight: 1.85, whiteSpace: 'pre-wrap', color: '#1a1a1a', marginBottom: 20, textAlign: 'justify' }}>
          {p.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Description will appear here...</span>}
        </div>

        <div style={{ clear: 'both' }} />

        {money && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30, marginTop: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontStyle: 'italic', marginBottom: 4 }}>Estimated Retail Replacement Value</div>
              <div style={{ fontSize: 20, fontWeight: 700, borderTop: '1px solid #1a1a1a', paddingTop: 4 }}>
                $ {money.replace('$', '').trim()}
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid #ccc', paddingTop: 12, marginBottom: 20, fontSize: 11, color: '#555' }}>
          <div><span style={{ fontWeight: 700 }}>Date: </span>{fmtDate(p.date)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 36, objectFit: 'contain', marginBottom: 4 }} />
            <div style={{ fontSize: 10, color: '#555' }}>simpletonapp.com</div>
          </div>
          <SignatureBlock isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} />
        </div>

        <Disclaimer isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} appraisalNumber={p.appraisalNumber} />
      </div>
    </div>
  );
}

export function DetailedTemplate(p: TemplateProps) {
  const money = fmtMoney(p.retailValue);
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Watermark />
      <div style={{ position: 'relative', zIndex: 1, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <BrandHeader centered />
        <div style={{ textAlign: 'center', fontSize: 10, color: '#666', marginTop: 2, marginBottom: 10 }}>
          demiris@simpletonapp.com · simpletonapp.com
        </div>

        <div style={{ textAlign: 'center', margin: '10px 0 16px', fontFamily: '"Playfair Display", Georgia, serif' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a' }}>
            Jewelry Appraisal
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: 4 }}>Prepared For</div>
            <div>{p.customerName}</div>
            {p.customerAddress && <div>{p.customerAddress}</div>}
            {p.customerCityStateZip && <div>{p.customerCityStateZip}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: 4 }}>Appraisal Details</div>
            <div>Appraisal #: {p.appraisalNumber}</div>
            <div>Date: {fmtDate(p.date)}</div>
          </div>
        </div>

        <SpecsGrid specs={p.itemSpecs} style="detailed" />

        <div style={{
          border: '1.5px solid #c9a84c', borderRadius: 4, overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: p.images.length > 0 ? '100px 1fr 100px' : '1fr 100px',
            background: '#1a1a2e', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {p.images.length > 0 && <div style={{ padding: '8px 10px' }}>Image</div>}
            <div style={{ padding: '8px 10px' }}>Description</div>
            <div style={{ padding: '8px 10px', textAlign: 'right' }}>Appraised Value</div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: p.images.length > 0 ? '100px 1fr 100px' : '1fr 100px',
            borderTop: '1px solid #e0d5c0', minHeight: 200,
          }}>
            {p.images.length > 0 && (
              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, borderRight: '1px solid #e0d5c0' }}>
                {p.images.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt={`Item ${i + 1}`} style={{ width: '100%', objectFit: 'contain', borderRadius: 3, maxHeight: 80 }} />
                ))}
              </div>
            )}
            <div style={{ padding: '10px 12px', fontSize: 11.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#1a1a1a', borderRight: '1px solid #e0d5c0' }}>
              {p.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Description will appear here...</span>}
            </div>
            <div style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
              {money || '\u2014'}
            </div>
          </div>

          {money && (
            <div style={{
              display: 'flex', justifyContent: 'flex-end', borderTop: '1.5px solid #c9a84c',
              padding: '10px 12px', background: '#fffef5',
            }}>
              <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a7340' }}>
                  Total Appraised Value
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                  {money}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: '#f8f7f4', border: '1px solid #e0d5c0', borderRadius: 4,
          padding: '10px 14px', marginBottom: 20, fontSize: 9.5, lineHeight: 1.6, color: '#555',
        }}>
          This appraisal has been carried out in accordance with current market prices and does not include any state or federal tax. In the case of damage to any of the items described above, the appraiser will not be responsible for any cost of replacement of such items. The foregoing appraisal is made and accepted upon the express understanding that no liability or responsibility is incurred by the appraiser.
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 8, borderTop: '1px solid #ccc', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Appraiser Signature:</div>
            <img src="/simpleton-logo.jpeg" alt="Simpleton" style={{ height: 32, objectFit: 'contain' }} />
          </div>
          <SignatureBlock isCertified={!!p.isCertified} certifiedAt={p.certifiedAt} />
        </div>

        <div style={{
          borderTop: '2px solid #1a1a1a', paddingTop: 7,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9.5, color: '#555',
        }}>
          <span>Simpleton · simpletonapp.com</span>
          <span>demiris@simpletonapp.com</span>
          <span>&copy; {new Date().getFullYear()} Simpleton</span>
        </div>
      </div>
    </div>
  );
}

export function AppraisalTemplate({ templateStyle, ...props }: TemplateProps & { templateStyle: string }) {
  switch (templateStyle) {
    case 'elegant': return <ElegantTemplate {...props} />;
    case 'modern': return <ModernTemplate {...props} />;
    case 'professional': return <ProfessionalTemplate {...props} />;
    case 'detailed': return <DetailedTemplate {...props} />;
    default: return <ClassicTemplate {...props} />;
  }
}
