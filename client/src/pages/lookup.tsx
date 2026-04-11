import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { Search, ArrowLeft, Loader2, AlertCircle, Shield, FileText, CheckCircle } from 'lucide-react';
import { AppraisalTemplate } from '@/components/appraisal-templates';
import type { ItemSpecs } from '@/components/appraisal-templates';

// ───────────────────────────────────────────────────────────────────────
//  Design tokens (shared editorial language)
// ───────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0b0b12',
  bgGradient: 'radial-gradient(ellipse at 50% 20%, #181827 0%, #0b0b12 60%)',
  ink: '#f4efe2',
  inkMuted: '#9a937f',
  gold: '#c9a84c',
  goldDeep: '#a8873a',
  goldGlow: 'rgba(201,168,76,0.25)',
  hairline: 'rgba(244,239,226,0.10)',
  danger: '#d96d5e',
  success: '#6ec29a',
  display: '"Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, system-ui, sans-serif',
  serif: '"EB Garamond", "Playfair Display", Georgia, serif',
};

interface AppraisalResult {
  appraisalNumber: string;
  status: string;
  itemCategory: string;
  itemDescription: string;
  retailValue: string | null;
  itemImages: string[];
  customerName: string;
  customerAddress: string | null;
  customerCityStateZip: string | null;
  appraisalDate: string | null;
  certifiedBy: string | null;
  certificationNotes: string | null;
  certifiedAt: string | null;
  templateStyle: string;
  itemSpecs: ItemSpecs | null;
  appraisalReport: any | null;
  shareToken: string | null;
  createdAt: string;
}

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AppraisalResult | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/appraisal/lookup/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Appraisal not found.');
        return;
      }

      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
  };

  const isCertified = result?.status === 'certified';

  return (
    <div style={{
      background: T.bgGradient,
      minHeight: '100vh',
      color: T.ink,
      fontFamily: T.body,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .lookup-fade { animation: fadeUp 0.6s ease-out both; }
        .lookup-input:focus { outline: none; border-color: ${T.gold} !important; box-shadow: 0 0 0 3px ${T.goldGlow}; }
        .lookup-input::placeholder { color: rgba(154,147,127,0.5); font-style: italic; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        padding: '14px 32px',
        borderBottom: `1px solid ${T.hairline}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(11,11,18,0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1px solid ${T.hairline}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft size={14} color={T.inkMuted} />
          </div>
          <span style={{ fontFamily: T.display, fontSize: 14, color: T.ink }}>
            <span style={{ fontStyle: 'italic', color: T.gold }}>Simpleton</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: T.inkMuted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          <Shield size={12} color={T.gold} />
          Verification Portal
        </div>
      </div>

      {/* ── Hero + Search ── */}
      <div style={{
        maxWidth: 720, margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        {/* Seal */}
        <div className="lookup-fade" style={{
          width: 72, height: 72, borderRadius: '50%',
          border: `1.5px solid ${T.gold}44`,
          background: `rgba(201,168,76,0.05)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <FileText size={28} color={T.gold} />
        </div>

        <h1 className="lookup-fade" style={{
          fontFamily: T.display, fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 400, color: T.ink, lineHeight: 1.1,
          margin: '0 0 8px',
        }}>
          Verify an{' '}
          <span style={{ fontStyle: 'italic', color: T.gold }}>Appraisal</span>
        </h1>

        <p className="lookup-fade" style={{
          fontFamily: T.serif, fontSize: 17, fontStyle: 'italic',
          color: T.inkMuted, maxWidth: 480, margin: '0 auto 48px',
          lineHeight: 1.7,
        }}>
          Enter your Simpleton appraisal number to view the full report,
          valuation details, and certification status.
        </p>

        {/* ── Search Bar ── */}
        <div className="lookup-fade" style={{
          display: 'flex', gap: 0, maxWidth: 520, margin: '0 auto',
          border: `1px solid ${T.hairline}`,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'rgba(244,239,226,0.03)',
          transition: 'border-color 0.3s',
        }}>
          <input
            ref={inputRef}
            className="lookup-input"
            value={query}
            onChange={e => setQuery(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="SN60000001"
            style={{
              flex: 1, padding: '18px 24px',
              background: 'transparent', border: 'none',
              color: T.ink, fontSize: 18,
              fontFamily: '"JetBrains Mono", "SF Mono", Menlo, monospace',
              letterSpacing: '0.08em',
            }}
            autoFocus
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            style={{
              padding: '18px 32px',
              background: query.trim() ? T.gold : 'transparent',
              border: 'none',
              borderLeft: `1px solid ${T.hairline}`,
              color: query.trim() ? '#0b0b12' : T.inkMuted,
              cursor: loading || !query.trim() ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: T.display,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Search size={18} />
            )}
            {!loading && 'Verify'}
          </button>
        </div>

        {/* ── Format hint ── */}
        <div style={{
          marginTop: 16, fontSize: 11, color: T.inkMuted,
          fontFamily: T.serif, fontStyle: 'italic',
        }}>
          Format: SN followed by 8 digits (e.g. SN60000001)
        </div>
      </div>

      {/* ── Error State ── */}
      {searched && error && (
        <div className="lookup-fade" style={{
          maxWidth: 520, margin: '0 auto 60px',
          padding: '24px 28px', textAlign: 'center',
          border: `1px solid rgba(217,109,94,0.3)`,
          borderRadius: 3,
          background: 'rgba(217,109,94,0.06)',
        }}>
          <AlertCircle size={28} color={T.danger} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontFamily: T.display, fontSize: 18, color: T.ink, marginBottom: 6 }}>
            Not Found
          </div>
          <div style={{ fontSize: 13, color: T.inkMuted, fontFamily: T.serif, fontStyle: 'italic', lineHeight: 1.6 }}>
            {error}
            <br />
            Please check the number and try again, or contact{' '}
            <span style={{ color: T.gold }}>intel@simpletonapp.com</span> for assistance.
          </div>
        </div>
      )}

      {/* ── Result: Status Banner + Full Document ── */}
      {result && (
        <div ref={resultRef}>
          {/* Status banner */}
          <div className="lookup-fade" style={{
            maxWidth: 720, margin: '0 auto 24px',
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            border: `1px solid ${isCertified ? 'rgba(110,194,154,0.3)' : T.gold + '44'}`,
            borderRadius: 3,
            background: isCertified ? 'rgba(110,194,154,0.06)' : 'rgba(201,168,76,0.04)',
          }}>
            {isCertified ? (
              <CheckCircle size={18} color={T.success} />
            ) : (
              <FileText size={18} color={T.gold} />
            )}
            <div>
              <span style={{
                fontFamily: T.display, fontSize: 14, fontWeight: 500,
                color: isCertified ? T.success : T.gold,
              }}>
                {isCertified ? 'Certified Appraisal' : 'Pending Certification'}
              </span>
              <span style={{ fontSize: 12, color: T.inkMuted, marginLeft: 12 }}>
                {result.appraisalNumber}
              </span>
            </div>
            {isCertified && result.certifiedAt && (
              <span style={{ fontSize: 11, color: T.inkMuted, fontFamily: T.serif, fontStyle: 'italic', marginLeft: 'auto' }}>
                Certified {new Date(result.certifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Disclosure */}
          <div style={{
            maxWidth: 720, margin: '0 auto 24px',
            padding: '12px 20px',
            border: `1px solid ${T.hairline}`,
            borderLeft: `2px solid ${T.gold}`,
            borderRadius: 2,
            background: 'rgba(201,168,76,0.02)',
            fontSize: 11, color: T.inkMuted, lineHeight: 1.6, fontFamily: T.serif, fontStyle: 'italic',
          }}>
            No AI-generated appraisal is considered certified until the item has been examined
            either in person or through a live Zoom consultation with our GIA certified appraiser.
            Once certified, a signed document will be mailed to the address on file.
          </div>

          {/* Full appraisal document */}
          <div className="lookup-fade" style={{
            width: '8.5in', maxWidth: 'calc(100vw - 2rem)', minHeight: '11in',
            margin: '0 auto 80px',
            background: '#ffffff',
            boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.3)',
            padding: '0.65in 0.75in',
            position: 'relative', overflow: 'hidden',
            fontFamily: '"Times New Roman", Georgia, "Times", serif',
            color: '#1a1a1a', boxSizing: 'border-box',
          }}>
            <AppraisalTemplate
              templateStyle={result.templateStyle || 'heritage'}
              appraisalNumber={result.appraisalNumber}
              customerName={result.customerName}
              customerAddress={result.customerAddress}
              customerCityStateZip={result.customerCityStateZip}
              date={result.appraisalDate || result.createdAt}
              itemCategory={result.itemCategory}
              description={result.itemDescription}
              retailValue={result.retailValue || ''}
              images={result.itemImages || []}
              isCertified={isCertified}
              certifiedBy={result.certifiedBy}
              certifiedAt={result.certifiedAt}
              itemSpecs={result.itemSpecs}
              report={result.appraisalReport}
              shareToken={result.shareToken}
            />
          </div>
        </div>
      )}

      {/* ── Empty footer when no result ── */}
      {!result && !error && searched && !loading && (
        <div style={{ height: 200 }} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
