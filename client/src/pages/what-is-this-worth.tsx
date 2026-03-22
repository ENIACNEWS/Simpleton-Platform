import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Camera, Send, ArrowRight, CheckCircle, Shield, Clock, Star, X } from 'lucide-react';

type Step = 'landing' | 'chat' | 'contact' | 'submitted';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ContactInfo {
  name: string;
  email: string;
}

const OPENING = `Hi! I'm Simplicity. Drop a photo of your item and describe it in plain language â like "a gold ring with a diamond" or "some old coins I found." I'll ask a couple quick questions, then tell you exactly what it's worth and what your options are.`;

export default function WhatIsThisWorth() {
  const [step, setStep] = useState<Step>('landing');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'open', role: 'assistant', content: OPENING }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactInfo>({ name: '', email: '' });
  const [appraisalNumber, setAppraisalNumber] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedValue, setGeneratedValue] = useState('');
  const [generatedCategory, setGeneratedCategory] = useState('jewelry');
  const [shareUrl, setShareUrl] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scrollBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  };

  const sendMutation = useMutation({
    mutationFn: async ({ message, imageData }: { message: string; imageData?: string }) => {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await apiRequest('POST', '/api/assistant/help', {
        message,
        image: imageData,
        pageContext: '/what-is-this-worth',
        appContext: `CONSUMER APPRAISAL MODE â This is a regular person (not a dealer) who wants to know what their item is worth. 
        
Your ONLY job right now is to:
1. Gather enough info to describe the item professionally (ask max 2 questions at a time)
2. Once you have enough, generate the appraisal description and estimated value

Keep language simple â no trade jargon. Be warm, curious, and encouraging.
When you have enough information, output the appraisal blocks exactly:

---APPRAISAL_DESCRIPTION_START---
[Professional appraisal description]
---APPRAISAL_DESCRIPTION_END---
---APPRAISAL_VALUE_START---
[Number only, e.g. 850.00]
---APPRAISAL_VALUE_END---
---APPRAISAL_CATEGORY_START---
[gold, diamond, watch, coin, or jewelry]
---APPRAISAL_CATEGORY_END---
---READY_FOR_CONTACT---

After outputting those blocks, tell the user warmly: "I have everything I need. To get your certified appraisal document, just enter your name and email and I'll have Demiris review it personally."`,
        history,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const text: string = data.response || '';

      const descMatch = text.match(/---APPRAISAL_DESCRIPTION_START---([\s\S]*?)---APPRAISAL_DESCRIPTION_END---/);
      const valueMatch = text.match(/---APPRAISAL_VALUE_START---([\s\S]*?)---APPRAISAL_VALUE_END---/);
      const categoryMatch = text.match(/---APPRAISAL_CATEGORY_START---([\s\S]*?)---APPRAISAL_CATEGORY_END---/);
      const readyMatch = text.includes('---READY_FOR_CONTACT---');

      if (descMatch?.[1]) setGeneratedDescription(descMatch[1].trim());
      if (valueMatch?.[1]) setGeneratedValue(valueMatch[1].trim());
      if (categoryMatch?.[1]) setGeneratedCategory(categoryMatch[1].trim());

      const clean = text
        .replace(/---APPRAISAL_DESCRIPTION_START---[\s\S]*?---APPRAISAL_DESCRIPTION_END---/g, '')
        .replace(/---APPRAISAL_VALUE_START---[\s\S]*?---APPRAISAL_VALUE_END---/g, '')
        .replace(/---APPRAISAL_CATEGORY_START---[\s\S]*?---APPRAISAL_CATEGORY_END---/g, '')
        .replace(/---READY_FOR_CONTACT---/g, '')
        .trim();

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: clean || "I have everything I need. Enter your name and email below to get your certified appraisal document.",
      }]);

      if (readyMatch) {
        setTimeout(() => setStep('contact'), 800);
      }

      setImage(null);
      setImagePreview(null);
      scrollBottom();
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Something went wrong. Please try again.",
      }]);
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const numRes = await fetch('/api/appraisal/next-number');
      const numData = await numRes.json();
      const appraisalNum = numData.appraisalNumber;
      setAppraisalNumber(appraisalNum);

      const res = await apiRequest('POST', '/api/appraisal/save', {
        customerName: contact.name,
        customerEmail: contact.email,
        appraisalNumber: appraisalNum,
        itemCategory: generatedCategory,
        itemDescription: generatedDescription,
        retailValue: generatedValue,
        aiAssessment: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
        source: 'consumer',
      });
      return res.json();
    },
    onSuccess: (data) => {
      setShareUrl(data.shareUrl || '');
      setStep('submitted');
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed && !image) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed || 'Here is a photo of my item.',
    }]);
    setInput('');

    sendMutation.mutate({ message: trimmed || 'Please analyze this item.', imageData: image || undefined });
    scrollBottom();
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      setImage(base64);
    };
    reader.readAsDataURL(file);
  };

  if (step === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px 40px' }}>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <img src="/simpleton-logo.jpeg" alt="Simpletonâ¢" style={{ height: 52, objectFit: 'contain', marginBottom: 12 }} />
            <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Professional Appraisals
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{
              fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800,
              color: '#f0f4ff', lineHeight: 1.15, marginBottom: 16,
              fontFamily: '"Playfair Display", Georgia, serif',
            }}>
              What is this worth?
            </h1>
            <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.6, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
              Show us your jewelry, coins, or diamonds. We'll tell you exactly what you have â and what it's worth.
            </p>
            <button
              onClick={() => setStep('chat')}
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #b8860b)',
                color: '#000', border: 'none', borderRadius: 12,
                padding: '16px 40px', fontSize: 17, fontWeight: 700,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
              }}
            >
              Find Out Now <ArrowRight size={20} />
            </button>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 12 }}>
              Certified appraisal document Â· $15 Â· 24-48 hour turnaround
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
            {[
              { icon: <Shield size={22} color="#c9a84c" />, title: 'GIA Certified', desc: 'Reviewed by Demiris Brown, Graduate Gemologist' },
              { icon: <Clock size={22} color="#c9a84c" />, title: '24-48 Hours', desc: 'Fast turnaround on all appraisal requests' },
              { icon: <Star size={22} color="#c9a84c" />, title: '12+ Years', desc: 'Industry experience at Simpleton Technologies' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              We appraise
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                'Gold & Silver Jewelry', 'Diamonds & Gemstones',
                'Coins & Bullion', 'Luxury Watches',
                'Necklaces & Chains', 'Estate & Inherited Items',
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: '#cbd5e1', padding: '6px 0' }}>{item}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (step === 'chat') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>

        <div style={{
          background: '#1e293b', borderBottom: '1px solid #334155',
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <img src="/simpleton-logo.jpeg" alt="" style={{ height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Simplicity</div>
            <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Online Â· Appraisal Assistant
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
            Step 1 of 2 â Tell me about your item
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640, margin: '0 auto', width: '100%' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {msg.role === 'assistant' && (
                <img src="/simpleton-logo.jpeg" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{
                maxWidth: '80%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? '#c9a84c' : '#1e293b',
                color: msg.role === 'user' ? '#000' : '#e2e8f0',
                fontSize: 14, lineHeight: 1.6,
                border: msg.role === 'assistant' ? '1px solid #334155' : 'none',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {sendMutation.isPending && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <img src="/simpleton-logo.jpeg" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 4 }}>
                {[0, 150, 300].map(d => (
                  <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {imagePreview && (
          <div style={{ padding: '0 16px 8px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="" style={{ height: 72, width: 72, objectFit: 'cover', borderRadius: 8, border: '2px solid #c9a84c' }} />
              <button onClick={() => { setImage(null); setImagePreview(null); }} style={{
                position: 'absolute', top: -6, right: -6, background: '#ef4444',
                border: 'none', borderRadius: '50%', width: 20, height: 20,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={11} color="#fff" />
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#1e293b', borderTop: '1px solid #334155', padding: '12px 16px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => fileRef.current?.click()} style={{
              background: '#334155', border: 'none', borderRadius: 8, width: 40, height: 40,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Camera size={18} color="#94a3b8" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Describe your item..."
              style={{
                flex: 1, background: '#0f172a', border: '1px solid #334155',
                borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#f1f5f9', outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={sendMutation.isPending || (!input.trim() && !image)}
              style={{
                background: (input.trim() || image) && !sendMutation.isPending ? '#c9a84c' : '#334155',
                border: 'none', borderRadius: 8, width: 40, height: 40,
                cursor: (input.trim() || image) && !sendMutation.isPending ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Send size={16} color={(input.trim() || image) && !sendMutation.isPending ? '#000' : '#64748b'} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {['Gold ring', 'Diamond necklace', 'Old coins', 'Silver bracelet', 'Rolex watch'].map(s => (
              <button key={s} onClick={() => setInput(s)} style={{
                background: '#0f172a', border: '1px solid #334155', borderRadius: 20,
                padding: '4px 10px', fontSize: 11, color: '#94a3b8', cursor: 'pointer',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
      </div>
    );
  }

  if (step === 'contact') {
    const estimatedValue = generatedValue
      ? parseFloat(generatedValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : null;

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%' }}>

          {estimatedValue && (
            <div style={{
              background: 'linear-gradient(135deg, #14532d, #166534)',
              border: '1px solid #22c55e', borderRadius: 12,
              padding: '20px 24px', textAlign: 'center', marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: '#86efac', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Estimated Retail Value
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#4ade80', fontFamily: '"Playfair Display", serif' }}>
                {estimatedValue}
              </div>
              <div style={{ fontSize: 12, color: '#86efac', marginTop: 4 }}>
                Pending certified review by Demiris Brown, GIA
              </div>
            </div>
          )}

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img src="/simpleton-logo.jpeg" alt="" style={{ height: 40, marginBottom: 12 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
                Almost done â where should we send it?
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Your certified appraisal document will be emailed to you after Demiris reviews it personally. Usually within 24-48 hours.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Your Full Name
                </label>
                <input
                  value={contact.name}
                  onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Smith"
                  style={{
                    width: '100%', background: '#0f172a', border: '1px solid #334155',
                    borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#f1f5f9',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@email.com"
                  style={{
                    width: '100%', background: '#0f172a', border: '1px solid #334155',
                    borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#f1f5f9',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !contact.name.trim() || !contact.email.includes('@')}
                style={{
                  background: contact.name && contact.email.includes('@') && !submitMutation.isPending
                    ? 'linear-gradient(135deg, #c9a84c, #b8860b)'
                    : '#334155',
                  border: 'none', borderRadius: 10, padding: '14px',
                  fontSize: 15, fontWeight: 700,
                  color: contact.name && contact.email.includes('@') && !submitMutation.isPending ? '#000' : '#64748b',
                  cursor: contact.name && contact.email.includes('@') && !submitMutation.isPending ? 'pointer' : 'not-allowed',
                  width: '100%', marginTop: 4,
                }}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Get My Certified Appraisal â'}
              </button>

              <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                $15 certification fee applies upon Demiris's review and approval. You'll receive a payment link by email. No charge if we can't certify your item.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submitted') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, fontFamily: '"Playfair Display", serif' }}>
            You're all set, {contact.name.split(' ')[0]}!
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            Appraisal <strong style={{ color: '#f1f5f9' }}>#{appraisalNumber}</strong> has been submitted.
            Demiris Brown will personally review it and email your certified document within 24-48 hours.
          </p>

          {shareUrl && (
            <div style={{
              background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
              padding: '14px 18px', marginBottom: 24, textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Your Appraisal Link (save this)
              </div>
              <div style={{ fontSize: 13, color: '#c9a84c', wordBreak: 'break-all' }}>
                {shareUrl}
              </div>
            </div>
          )}

          <div style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
            padding: '16px 20px', marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>What happens next?</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, textAlign: 'left' }}>
              1. Demiris reviews your submission personally<br />
              2. You receive a payment link ($15) by email<br />
              3. After payment, your certified document is emailed<br />
              4. Use the shareable link for insurance, estate, or resale
            </div>
          </div>

          <a href="/" style={{
            background: '#c9a84c', color: '#000', padding: '12px 28px',
            borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700,
            display: 'inline-block',
          }}>
            Back to Simpletonâ¢
          </a>
        </div>
      </div>
    );
  }

  return null;
}
