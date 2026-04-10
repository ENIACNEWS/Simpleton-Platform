import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Edit2, X, FileText, Send, CheckCircle, AlertTriangle, Sparkles, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { AppraisalTemplate } from '@/components/appraisal-templates';
import type { ItemSpecs } from '@/components/appraisal-templates';

interface AppraisalData {
  propertyOwner: string;
  customerEmail: string;
  address: string;
  cityStateZip: string;
  appraisalNumber: string;
  date: string;
  itemCategory: string;
  description: string;
  retailValue: string;
  itemImages: string[];
  zoomRequested: boolean;
  templateStyle: string;
  specs: ItemSpecs;
}

// Premium template catalogue. Each entry is a distinct visual universe —
// see /client/src/components/appraisal-templates.tsx for the render logic.
// Legacy keys (classic/elegant/modern/professional/detailed) remain valid
// so saved appraisals from before the rebrand still render.
const TEMPLATE_OPTIONS = [
  { id: 'heritage',  name: 'Heritage',  tagline: 'GIA-inspired laboratory dossier',    accent: '#b8935a' },
  { id: 'atelier',   name: 'Atelier',   tagline: 'Sotheby’s editorial minimalism',     accent: '#1a1a1a' },
  { id: 'boutique',  name: 'Boutique',  tagline: 'Tiffany & Co. refined restraint',    accent: '#81d8d0' },
  { id: 'vault',     name: 'Vault',     tagline: 'Christie’s auction catalogue',       accent: '#b8935a' },
  { id: 'ledger',    name: 'Ledger',    tagline: 'Instappraise trifold brochure',      accent: '#2e5090' },
];

const CONDITION_OPTIONS = [
  { value: 'Excellent',  desc: 'Like new, no visible wear' },
  { value: 'Very Good',  desc: 'Minor wear, well maintained' },
  { value: 'Good',       desc: 'Normal wear consistent with age' },
  { value: 'Fair',       desc: 'Noticeable wear or minor damage' },
  { value: 'Poor',       desc: 'Significant wear or damage' },
];

// Design tokens — one place to change the whole page palette.
const T = {
  bg: '#0b0b12',
  bgGradient: 'radial-gradient(ellipse at top, #181827 0%, #0b0b12 65%)',
  surface: '#faf7f0',          // cream paper
  surfaceInk: '#111018',       // body ink on cream
  ink: '#f4efe2',              // body ink on dark
  inkMuted: '#9a937f',         // labels on dark
  hairline: 'rgba(244,239,226,0.12)',
  gold: '#c9a84c',
  goldDeep: '#a8873a',
  goldGlow: 'rgba(201,168,76,0.32)',
  rose: '#d4a574',
  danger: '#d96d5e',
  success: '#6ec29a',
  serif: '"Playfair Display", "EB Garamond", Georgia, serif',
  display: '"Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
};

export default function JewelryAppraisal() {
  const [editing, setEditing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [descriptionGenerated, setDescriptionGenerated] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [reportOpen, setReportOpen] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Motor City Jewelry template is Demiris Brown's personal form —
  // only visible when the admin (user id 1) is logged in.
  const isAdmin = user && ((user as any).id === 1 || (user as any).role === 'admin');
  const templateOptions = isAdmin
    ? [...TEMPLATE_OPTIONS, { id: 'motorcity', name: 'Motor City', tagline: 'Demiris Brown personal form', accent: '#c41e2a' }]
    : TEMPLATE_OPTIONS;
  const [data, setData] = useState<AppraisalData>({
    propertyOwner: '',
    customerEmail: '',
    address: '',
    cityStateZip: '',
    appraisalNumber: '',
    date: new Date().toISOString().split('T')[0],
    itemCategory: 'jewelry',
    description: '',
    retailValue: '',
    itemImages: [],
    zoomRequested: false,
    templateStyle: 'heritage',
    specs: {},
  });
  const imgRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/appraisal/next-number')
      .then(r => r.json())
      .then(d => { if (d.appraisalNumber) setData(p => ({ ...p, appraisalNumber: d.appraisalNumber })); })
      .catch(() => setData(p => ({ ...p, appraisalNumber: `S${Math.floor(1000 + Math.random() * 9000)}` })));
  }, []);

  const set = (k: keyof AppraisalData, v: any) => setData(p => ({ ...p, [k]: v }));
  const setSpec = (k: keyof ItemSpecs, v: string) => setData(p => ({ ...p, specs: { ...p.specs, [k]: v } }));

  const readFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(f => {
      if (!f.type.startsWith('image/')) return;
      const r = new FileReader();
      r.onload = ev =>
        setData(p => ({ ...p, itemImages: [...p.itemImages, ev.target?.result as string].slice(0, 5) }));
      r.readAsDataURL(f);
    });
  };

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) readFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) readFiles(e.dataTransfer.files);
  };

  const doPrint = () => {
    setEditing(false);
    setTimeout(() => window.print(), 200);
  };

  const handleGenerateDescription = async () => {
    if (data.itemImages.length === 0) {
      toast({ title: 'Photographs required', description: 'Please add at least one photo of the item so Simplicity can analyze it.', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
      const res = await fetch('/api/appraisal/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          images: data.itemImages,
          itemCategory: data.itemCategory,
          specs: data.specs,
        }),
      });

      let body: any = null;
      try { body = await res.json(); } catch { /* non-JSON body */ }

      if (!res.ok) {
        const serverMsg = body?.error || body?.response || `HTTP ${res.status}`;
        throw new Error(serverMsg);
      }
      if (!body || !body.description) {
        throw new Error('Server returned no description. Try again, or try a different photo.');
      }

      const result = body;
      set('description', result.description);
      setDescriptionGenerated(true);
      setReport(result.report || null);
      if (result.estimatedValue && result.estimatedValue !== '0') {
        set('retailValue', result.estimatedValue);
      }
      if (result.specs) {
        setData(p => {
          const merged = { ...p.specs };
          for (const [k, v] of Object.entries(result.specs)) {
            if (v && String(v).trim() && !merged[k as keyof typeof merged]?.trim()) {
              (merged as any)[k] = String(v).trim();
            }
          }
          return { ...p, specs: merged };
        });
      }
      toast({ title: 'Description composed', description: 'Simplicity has analysed your item and written a professional appraisal. Review and edit below.' });
      setTimeout(() => descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'Request timed out after 2 minutes. Please try again with a clearer photograph.'
        : (err?.message || 'Could not generate description. Please try again.');
      toast({ title: 'Generation failed', description: msg, variant: 'destructive' });
    } finally {
      clearTimeout(timeoutId);
      setGenerating(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!data.propertyOwner.trim()) {
      toast({ title: 'Name required', description: 'Please enter your name to submit the appraisal.', variant: 'destructive' });
      return;
    }
    if (!data.customerEmail.trim() || !data.customerEmail.includes('@')) {
      toast({ title: 'Valid email required', description: 'Please enter a valid email address so we can contact you.', variant: 'destructive' });
      return;
    }
    if (!data.description.trim()) {
      toast({ title: 'Description required', description: 'Please add photos and generate a description first, or write one manually.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appraisal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerName: data.propertyOwner,
          customerEmail: data.customerEmail,
          appraisalType: 'Jewelry Appraisal',
          appraisalNumber: data.appraisalNumber,
          itemDescription: data.description,
          retailValue: data.retailValue,
          itemImages: data.itemImages,
          zoomRequested: data.zoomRequested,
          itemCategory: data.itemCategory,
          customerAddress: data.address,
          customerCityStateZip: data.cityStateZip,
          appraisalDate: data.date,
          templateStyle: data.templateStyle,
          itemSpecs: data.specs,
          appraisalReport: report,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || `HTTP ${res.status}`);
      setSubmitted(true);
      toast({
        title: 'Appraisal submitted',
        description: result.message || 'Your appraisal has been submitted for certification review.',
      });
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDiamondItem = data.itemCategory === 'diamond';
  const showStoneFields = isDiamondItem || data.itemCategory === 'jewelry';

  // ───────────────────────────────────────────────────────────────────
  //  Reusable premium primitives
  // ───────────────────────────────────────────────────────────────────
  const sectionLabel = (roman: string, title: string, hint?: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 18 }}>
      <div style={{
        fontFamily: T.display, fontSize: 18, fontWeight: 400, fontStyle: 'italic',
        color: T.gold, letterSpacing: '0.05em', minWidth: 32,
      }}>
        {roman}.
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: T.display, fontSize: 22, fontWeight: 400,
          color: T.ink, letterSpacing: '0.01em', lineHeight: 1.1,
        }}>
          {title}
        </div>
        {hint && (
          <div style={{
            fontFamily: T.body, fontSize: 12, color: T.inkMuted,
            marginTop: 4, letterSpacing: '0.02em', fontStyle: 'italic',
          }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ flex: 1, height: 1, background: T.hairline, marginBottom: 4 }} />
    </div>
  );

  const fieldLabel = (text: string) => (
    <div style={{
      fontFamily: T.body, fontSize: 10, fontWeight: 500,
      textTransform: 'uppercase', letterSpacing: '0.18em',
      color: T.inkMuted, marginBottom: 8,
    }}>
      {text}
    </div>
  );

  const darkInputStyle: React.CSSProperties = {
    background: 'rgba(244,239,226,0.04)',
    border: `1px solid ${T.hairline}`,
    borderRadius: 4,
    color: T.ink,
    fontFamily: T.body,
    fontSize: 14,
    padding: '12px 14px',
    height: 'auto',
  };

  return (
    <div style={{
      background: T.bgGradient,
      minHeight: '100vh',
      color: T.ink,
      fontFamily: T.body,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @media print {
          body, html { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .appraisal-doc {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0.65in 0.75in !important;
            min-height: auto !important;
          }
          @page { size: letter portrait; margin: 0; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .premium-input::placeholder { color: rgba(154,147,127,0.55); font-style: italic; }
        .premium-input:focus-visible { outline: none; border-color: ${T.gold} !important; box-shadow: 0 0 0 3px ${T.goldGlow}; }
        .premium-select > button { background: rgba(244,239,226,0.04) !important; border: 1px solid ${T.hairline} !important; color: ${T.ink} !important; height: auto !important; padding: 12px 14px !important; border-radius: 4px !important; font-family: ${T.body} !important; font-size: 14px !important; }
        .premium-select > button:hover { border-color: ${T.gold} !important; }
        .premium-textarea { background: rgba(244,239,226,0.04) !important; border: 1px solid ${T.hairline} !important; color: ${T.ink} !important; font-family: ${T.body} !important; border-radius: 4px !important; }
        .premium-textarea:focus-visible { outline: none !important; border-color: ${T.gold} !important; box-shadow: 0 0 0 3px ${T.goldGlow} !important; }
        .drop-zone-active { border-color: ${T.gold} !important; background: rgba(201,168,76,0.08) !important; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STICKY COMMAND BAR                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="no-print" style={{
        background: 'rgba(11,11,18,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.hairline}`,
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1px solid ${T.gold}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={15} color={T.gold} />
          </div>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 15, fontWeight: 500, color: T.ink, letterSpacing: '0.02em' }}>
              Simpleton <span style={{ fontStyle: 'italic', color: T.gold }}>Atelier</span>
            </div>
            <div style={{ fontSize: 9, color: T.inkMuted, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 1 }}>
              Professional Appraisal
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              background: 'transparent',
              border: `1px solid ${T.hairline}`,
              color: T.ink,
              borderRadius: 2,
              padding: '8px 18px',
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.color = T.ink; }}
          >
            <Edit2 size={12} /> {editing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={doPrint}
            style={{
              background: T.gold,
              border: `1px solid ${T.gold}`,
              color: '#0b0b12',
              borderRadius: 2,
              padding: '8px 20px',
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = T.goldDeep; }}
            onMouseOut={e => { e.currentTarget.style.background = T.gold; }}
          >
            <Printer size={12} /> Print Document
          </button>
        </div>
      </div>

      {editing && (
        <div className="no-print" style={{ maxWidth: 880, margin: '0 auto', padding: '56px 32px 80px' }}>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* EDITORIAL HEADER                                             */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeUp 0.8s ease-out' }}>
            <div style={{
              fontFamily: T.body, fontSize: 10, letterSpacing: '0.4em',
              color: T.gold, textTransform: 'uppercase', marginBottom: 24,
            }}>
              — Professional Valuation —
            </div>
            <h1 style={{
              fontFamily: T.display, fontSize: 64, fontWeight: 400,
              color: T.ink, lineHeight: 1, margin: 0, letterSpacing: '-0.01em',
            }}>
              A Certified Record
            </h1>
            <h1 style={{
              fontFamily: T.display, fontSize: 64, fontWeight: 400,
              fontStyle: 'italic', color: T.gold, lineHeight: 1,
              margin: '8px 0 0 0', letterSpacing: '-0.01em',
            }}>
              of Value
            </h1>
            <div style={{
              width: 80, height: 1, background: T.gold,
              margin: '32px auto', opacity: 0.6,
            }} />
            <p style={{
              fontFamily: T.display, fontSize: 17, fontStyle: 'italic',
              color: T.inkMuted, maxWidth: 560, margin: '0 auto',
              lineHeight: 1.7, fontWeight: 400,
            }}>
              Upload your photographs, share what you know, and Simplicity will compose
              a professional appraisal worthy of insurance, estate, or legal reference —
              reviewed and certified by a GIA Graduate Gemologist.
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* I. PHOTOGRAPHS                                                */}
          {/* ─────────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            {sectionLabel('I', 'Photographs', 'Up to five images — front, back, hallmarks, and any stamps')}

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={dragOver ? 'drop-zone-active' : ''}
              style={{
                border: `1px dashed ${T.hairline}`,
                borderRadius: 4,
                padding: 28,
                background: 'rgba(244,239,226,0.02)',
                transition: 'all 0.25s',
              }}
            >
              {data.itemImages.length === 0 ? (
                <div
                  onClick={() => imgRef.current?.click()}
                  style={{
                    cursor: 'pointer', textAlign: 'center', padding: '40px 20px',
                  }}
                >
                  <div style={{
                    width: 56, height: 56, margin: '0 auto 16px',
                    border: `1px solid ${T.gold}`, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Camera size={22} color={T.gold} />
                  </div>
                  <div style={{ fontFamily: T.display, fontSize: 20, color: T.ink, marginBottom: 6 }}>
                    Drag photographs here
                  </div>
                  <div style={{ fontSize: 12, color: T.inkMuted, letterSpacing: '0.04em' }}>
                    or <span style={{ color: T.gold, textDecoration: 'underline' }}>browse from device</span>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
                    {data.itemImages.map((img, i) => (
                      <div key={i} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        border: `1px solid ${T.hairline}`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        background: '#000',
                      }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                          position: 'absolute', top: 8, left: 8,
                          fontFamily: T.display, fontSize: 10, color: T.gold,
                          background: 'rgba(0,0,0,0.72)', padding: '3px 8px',
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                        }}>
                          № {i + 1}
                        </div>
                        <button
                          onClick={() => setData(p => ({ ...p, itemImages: p.itemImages.filter((_, x) => x !== i) }))}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(0,0,0,0.72)',
                            border: `1px solid ${T.hairline}`,
                            borderRadius: '50%',
                            width: 24, height: 24,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <X size={12} color={T.ink} />
                        </button>
                      </div>
                    ))}
                    {data.itemImages.length < 5 && (
                      <button
                        onClick={() => imgRef.current?.click()}
                        style={{
                          aspectRatio: '1',
                          border: `1px dashed ${T.hairline}`,
                          borderRadius: 3,
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          color: T.inkMuted,
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.color = T.inkMuted; }}
                      >
                        <Camera size={20} style={{ marginBottom: 6 }} />
                        <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Add</span>
                      </button>
                    )}
                  </div>
                </>
              )}
              <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addImages} />
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* II. SPECIFICATIONS                                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            {sectionLabel('II', 'Specifications', 'Share whatever you know — Simplicity will fill the rest')}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {fieldLabel('Item Category')}
                <div className="premium-select">
                  <Select value={data.itemCategory} onValueChange={v => set('itemCategory', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold / Precious Metal Only</SelectItem>
                      <SelectItem value="diamond">Diamond / Gemstone Jewelry</SelectItem>
                      <SelectItem value="watch">Watch / Luxury Timepiece</SelectItem>
                      <SelectItem value="coin">Coin / Bullion</SelectItem>
                      <SelectItem value="jewelry">General Jewelry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                {fieldLabel('Metal Type')}
                <div className="premium-select">
                  <Select value={data.specs.metalType || ''} onValueChange={v => setSpec('metalType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select if known" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                      <SelectItem value="White Gold">White Gold</SelectItem>
                      <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                      <SelectItem value="Sterling Silver">Sterling Silver</SelectItem>
                      <SelectItem value="Fine Silver">Fine Silver</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Palladium">Palladium</SelectItem>
                      <SelectItem value="Two-Tone">Two-Tone</SelectItem>
                      <SelectItem value="Tri-Color">Tri-Color</SelectItem>
                      <SelectItem value="Stainless Steel">Stainless Steel</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {fieldLabel('Karat / Purity')}
                <div className="premium-select">
                  <Select value={data.specs.karat || ''} onValueChange={v => setSpec('karat', v)}>
                    <SelectTrigger><SelectValue placeholder="Select if known" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8K (333)">8K (333)</SelectItem>
                      <SelectItem value="9K (375)">9K (375)</SelectItem>
                      <SelectItem value="10K (417)">10K (417)</SelectItem>
                      <SelectItem value="14K (585)">14K (585)</SelectItem>
                      <SelectItem value="18K (750)">18K (750)</SelectItem>
                      <SelectItem value="21K (875)">21K (875)</SelectItem>
                      <SelectItem value="22K (917)">22K (917)</SelectItem>
                      <SelectItem value="24K (999)">24K (999)</SelectItem>
                      <SelectItem value=".925 Sterling">.925 Sterling Silver</SelectItem>
                      <SelectItem value=".999 Fine Silver">.999 Fine Silver</SelectItem>
                      <SelectItem value="Platinum 950">Platinum (950)</SelectItem>
                      <SelectItem value="Palladium 950">Palladium (950)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                {fieldLabel('Weight (grams)')}
                <Input className="premium-input" style={darkInputStyle} placeholder="e.g. 23.5" value={data.specs.weight || ''} onChange={e => setSpec('weight', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {fieldLabel('Measurements')}
                <Input className="premium-input" style={darkInputStyle} placeholder="e.g. 20 inches, 7mm wide" value={data.specs.measurements || ''} onChange={e => setSpec('measurements', e.target.value)} />
              </div>
              <div>
                {fieldLabel('Condition')}
                <div className="premium-select">
                  <Select value={data.specs.condition || ''} onValueChange={v => setSpec('condition', v)}>
                    <SelectTrigger><SelectValue placeholder="Select if known" /></SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.value} — {c.desc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {fieldLabel('Brand / Maker')}
                <Input className="premium-input" style={darkInputStyle} placeholder="e.g. Tiffany, Cartier, custom" value={data.specs.brandMaker || ''} onChange={e => setSpec('brandMaker', e.target.value)} />
              </div>
              <div>
                {fieldLabel('Hallmarks / Stamps')}
                <Input className="premium-input" style={darkInputStyle} placeholder="e.g. 14K, 585, maker's mark" value={data.specs.hallmarks || ''} onChange={e => setSpec('hallmarks', e.target.value)} />
              </div>
            </div>

            {showStoneFields && (
              <div style={{
                marginTop: 32,
                padding: '28px 32px',
                border: `1px solid ${T.hairline}`,
                borderLeft: `2px solid ${T.gold}`,
                background: 'rgba(201,168,76,0.02)',
                borderRadius: 2,
              }}>
                <div style={{
                  fontFamily: T.display, fontSize: 14, fontStyle: 'italic',
                  color: T.gold, marginBottom: 20, letterSpacing: '0.05em',
                }}>
                  Stone &amp; Gemstone Details
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 18 }}>
                  <div>
                    {fieldLabel('Stone Type')}
                    <div className="premium-select">
                      <Select value={data.specs.stoneType || ''} onValueChange={v => setSpec('stoneType', v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Diamond">Diamond</SelectItem>
                          <SelectItem value="Ruby">Ruby</SelectItem>
                          <SelectItem value="Sapphire">Sapphire</SelectItem>
                          <SelectItem value="Emerald">Emerald</SelectItem>
                          <SelectItem value="Moissanite">Moissanite</SelectItem>
                          <SelectItem value="CZ">Cubic Zirconia</SelectItem>
                          <SelectItem value="Pearl">Pearl</SelectItem>
                          <SelectItem value="Opal">Opal</SelectItem>
                          <SelectItem value="Amethyst">Amethyst</SelectItem>
                          <SelectItem value="Topaz">Topaz</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    {fieldLabel('Stone Weight (carats)')}
                    <Input className="premium-input" style={darkInputStyle} placeholder="e.g. 1.50" value={data.specs.stoneWeight || ''} onChange={e => setSpec('stoneWeight', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 18 }}>
                  <div>
                    {fieldLabel('Stone Color')}
                    <Input className="premium-input" style={darkInputStyle} placeholder="e.g. D, E, F or colorless" value={data.specs.stoneColor || ''} onChange={e => setSpec('stoneColor', e.target.value)} />
                  </div>
                  <div>
                    {fieldLabel('Stone Clarity')}
                    <Input className="premium-input" style={darkInputStyle} placeholder="e.g. VS1, SI2, or eye-clean" value={data.specs.stoneClarity || ''} onChange={e => setSpec('stoneClarity', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    {fieldLabel('Stone Cut')}
                    <Input className="premium-input" style={darkInputStyle} placeholder="e.g. Excellent, Very Good" value={data.specs.stoneCut || ''} onChange={e => setSpec('stoneCut', e.target.value)} />
                  </div>
                  <div>
                    {fieldLabel('Stone Shape')}
                    <div className="premium-select">
                      <Select value={data.specs.stoneShape || ''} onValueChange={v => setSpec('stoneShape', v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Round">Round</SelectItem>
                          <SelectItem value="Princess">Princess</SelectItem>
                          <SelectItem value="Oval">Oval</SelectItem>
                          <SelectItem value="Cushion">Cushion</SelectItem>
                          <SelectItem value="Emerald Cut">Emerald Cut</SelectItem>
                          <SelectItem value="Pear">Pear</SelectItem>
                          <SelectItem value="Marquise">Marquise</SelectItem>
                          <SelectItem value="Asscher">Asscher</SelectItem>
                          <SelectItem value="Radiant">Radiant</SelectItem>
                          <SelectItem value="Heart">Heart</SelectItem>
                          <SelectItem value="Baguette">Baguette</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {isDiamondItem && (
                  <div style={{
                    marginTop: 22,
                    padding: '14px 18px',
                    background: 'rgba(217,109,94,0.06)',
                    border: `1px solid rgba(217,109,94,0.25)`,
                    borderLeft: `2px solid ${T.danger}`,
                    borderRadius: 2,
                    fontSize: 12,
                    color: '#e8c7c1',
                    fontStyle: 'italic',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <AlertTriangle size={14} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ fontStyle: 'normal', color: T.danger, fontWeight: 600 }}>Diamond notice.</strong>{' '}
                      Diamonds and colored gemstones require in-person examination with gemological equipment for accurate 4C grading unless you already hold a GIA, IGI, or AGS laboratory certificate.
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* III. COMPOSE                                                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            {sectionLabel('III', 'Compose', 'Simplicity will write a professional appraisal from your photographs')}

            <button
              onClick={handleGenerateDescription}
              disabled={generating || data.itemImages.length === 0}
              style={{
                width: '100%',
                padding: '22px 28px',
                borderRadius: 3,
                border: `1px solid ${data.itemImages.length === 0 ? T.hairline : T.gold}`,
                background: generating
                  ? 'rgba(201,168,76,0.18)'
                  : data.itemImages.length === 0
                    ? 'transparent'
                    : `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDeep} 100%)`,
                color: data.itemImages.length === 0 ? T.inkMuted : '#0b0b12',
                cursor: generating || data.itemImages.length === 0 ? 'default' : 'pointer',
                fontFamily: T.display,
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                transition: 'all 0.25s',
                boxShadow: data.itemImages.length > 0 && !generating ? `0 4px 24px ${T.goldGlow}` : 'none',
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontStyle: 'italic' }}>Simplicity is composing your appraisal…</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {data.itemImages.length === 0 ? 'Add a photograph to begin' : 'Compose Professional Description'}
                </>
              )}
            </button>

            {/* Description editor */}
            <div style={{ marginTop: 32 }} ref={descRef}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                {fieldLabel('Professional Description')}
                {descriptionGenerated && (
                  <span style={{ fontSize: 10, color: T.success, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    ✓ Composed by Simplicity
                  </span>
                )}
              </div>
              <Textarea
                className="premium-textarea"
                style={{
                  minHeight: 200,
                  fontSize: 14,
                  fontFamily: T.serif,
                  lineHeight: 1.75,
                  padding: '18px 20px',
                }}
                placeholder="Simplicity will compose this from your photographs. You may also write or edit manually."
                value={data.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div style={{ marginTop: 20, maxWidth: 360 }}>
              {fieldLabel('Appraised Retail Value')}
              <Input className="premium-input" style={darkInputStyle} placeholder="Auto-estimated, or enter manually" value={data.retailValue} onChange={e => set('retailValue', e.target.value)} />
            </div>

            {report && (
              <div style={{
                marginTop: 32,
                border: `1px solid ${T.hairline}`,
                borderRadius: 3,
                background: 'rgba(244,239,226,0.025)',
                overflow: 'hidden',
              }}>
                <button
                  type="button"
                  onClick={() => setReportOpen(o => !o)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 24px',
                    background: 'transparent',
                    color: T.gold,
                    border: 'none',
                    borderBottom: reportOpen ? `1px solid ${T.hairline}` : 'none',
                    cursor: 'pointer',
                    fontFamily: T.display,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontStyle: 'italic', color: T.inkMuted, fontSize: 11 }}>Full Report</span>
                    <span>— Structured Appraisal</span>
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 400 }}>{reportOpen ? '−' : '+'}</span>
                </button>
                {reportOpen && (
                  <div style={{ padding: '24px 28px' }}>
                    {report.conditionGrade && (
                      <div style={{ marginBottom: 22, display: 'flex', gap: 16, alignItems: 'baseline' }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', minWidth: 90 }}>Condition</div>
                        <div>
                          <span style={{ fontFamily: T.display, fontSize: 18, color: T.gold }}>{report.conditionGrade}</span>
                          {report.conditionNotes && <div style={{ fontSize: 12, color: T.inkMuted, fontStyle: 'italic', marginTop: 4, lineHeight: 1.6 }}>{report.conditionNotes}</div>}
                        </div>
                      </div>
                    )}

                    {(report.meltValue || report.fairMarketLow || report.retailReplacement || report.estateValue || report.liquidationValue) && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>Valuation Tiers</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                          {typeof report.retailReplacement === 'number' && report.retailReplacement > 0 && (
                            <div style={{ padding: '14px 16px', background: 'rgba(201,168,76,0.08)', border: `1px solid ${T.gold}`, borderRadius: 2 }}>
                              <div style={{ fontSize: 9, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Retail Replacement</div>
                              <div style={{ fontFamily: T.display, fontSize: 20, color: T.ink }}>${Number(report.retailReplacement).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                          )}
                          {typeof report.fairMarketLow === 'number' && report.fairMarketLow > 0 && (
                            <div style={{ padding: '14px 16px', background: 'rgba(244,239,226,0.03)', border: `1px solid ${T.hairline}`, borderRadius: 2 }}>
                              <div style={{ fontSize: 9, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Fair Market</div>
                              <div style={{ fontFamily: T.display, fontSize: 17, color: T.ink }}>${Number(report.fairMarketLow).toLocaleString(undefined, { maximumFractionDigits: 0 })} – ${Number(report.fairMarketHigh || report.fairMarketLow).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                          )}
                          {typeof report.estateValue === 'number' && report.estateValue > 0 && (
                            <div style={{ padding: '14px 16px', background: 'rgba(244,239,226,0.03)', border: `1px solid ${T.hairline}`, borderRadius: 2 }}>
                              <div style={{ fontSize: 9, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Estate</div>
                              <div style={{ fontFamily: T.display, fontSize: 17, color: T.ink }}>${Number(report.estateValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                          )}
                          {typeof report.liquidationValue === 'number' && report.liquidationValue > 0 && (
                            <div style={{ padding: '14px 16px', background: 'rgba(244,239,226,0.03)', border: `1px solid ${T.hairline}`, borderRadius: 2 }}>
                              <div style={{ fontSize: 9, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Liquidation</div>
                              <div style={{ fontFamily: T.display, fontSize: 17, color: T.ink }}>${Number(report.liquidationValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                          )}
                          {typeof report.meltValue === 'number' && report.meltValue > 0 && (
                            <div style={{ padding: '14px 16px', background: 'rgba(244,239,226,0.03)', border: `1px solid ${T.hairline}`, borderRadius: 2 }}>
                              <div style={{ fontSize: 9, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Melt / Intrinsic</div>
                              <div style={{ fontFamily: T.display, fontSize: 17, color: T.ink }}>${Number(report.meltValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {report.valuationMath && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>Valuation Methodology</div>
                        <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.75, fontFamily: T.serif, fontStyle: 'italic' }}>{report.valuationMath}</div>
                      </div>
                    )}

                    {report.materialAnalysis && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>Material Analysis</div>
                        <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.75, fontFamily: T.serif }}>{report.materialAnalysis}</div>
                      </div>
                    )}

                    {Array.isArray(report.keyFactors) && report.keyFactors.length > 0 && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>Key Factors Affecting Value</div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: T.ink, lineHeight: 1.8, fontFamily: T.serif }}>
                          {report.keyFactors.map((f: string, i: number) => <li key={i} style={{ marginBottom: 4 }}>{f}</li>)}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(report.recommendations) && report.recommendations.length > 0 && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>Recommendations</div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: T.ink, lineHeight: 1.8, fontFamily: T.serif }}>
                          {report.recommendations.map((r: string, i: number) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.certificationAdvice && (
                      <div style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>Certification Advice</div>
                        <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.75, fontFamily: T.serif, fontStyle: 'italic' }}>{report.certificationAdvice}</div>
                      </div>
                    )}

                    {Array.isArray(report.sources) && report.sources.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>Data Sources</div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: T.inkMuted, lineHeight: 1.7 }}>
                          {report.sources.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* IV. TEMPLATE                                                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            {sectionLabel('IV', 'Document Style', 'Five distinct presentation formats, each a world of its own')}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
              {templateOptions.map(t => {
                const selected = data.templateStyle === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('templateStyle', t.id)}
                    style={{
                      padding: '22px 16px',
                      borderRadius: 3,
                      border: selected ? `1px solid ${T.gold}` : `1px solid ${T.hairline}`,
                      background: selected ? 'rgba(201,168,76,0.08)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.25s',
                      position: 'relative',
                    }}
                    onMouseOver={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
                    onMouseOut={e => { if (!selected) e.currentTarget.style.borderColor = T.hairline; }}
                  >
                    {selected && (
                      <div style={{
                        position: 'absolute', top: 8, right: 10,
                        fontSize: 9, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase',
                      }}>
                        ✓
                      </div>
                    )}
                    <div style={{
                      width: 36, height: 1, background: selected ? T.gold : T.hairline,
                      margin: '0 auto 14px',
                    }} />
                    <div style={{
                      fontFamily: T.display, fontSize: 18, fontWeight: 400,
                      color: selected ? T.gold : T.ink, marginBottom: 6,
                      letterSpacing: '0.02em',
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      fontSize: 10, color: T.inkMuted,
                      lineHeight: 1.5, fontStyle: 'italic', fontFamily: T.serif,
                    }}>
                      {t.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* V. CLIENT DETAILS                                            */}
          {/* ─────────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: 48 }}>
            {sectionLabel('V', 'Client Details', 'For the record of appraisal')}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {fieldLabel('Appraisal Number')}
                <Input className="premium-input" style={darkInputStyle} value={data.appraisalNumber} onChange={e => set('appraisalNumber', e.target.value)} />
              </div>
              <div>
                {fieldLabel('Date')}
                <Input className="premium-input" style={darkInputStyle} type="date" value={data.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {fieldLabel('Full Name')}
                <Input className="premium-input" style={darkInputStyle} placeholder="Jane Smith" value={data.propertyOwner} onChange={e => set('propertyOwner', e.target.value)} />
              </div>
              <div>
                {fieldLabel('Email Address')}
                <Input className="premium-input" style={darkInputStyle} type="email" placeholder="you@email.com" value={data.customerEmail} onChange={e => set('customerEmail', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                {fieldLabel('Address (optional)')}
                <Input className="premium-input" style={darkInputStyle} placeholder="123 Main St" value={data.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div>
                {fieldLabel('City, State, ZIP')}
                <Input className="premium-input" style={darkInputStyle} placeholder="New York, NY 10001" value={data.cityStateZip} onChange={e => set('cityStateZip', e.target.value)} />
              </div>
            </div>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 22px',
              border: `1px solid ${T.hairline}`,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <input
                type="checkbox"
                checked={data.zoomRequested}
                onChange={e => set('zoomRequested', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: T.gold }}
              />
              <div>
                <div style={{ fontFamily: T.display, fontSize: 14, color: T.ink, fontStyle: 'italic' }}>
                  Request a Zoom consultation
                </div>
                <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 3 }}>
                  Schedule a live video call with our GIA certified appraiser for detailed evaluation.
                </div>
              </div>
            </label>
          </section>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SUBMIT                                                       */}
          {/* ─────────────────────────────────────────────────────────── */}
          {!submitted ? (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting || !data.description.trim()}
              style={{
                width: '100%',
                padding: '24px 28px',
                borderRadius: 2,
                border: `1px solid ${!data.description.trim() ? T.hairline : T.gold}`,
                background: submitting || !data.description.trim() ? 'transparent' : T.ink,
                color: submitting || !data.description.trim() ? T.inkMuted : '#0b0b12',
                cursor: submitting || !data.description.trim() ? 'default' : 'pointer',
                fontFamily: T.display,
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                transition: 'all 0.25s',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontStyle: 'italic' }}>Submitting…</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit for Certification
                </>
              )}
            </button>
          ) : (
            <div style={{
              padding: '40px 36px', textAlign: 'center',
              border: `1px solid ${T.gold}`,
              background: 'rgba(201,168,76,0.04)',
              borderRadius: 2,
            }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto 20px',
                border: `1px solid ${T.gold}`, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={22} color={T.gold} />
              </div>
              <div style={{ fontFamily: T.display, fontSize: 24, color: T.gold, marginBottom: 10 }}>
                Submitted for Review
              </div>
              <div style={{ fontSize: 13, color: T.inkMuted, maxWidth: 420, margin: '0 auto', lineHeight: 1.7, fontStyle: 'italic', fontFamily: T.serif }}>
                Demiris Brown, GIA Graduate Gemologist, will personally review your submission and return a certified document within 24–48 hours.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DOCUMENT PREVIEW                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="appraisal-doc" style={{
        width: '8.5in', minHeight: '11in',
        margin: editing ? '40px auto 80px' : '20px auto 40px',
        background: '#ffffff',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.3)',
        padding: '0.65in 0.75in',
        position: 'relative', overflow: 'hidden',
        fontFamily: '"Times New Roman", Georgia, "Times", serif',
        color: '#1a1a1a', boxSizing: 'border-box',
      }}>
        <AppraisalTemplate
          templateStyle={data.templateStyle}
          appraisalNumber={data.appraisalNumber}
          customerName={data.propertyOwner}
          customerAddress={data.address}
          customerCityStateZip={data.cityStateZip}
          date={data.date}
          itemCategory={data.itemCategory}
          description={data.description}
          retailValue={data.retailValue}
          images={data.itemImages}
          itemSpecs={data.specs}
          report={report}
          shareToken={null}
        />
      </div>
    </div>
  );
}
