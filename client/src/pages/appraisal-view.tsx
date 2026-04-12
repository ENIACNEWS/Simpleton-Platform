import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Shield, CheckCircle, Clock, ExternalLink, Printer, Share2, Edit3, Save, X, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AppraisalTemplate } from '@/components/appraisal-templates';
import type { ItemSpecs } from '@/components/appraisal-templates';

interface AppraisalData {
  appraisalNumber: string;
  status: 'pending' | 'certified' | 'rejected';
  itemCategory: string;
  itemDescription: string;
  retailValue: string | null;
  itemImages: string[];
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  customerCityStateZip: string | null;
  appraisalDate: string | null;
  certifiedBy: string | null;
  certificationNotes: string | null;
  certifiedAt: string | null;
  templateStyle: string;
  itemSpecs: ItemSpecs | null;
  appraisalReport?: any | null;
  shareToken?: string | null;
  createdAt: string;
}

export default function AppraisalView() {
  const [, params] = useRoute('/appraisal/:token');
  const token = params?.token;
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user && (user.id === 1 || (user as any).role === 'admin');

  const [appraisal, setAppraisal] = useState<AppraisalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [certifying, setCertifying] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/appraisal/view/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setAppraisal(d);
          setEditDesc(d.itemDescription || '');
          setEditValue(d.retailValue || '');
          setEditNotes(d.certificationNotes || '');
        }
      })
      .catch(() => setError('Failed to load appraisal'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdits = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiRequest('PATCH', `/api/appraisal/update/${token}`, {
        itemDescription: editDesc,
        retailValue: editValue,
        certificationNotes: editNotes,
      });
      setAppraisal(prev => prev ? {
        ...prev,
        itemDescription: editDesc,
        retailValue: editValue,
        certificationNotes: editNotes,
      } : null);
      setEditing(false);
      toast({ title: "Saved", description: "Appraisal updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCertify = async () => {
    if (!token) return;
    setCertifying(true);
    try {
      const res = await apiRequest('POST', `/api/appraisal/certify-by-token/${token}`, {
        certificationNotes: editNotes,
        retailValue: editValue || appraisal?.retailValue,
      });
      const result = await res.json();
      setAppraisal(prev => prev ? {
        ...prev,
        status: 'certified',
        certifiedBy: 'Demiris Brown, GIA Graduate Gemologist',
        certifiedAt: new Date().toISOString(),
        certificationNotes: editNotes,
        retailValue: editValue || prev.retailValue,
      } : null);
      setEditing(false);
      toast({ title: "Certified", description: result.message || "Appraisal certified and customer notified." });
    } catch {
      toast({ title: "Error", description: "Failed to certify.", variant: "destructive" });
    } finally {
      setCertifying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #c9a84c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          Loading appraisal...
        </div>
      </div>
    );
  }

  if (error || !appraisal) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: 40, borderRadius: 12, maxWidth: 400 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Appraisal Not Found</div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
            This appraisal link may be invalid or expired. Contact demiris@simpletonapp.com for assistance.
          </div>
          <a href="/jewelry-appraisal" style={{ background: '#c9a84c', color: '#000', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Request an Appraisal
          </a>
        </div>
      </div>
    );
  }

  const isCertified = appraisal.status === 'certified';

  return (
    <div style={{ background: '#e8e8e8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IM+Fell+English:ital@0;1&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body, html { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .appraisal-doc { box-shadow: none !important; width: 8.5in !important; max-width: 8.5in !important; margin: 0 !important; padding: 0 !important; height: 11in !important; max-height: 11in !important; overflow: hidden !important; }
          @page { size: letter portrait; margin: 0; }
        }
      `}</style>

      <div className="no-print" style={{
        background: '#1a1a2e', color: '#fff', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/favicon.svg" alt="" style={{ height: 24 }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Simpleton™ Professional Appraisal</span>
          {isCertified ? (
            <span style={{ background: '#166534', color: '#4ade80', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>
              CERTIFIED
            </span>
          ) : (
            <span style={{ background: '#713f12', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>
              PENDING REVIEW
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} style={{
              background: '#2E5090', border: 'none', color: '#fff',
              borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Edit3 size={14} />
              Edit / Certify
            </button>
          )}
          <button onClick={handleShare} style={{
            background: 'transparent', border: '1px solid #888', color: '#ddd',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Share2 size={14} />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={() => window.print()} style={{
            background: '#c9a84c', border: 'none', color: '#000',
            borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13,
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {!isCertified && (
        <div className="no-print" style={{
          background: '#451a03', borderBottom: '1px solid #92400e',
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#fbbf24', fontSize: 13
        }}>
          <Clock size={16} />
          This appraisal is pending review by Demiris Brown, GIA Certified Jewelry Appraiser. It will become a certified document upon his personal review and email confirmation.
        </div>
      )}

      {isCertified && (
        <div className="no-print" style={{
          background: '#14532d', borderBottom: '1px solid #166534',
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#4ade80', fontSize: 13
        }}>
          <CheckCircle size={16} />
          This appraisal has been personally reviewed and certified by Demiris Brown, GIA Certified Jewelry Appraiser. Certified on {appraisal.certifiedAt ? new Date(appraisal.certifiedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}.
        </div>
      )}

      {isAdmin && editing && (
        <div className="no-print" style={{
          maxWidth: 780, margin: '20px auto 0',
          background: '#1e293b', borderRadius: 12, padding: 24,
          border: '2px solid #2E5090',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff' }}>
              Admin: Edit Appraisal #{appraisal.appraisalNumber}
            </div>
            <button onClick={() => setEditing(false)} style={{
              background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4
            }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Item Description
            </label>
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={10}
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                color: '#e2e8f0', padding: 12, fontSize: 13, lineHeight: 1.7, resize: 'vertical',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                Retail Value
              </label>
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder="e.g. $2,500.00"
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                  color: '#e2e8f0', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Certification Notes (optional, visible on certified document)
            </label>
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={3}
              placeholder="Any notes about this appraisal..."
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                color: '#e2e8f0', padding: 12, fontSize: 13, lineHeight: 1.5, resize: 'vertical',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveEdits}
              disabled={saving}
              style={{
                background: '#334155', border: 'none', color: '#e2e8f0',
                borderRadius: 8, padding: '10px 20px', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {!isCertified && (
              <button
                onClick={handleCertify}
                disabled={certifying}
                style={{
                  background: '#166534', border: 'none', color: '#4ade80',
                  borderRadius: 8, padding: '10px 24px', cursor: certifying ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  opacity: certifying ? 0.6 : 1,
                }}
              >
                <Award size={15} />
                {certifying ? 'Certifying...' : 'Certify Appraisal'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="no-print" style={{
        maxWidth: 780, margin: '20px auto 0',
        display: 'flex', alignItems: 'center', gap: 12,
        background: isCertified ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${isCertified ? '#86efac' : '#fcd34d'}`,
        borderRadius: 8, padding: '12px 16px'
      }}>
        <Shield size={24} color={isCertified ? '#16a34a' : '#d97706'} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isCertified ? '#166534' : '#92400e' }}>
            {isCertified ? 'Certified Appraisal — Legally Recognized Document' : 'Preliminary Appraisal — Pending Certification'}
          </div>
          <div style={{ fontSize: 12, color: isCertified ? '#15803d' : '#a16207', marginTop: 2 }}>
            Appraisal #{appraisal.appraisalNumber} · simpletonapp.com ·{' '}
            <a href="mailto:demiris@simpletonapp.com" style={{ color: 'inherit' }}>demiris@simpletonapp.com</a>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <a href="/jewelry-appraisal" style={{
            background: '#c9a84c', color: '#000', padding: '7px 14px',
            borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <ExternalLink size={12} />
            Get Your Own Appraisal
          </a>
        </div>
      </div>

      <div className="appraisal-doc" style={{
        width: '8.5in', height: '11in',
        margin: '20px auto 40px',
        background: '#ffffff',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        position: 'relative', overflow: 'hidden',
        boxSizing: 'border-box',
      }}>
        <AppraisalTemplate
          templateStyle={appraisal.templateStyle || 'classic'}
          appraisalNumber={appraisal.appraisalNumber}
          customerName={appraisal.customerName}
          customerPhone={appraisal.customerPhone}
          customerAddress={appraisal.customerAddress}
          customerCityStateZip={appraisal.customerCityStateZip}
          date={appraisal.appraisalDate || appraisal.createdAt}
          itemCategory={appraisal.itemCategory}
          description={appraisal.itemDescription}
          retailValue={appraisal.retailValue || ''}
          images={appraisal.itemImages || []}
          isCertified={isCertified}
          certifiedBy={appraisal.certifiedBy}
          certifiedAt={appraisal.certifiedAt}
          itemSpecs={appraisal.itemSpecs}
          report={appraisal.appraisalReport || null}
          shareToken={appraisal.shareToken || token}
        />
      </div>

      <div className="no-print" style={{
        maxWidth: 780, margin: '0 auto 40px', padding: '0 20px',
      }}>
        <div style={{
          background: '#1a1a2e', borderRadius: 12, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff', marginBottom: 6 }}>
              Need an appraisal for your jewelry, diamonds, or coins?
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              Professional appraisals by Demiris Brown, GIA Graduate Gemologist. Certified documents for insurance, estate, or resale. Starting at $15.
            </div>
          </div>
          <a href="/jewelry-appraisal" style={{
            background: '#c9a84c', color: '#000', padding: '12px 24px',
            borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Get Appraised →
          </a>
        </div>
      </div>
    </div>
  );
}