import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Edit2, X, Plus, FileText, Send, CheckCircle, Video, AlertTriangle, Sparkles, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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

const TEMPLATE_OPTIONS = [
  { id: 'classic', name: 'Classic', desc: 'Traditional layout with watermark and serif typography' },
  { id: 'elegant', name: 'Elegant', desc: 'Gold accents with structured gemstone detail fields' },
  { id: 'modern', name: 'Modern', desc: 'Clean minimal design with prominent photo display' },
  { id: 'professional', name: 'Professional', desc: 'Formal insurance-style with detailed paragraph format' },
  { id: 'detailed', name: 'Detailed', desc: 'Tabular format with inline item images and specifications' },
];

const CONDITION_OPTIONS = [
  { value: 'Excellent', desc: 'Like new, no visible wear' },
  { value: 'Very Good', desc: 'Minor wear, well maintained' },
  { value: 'Good', desc: 'Normal wear consistent with age' },
  { value: 'Fair', desc: 'Noticeable wear or minor damage' },
  { value: 'Poor', desc: 'Significant wear or damage' },
];

export default function JewelryAppraisal() {
  const [editing, setEditing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [descriptionGenerated, setDescriptionGenerated] = useState(false);
  const { toast } = useToast();
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
    templateStyle: 'classic',
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

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => {
      const r = new FileReader();
      r.onload = ev =>
        setData(p => ({ ...p, itemImages: [...p.itemImages, ev.target?.result as string].slice(0, 5) }));
      r.readAsDataURL(f);
    });
  };

  const doPrint = () => {
    setEditing(false);
    setTimeout(() => window.print(), 200);
  };

  const handleGenerateDescription = async () => {
    if (data.itemImages.length === 0) {
      toast({ title: "Photos required", description: "Please add at least one photo of the item so Simplicity can analyze it.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const res = await apiRequest('POST', '/api/appraisal/generate-description', {
        images: data.itemImages,
        itemCategory: data.itemCategory,
        specs: data.specs,
      });
      const result = await res.json();

      if (result.description) {
        set('description', result.description);
        setDescriptionGenerated(true);
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
        toast({ title: "Description generated", description: "Simplicity analyzed your photos and created a professional description. Review the specs and description below." });
        setTimeout(() => descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message || "Could not generate description. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!data.propertyOwner.trim()) {
      toast({ title: "Name required", description: "Please enter your name to submit the appraisal.", variant: "destructive" });
      return;
    }
    if (!data.customerEmail.trim() || !data.customerEmail.includes('@')) {
      toast({ title: "Valid email required", description: "Please enter a valid email address so we can contact you.", variant: "destructive" });
      return;
    }
    if (!data.description.trim()) {
      toast({ title: "Description required", description: "Please add photos and generate a description first, or write one manually.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/appraisal/submit", {
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
      });
      const result = await res.json();
      setSubmitted(true);
      toast({
        title: "Appraisal Submitted",
        description: result.message || "Your appraisal has been submitted for review.",
      });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDiamondItem = data.itemCategory === 'diamond';
  const isWatch = data.itemCategory === 'watch';
  const showStoneFields = isDiamondItem || data.itemCategory === 'jewelry';

  return (
    <div style={{ background: '#e8e8e8', minHeight: '100vh' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IM+Fell+English:ital@0;1&display=swap');
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
      `}</style>

      <div className="no-print" style={{
        background: '#1a1a2e', color: '#fff', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={18} color="#c9a84c" />
          <span style={{ fontWeight: 600, fontSize: 15 }}><span className="simpleton-brand">Simpleton</span> Professional Appraisal</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              background: 'transparent', border: '1px solid #888', color: '#ddd',
              borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Edit2 size={14} /> {editing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={doPrint}
            style={{
              background: '#c9a84c', border: 'none', color: '#000',
              borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Printer size={14} /> Print Appraisal
          </button>
        </div>
      </div>

      {editing && (
        <div className="no-print" style={{ maxWidth: 780, margin: '24px auto', background: '#fff', borderRadius: 10, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2E5090 100%)',
            borderRadius: 10,
            padding: '24px 28px',
            marginBottom: 24,
            color: '#fff',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              3 Simple Steps
            </h2>
            <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
              Upload photos of your item, enter the specs you know, and Simplicity will generate a complete professional description and auto-fill any missing details.
            </div>
          </div>

          {/* STEP 1: PHOTOS */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2E5090', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>1</div>
              <Label style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Upload Photos of Your Item</Label>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
              {data.itemImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 110, height: 110, borderRadius: 8, overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setData(p => ({ ...p, itemImages: p.itemImages.filter((_, x) => x !== i) }))}
                    style={{ position: 'absolute', top: 4, right: 4, background: '#e53e3e', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={12} color="#fff" />
                  </button>
                </div>
              ))}
              {data.itemImages.length < 5 && (
                <button
                  onClick={() => imgRef.current?.click()}
                  style={{
                    width: 110, height: 110, border: '2px dashed #cbd5e1', borderRadius: 8,
                    background: '#f8fafc', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 12,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#2E5090'; e.currentTarget.style.color = '#2E5090'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <Camera size={24} style={{ marginBottom: 4 }} />
                  <span>Add Photo</span>
                </button>
              )}
              <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addImages} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Up to 5 photos. Include front, back, hallmarks, and any stamps or markings.
            </div>
          </div>

          {/* STEP 2: STRUCTURED SPECS */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2E5090', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>2</div>
              <Label style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Enter What You Know</Label>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(fill in whatever you have — Simplicity will try to fill the rest)</span>
            </div>

            {/* Category + Metal Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Item Category</Label>
                <Select value={data.itemCategory} onValueChange={v => set('itemCategory', v)}>
                  <SelectTrigger style={{ marginTop: 4 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold / Precious Metal Only</SelectItem>
                    <SelectItem value="diamond">Diamond / Gemstone Jewelry</SelectItem>
                    <SelectItem value="watch">Watch / Luxury Timepiece</SelectItem>
                    <SelectItem value="coin">Coin / Bullion</SelectItem>
                    <SelectItem value="jewelry">General Jewelry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Metal Type</Label>
                <Select value={data.specs.metalType || ''} onValueChange={v => setSpec('metalType', v)}>
                  <SelectTrigger style={{ marginTop: 4 }}>
                    <SelectValue placeholder="Select if known" />
                  </SelectTrigger>
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

            {/* Karat + Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Karat / Purity</Label>
                <Select value={data.specs.karat || ''} onValueChange={v => setSpec('karat', v)}>
                  <SelectTrigger style={{ marginTop: 4 }}>
                    <SelectValue placeholder="Select if known" />
                  </SelectTrigger>
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
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Weight (grams)</Label>
                <Input
                  style={{ marginTop: 4 }}
                  type="text"
                  placeholder="e.g. 23.5"
                  value={data.specs.weight || ''}
                  onChange={e => setSpec('weight', e.target.value)}
                />
              </div>
            </div>

            {/* Measurements + Condition */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Measurements</Label>
                <Input
                  style={{ marginTop: 4 }}
                  type="text"
                  placeholder="e.g. 20 inches, 7mm wide"
                  value={data.specs.measurements || ''}
                  onChange={e => setSpec('measurements', e.target.value)}
                />
              </div>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Condition</Label>
                <Select value={data.specs.condition || ''} onValueChange={v => setSpec('condition', v)}>
                  <SelectTrigger style={{ marginTop: 4 }}>
                    <SelectValue placeholder="Select if known" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.value} — {c.desc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Brand/Maker + Hallmarks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Brand / Maker</Label>
                <Input
                  style={{ marginTop: 4 }}
                  type="text"
                  placeholder="e.g. Tiffany, Cartier, custom"
                  value={data.specs.brandMaker || ''}
                  onChange={e => setSpec('brandMaker', e.target.value)}
                />
              </div>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Hallmarks / Stamps</Label>
                <Input
                  style={{ marginTop: 4 }}
                  type="text"
                  placeholder="e.g. 14K, 585, maker's mark"
                  value={data.specs.hallmarks || ''}
                  onChange={e => setSpec('hallmarks', e.target.value)}
                />
              </div>
            </div>

            {/* Stone Details - shown for diamond/jewelry */}
            {showStoneFields && (
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: 16, marginTop: 8,
              }}>
                <Label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, display: 'block' }}>Stone / Gemstone Details</Label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Stone Type</Label>
                    <Select value={data.specs.stoneType || ''} onValueChange={v => setSpec('stoneType', v)}>
                      <SelectTrigger style={{ marginTop: 4 }}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
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
                  <div>
                    <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Stone Weight (carats)</Label>
                    <Input
                      style={{ marginTop: 4 }}
                      type="text"
                      placeholder="e.g. 1.50"
                      value={data.specs.stoneWeight || ''}
                      onChange={e => setSpec('stoneWeight', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Stone Color</Label>
                    <Input
                      style={{ marginTop: 4 }}
                      type="text"
                      placeholder="e.g. D, E, F or colorless"
                      value={data.specs.stoneColor || ''}
                      onChange={e => setSpec('stoneColor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Stone Clarity</Label>
                    <Input
                      style={{ marginTop: 4 }}
                      type="text"
                      placeholder="e.g. VS1, SI2, or eye-clean"
                      value={data.specs.stoneClarity || ''}
                      onChange={e => setSpec('stoneClarity', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Stone Cut</Label>
                    <Input
                      style={{ marginTop: 4 }}
                      type="text"
                      placeholder="e.g. Excellent, Very Good"
                      value={data.specs.stoneCut || ''}
                      onChange={e => setSpec('stoneCut', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Stone Shape</Label>
                    <Select value={data.specs.stoneShape || ''} onValueChange={v => setSpec('stoneShape', v)}>
                      <SelectTrigger style={{ marginTop: 4 }}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
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

                {isDiamondItem && (
                  <div style={{
                    background: '#fff8e1', border: '1px solid #f0c14b', borderLeft: '4px solid #f0c14b',
                    padding: '10px 14px', borderRadius: 4, marginTop: 12, fontSize: 13, color: '#5c4813'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <AlertTriangle size={14} color="#b8860b" />
                      <strong>Diamond Notice</strong>
                    </div>
                    Diamonds and colored gemstones require in-person evaluation for accurate 4C grading unless you have a GIA, IGI, or AGS certification. If you have a certificate, Simplicity will note it in the description.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: GENERATE */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2E5090', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>3</div>
              <Label style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Generate Professional Description</Label>
            </div>

            <button
              onClick={handleGenerateDescription}
              disabled={generating || data.itemImages.length === 0}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 8,
                border: 'none',
                background: generating ? '#94a3b8' : data.itemImages.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #c9a84c 0%, #dab55d 100%)',
                color: data.itemImages.length === 0 ? '#94a3b8' : '#000',
                cursor: generating || data.itemImages.length === 0 ? 'default' : 'pointer',
                fontSize: 15,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: data.itemImages.length > 0 && !generating ? '0 2px 8px rgba(201,168,76,0.3)' : 'none',
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Simplicity is analyzing your photos...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {data.itemImages.length === 0 ? 'Add Photos First' : 'Generate Description from Photos'}
                </>
              )}
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {data.itemImages.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                Upload at least one photo above, then click to generate
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }} ref={descRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Professional Description</Label>
              {descriptionGenerated && (
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>AI Generated — you can edit below</span>
              )}
            </div>
            <Textarea
              style={{
                marginTop: 4, minHeight: 160, fontSize: 13,
                borderColor: descriptionGenerated ? '#86efac' : undefined,
                transition: 'border-color 0.3s',
              }}
              placeholder="Simplicity will generate this from your photos. You can also write or edit manually."
              value={data.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Appraised Retail Value</Label>
            <Input style={{ marginTop: 4 }} placeholder="Auto-estimated or enter manually" value={data.retailValue} onChange={e => set('retailValue', e.target.value)} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Label style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, display: 'block' }}>Choose Your Appraisal Template</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {TEMPLATE_OPTIONS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set('templateStyle', t.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 8,
                    border: data.templateStyle === t.id ? '2px solid #2E5090' : '2px solid #e2e8f0',
                    background: data.templateStyle === t.id ? '#eef2ff' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: data.templateStyle === t.id ? '#2E5090' : '#1a1a1a',
                    marginBottom: 4,
                  }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: 20,
            marginBottom: 20,
          }}>
            <Label style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, display: 'block' }}>Your Information</Label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Appraisal No.</Label>
                <Input style={{ marginTop: 4 }} value={data.appraisalNumber} onChange={e => set('appraisalNumber', e.target.value)} />
              </div>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Date</Label>
                <Input style={{ marginTop: 4 }} type="date" value={data.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Your Full Name</Label>
                <Input style={{ marginTop: 4 }} placeholder="Jane Smith" value={data.propertyOwner} onChange={e => set('propertyOwner', e.target.value)} />
              </div>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Email Address</Label>
                <Input style={{ marginTop: 4 }} type="email" placeholder="you@email.com" value={data.customerEmail} onChange={e => set('customerEmail', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Address (optional)</Label>
                <Input style={{ marginTop: 4 }} placeholder="123 Main St" value={data.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div>
                <Label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>City, State, Zip</Label>
                <Input style={{ marginTop: 4 }} placeholder="New York, NY 10001" value={data.cityStateZip} onChange={e => set('cityStateZip', e.target.value)} />
              </div>
            </div>

            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 8,
            }}>
              <input type="checkbox" id="zoom" checked={data.zoomRequested} onChange={e => set('zoomRequested', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2E5090' }} />
              <label htmlFor="zoom" style={{ fontSize: 13, color: '#1a1a1a', cursor: 'pointer' }}>
                <strong>Request Zoom Consultation</strong>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Schedule a live video call with our appraiser for detailed evaluation</div>
              </label>
            </div>
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting || !data.description.trim()}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 8,
                border: 'none',
                background: submitting || !data.description.trim() ? '#94a3b8' : '#2E5090',
                color: '#fff',
                cursor: submitting || !data.description.trim() ? 'default' : 'pointer',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit for Professional Review
                </>
              )}
            </button>
          ) : (
            <div style={{
              background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 10,
              padding: '20px 24px', textAlign: 'center',
            }}>
              <CheckCircle size={28} color="#22c55e" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                Appraisal Submitted Successfully
              </div>
              <div style={{ fontSize: 13, color: '#15803d' }}>
                Demiris Brown, GIA Certified Jewelry Appraiser, will review your submission and contact you within 24-48 hours.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="appraisal-doc" style={{
        width: '8.5in', minHeight: '11in',
        margin: '20px auto 40px',
        background: '#ffffff',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
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
        />
      </div>
    </div>
  );
}
