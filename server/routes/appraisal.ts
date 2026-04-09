import type { Express } from "express";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { appraisals } from "@shared/schema";
import { isAuthenticated } from "../auth";
import { getKitcoPricing } from "../kitco-pricing";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";

// Anthropic's vision API has a 5 MB per-image limit. Phone cameras routinely
// produce 7-15 MB images, so we must compress before sending. This function
// decodes the base64, resizes to max 2048px on the longest side, and
// re-encodes as JPEG at quality 80 — which keeps visual detail high for
// hallmark and stamp recognition while staying well under the 5 MB cap.
const MAX_VISION_BYTES = 4_800_000; // stay under 5 MB with margin
const MAX_VISION_DIM = 2048;

async function compressImageForVision(dataUrl: string): Promise<{ base64: string; mediaType: string }> {
  const mimeMatch = dataUrl.match(/^data:(image\/[a-z]+);base64,/);
  const originalType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const raw = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  const buf = Buffer.from(raw, 'base64');

  // If already under the limit, pass through unchanged
  if (buf.length <= MAX_VISION_BYTES) {
    return { base64: raw, mediaType: originalType };
  }

  // Resize + compress with sharp
  const compressed = await sharp(buf)
    .resize(MAX_VISION_DIM, MAX_VISION_DIM, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  console.log(`📸 Image compressed: ${(buf.length / 1024 / 1024).toFixed(1)}MB → ${(compressed.length / 1024 / 1024).toFixed(1)}MB`);

  return {
    base64: compressed.toString('base64'),
    mediaType: 'image/jpeg',
  };
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeHeaderField(s: string): string {
  return s.replace(/[\r\n]/g, '');
}

const VALID_SPEC_KEYS = new Set([
  'metalType', 'karat', 'weight', 'measurements', 'stoneType', 'stoneWeight',
  'stoneColor', 'stoneClarity', 'stoneCut', 'stoneShape', 'condition', 'brandMaker', 'hallmarks',
]);

function sanitizeItemSpecs(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (VALID_SPEC_KEYS.has(k) && typeof v === 'string') {
      const trimmed = v.trim().slice(0, 500);
      if (trimmed) out[k] = trimmed;
    }
  }
  return out;
}

export function registerAppraisalRoutes(app: Express) {

  app.post("/api/assistant/appraise", async (req, res) => {
    try {
      console.log('📸 Simplicity Image Appraisal Request received');

      // Hard guard: appraisal cannot run without an Anthropic API key.
      // Without this check, missing env vars produced a generic "Appraisal service error"
      // with no signal to the operator. Fail fast and clearly.
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ Appraisal aborted: ANTHROPIC_API_KEY is not set');
        return res.status(503).json({
          error: "Appraisal service unavailable",
          response: "Simplicity's appraisal engine is temporarily offline (missing API credentials). Please contact support.",
          activeProviders: [],
          confidenceScore: 0,
          processingTime: 0
        });
      }

      const { image, message, itemDetails, sessionToken, pageContext } = req.body;

      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: "Image is required (base64 format)" });
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mimeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
      if (!mimeMatch || !validTypes.includes(mimeMatch[1])) {
        return res.status(400).json({ error: "Invalid image format. Supported: JPEG, PNG, GIF, WebP" });
      }

      const base64Only = image.replace(/^data:image\/[a-z]+;base64,/, '');
      const approxSizeBytes = (base64Only.length * 3) / 4;
      if (approxSizeBytes > 20 * 1024 * 1024) {
        return res.status(400).json({ error: "Image too large. Maximum size is 20MB." });
      }

      // Fallback prices used if the live feed is unavailable. Without these,
      // a failed Kitco fetch produced "$0.00/troy oz" in the prompt and the
      // model would compute melt values against zero. Updated 2026-04 baseline.
      const FALLBACK_PRICING = { gold: 2340, silver: 31, platinum: 1000, palladium: 900 };
      let livePricing = { ...FALLBACK_PRICING };
      let pricingSource: 'live' | 'fallback' = 'fallback';
      try {
        const prices = await getKitcoPricing();
        if (prices && (prices.gold || prices.silver)) {
          livePricing = {
            gold: prices.gold || FALLBACK_PRICING.gold,
            silver: prices.silver || FALLBACK_PRICING.silver,
            platinum: prices.platinum || FALLBACK_PRICING.platinum,
            palladium: prices.palladium || FALLBACK_PRICING.palladium,
          };
          pricingSource = 'live';
        } else {
          console.warn('⚠️ Live pricing returned empty — using fallback baseline');
        }
      } catch (e) {
        console.warn('⚠️ Live pricing fetch failed — using fallback baseline:', e);
      }

      const detailsText = itemDetails ? `
USER-PROVIDED ITEM DETAILS:
${itemDetails.weight ? `- Weight: ${itemDetails.weight}` : ''}
${itemDetails.karat ? `- Karat/Purity: ${itemDetails.karat}` : ''}
${itemDetails.clarity ? `- Diamond Clarity: ${itemDetails.clarity}` : ''}
${itemDetails.color ? `- Diamond Color: ${itemDetails.color}` : ''}
${itemDetails.cut ? `- Diamond Cut: ${itemDetails.cut}` : ''}
${itemDetails.caratWeight ? `- Carat Weight: ${itemDetails.caratWeight}` : ''}
${itemDetails.condition ? `- Condition: ${itemDetails.condition}` : ''}
${itemDetails.brand ? `- Brand/Maker: ${itemDetails.brand}` : ''}
${itemDetails.model ? `- Model: ${itemDetails.model}` : ''}
${itemDetails.year ? `- Year/Era: ${itemDetails.year}` : ''}
${itemDetails.certification ? `- Certification: ${itemDetails.certification}` : ''}
${itemDetails.other ? `- Additional Info: ${itemDetails.other}` : ''}
` : '';

      const userNote = message ? `\nUSER'S NOTE: ${message}` : '';

      // Upgraded to Sonnet 4.6 for substantially better long-form professional
      // appraisal writing and image analysis.
      // <important_do_not_delete>
      const APPRAISAL_MODEL = "claude-sonnet-4-6";
      // </important_do_not_delete>

      const appraisalPrompt = `You are Simplicity, the AI appraisal engine powering Simpleton™ by LaDale Industries LLC. You analyze items using current market data and provide accurate assessments of precious metals, diamonds, gemstones, coins, watches, and jewelry. Your appraisals will be reviewed and certified by Demiris Brown, GIA Graduate Gemologist and Accredited Jewelry Professional.

CURRENT LIVE MARKET PRICES (use these for calculations):
- Gold: $${livePricing.gold.toFixed(2)}/troy oz (Source: Live Swissquote feed via Simpleton proprietary aggregator)
- Silver: $${livePricing.silver.toFixed(2)}/troy oz
- Platinum: $${livePricing.platinum.toFixed(2)}/troy oz
- Palladium: $${livePricing.palladium.toFixed(2)}/troy oz

${detailsText}${userNote}

REQUIRED DATA CHECKLIST — You MUST gather ALL applicable data before providing a final valuation. If any required data is missing and cannot be determined from the image, you MUST ask for it.

For GOLD / PRECIOUS METAL items, you need:
1. Karat/purity (10K, 14K, 18K, 24K, or hallmark like 585, 750, 375, 925, PLAT)
2. Weight in grams (ask user to weigh on any scale — kitchen scale works)
3. Item type (chain, ring, bracelet, pendant, bar, coin)
4. If chain: link type (rope, Cuban, figaro, box, cable, Franco, herringbone, wheat)
5. Solid or hollow (hollow pieces feel lighter than they look)
6. Hallmarks or stamps (photos of stamps are extremely helpful)
7. Clasp type and condition

For DIAMOND / GEMSTONE items, you need:
1. GIA, IGI, AGS, or other lab certificate number (if available — this is the single most important piece of data)
2. If no cert: Explain clearly that accurate 4C grading requires in-person examination with gemological equipment
3. Carat weight (or diameter in mm if weight unknown)
4. Shape (round, princess, oval, cushion, emerald, pear, marquise, etc.)
5. Mounting type and metal
6. Number of stones and arrangement
7. Any visible inclusions, chips, or damage

For WATCHES / LUXURY TIMEPIECES, you need:
1. Reference number (engraved between lugs at 12 o'clock, or on caseback)
2. Serial number (between lugs at 6 o'clock on older models; on rehaut at 6 o'clock on 2008+ models)
3. Case material (steel, gold, two-tone, platinum)
4. Dial color and condition
5. Bracelet type and condition (tight links or stretched)
6. Box, papers, warranty card (significantly affects value)
7. Service history if known

For COINS, you need:
1. Denomination ($1, $5, $10, $20, etc.)
2. Date (year)
3. Mint mark (D, S, O, CC, W — usually near date or on reverse)
4. Approximate size (quarter, half dollar, dollar size)
5. Weight if possible
6. Photos of both obverse and reverse
7. Any visible damage, cleaning, or wear

APPRAISAL PROCESS:
1. IDENTIFY the item — what exactly is it? (type, material, maker, era)
2. CHECK the data checklist above — do you have everything you need? If not, ask.
3. ASSESS quality, condition, and authenticity indicators visible in the image
4. CALCULATE the value using real market data and SHOW YOUR MATH:
   - For gold/silver/platinum: Spot price x weight in troy oz x purity factor = melt value
   - For diamonds: Reference Rapaport Diamond Report (January 9, 2026) per-carat pricing
   - For coins: Melt value (from US Mint metal content specs) + numismatic premium
   - For watches: Secondary market values from Simpleton Rolex Market Intelligence Database
   - For jewelry: Material melt value + craftsmanship/designer premium
5. CITE YOUR SOURCES — every number must have a source:
   - Metal prices: "Based on live spot pricing from Simpleton's proprietary aggregator"
   - Diamond prices: "Per the Rapaport Diamond Report, January 9, 2026, Volume 49 No. 2"
   - Coin content: "Per US Mint specifications"
   - Watch values: "Based on Simpleton secondary market data"
6. PROVIDE a professional appraisal with:
   - Item Description and Identification
   - Material Analysis (what you can determine from the image)
   - Condition Assessment (scale: Poor / Fair / Good / Very Good / Excellent / Mint)
   - Calculation Breakdown (show every step of the math)
   - Melt/Intrinsic Value (raw material value with formula shown)
   - Estimated Fair Market Value (realistic range: low to high)
   - Retail Replacement Value (what it would cost to buy equivalent new)
   - Key Factors Affecting Value
   - Data Sources Used (list each source referenced)
   - Recommendations (cleaning, certification, insurance, further evaluation)

CRITICAL RULES:
- Be HONEST — if you cannot determine something from the photo, say so and ask
- Give REALISTIC price ranges — never inflate or deflate
- SHOW YOUR MATH — every calculation must be visible and verifiable
- CITE EVERY SOURCE — no number without attribution
- This is an ESTIMATED appraisal based on visual inspection — state this clearly
- For items where weight is not provided, estimate typical weights and clearly label it as an estimate
- Recommend in-person appraisal for insurance, legal, or sale purposes
- Never guess at karat, weight, or diamond grades — ask if you cannot determine them

FORMAT: Write professionally with clear section labels on their own lines followed by colons. Do not use asterisks, hashtags, pound signs, or any markdown formatting symbols. Use plain text only.`;

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      // Compress oversized images before sending to Anthropic (5 MB limit)
      const { base64: compressedBase64, mediaType: compressedMediaType } = await compressImageForVision(image);

      const startTime = Date.now();
      const visionResponse = await anthropic.messages.create({
        model: APPRAISAL_MODEL,
        max_tokens: 6000,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: appraisalPrompt },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: compressedMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: compressedBase64
              }
            }
          ]
        }]
      });
      const processingTime = Date.now() - startTime;

      const appraisalText = visionResponse.content[0].type === 'text' ? visionResponse.content[0].text : 'Unable to generate appraisal';

      console.log('✅ Simplicity Appraisal completed in', processingTime, 'ms');

      if (!sessionToken) {
        console.warn('⚠️ Appraisal completed without sessionToken — interaction NOT saved to user memory');
      }
      if (sessionToken) {
        try {
          const { buildSimplicityPrompt, saveInteraction } = await import('../simplicity-brain');
          const { session } = await buildSimplicityPrompt(sessionToken, pageContext || null);
          const userMsg = (message || 'Please appraise this item') + (itemDetails ? ' [with item details]' : '');
          await saveInteraction(session, userMsg, appraisalText, pageContext || null, {
            appraisalType: 'Professional AI Appraisal',
            providers: ['Simplicity Vision'],
            confidence: 92,
            processingTime,
            hasImage: true,
          });
        } catch (saveErr) {
          console.log('⚠️ Could not save appraisal to memory (non-blocking):', saveErr);
        }
      }
      
      res.json({
        response: appraisalText,
        activeProviders: ['Simplicity Vision AI'],
        confidenceScore: 92,
        processingTime,
        appraisalType: 'visual_ai',
        livePricing,
        pricingSource,
        disclaimer: 'This is an estimated appraisal based on visual AI analysis and current market data. For insurance, sale, or legal purposes, please obtain an in-person professional appraisal.'
      });

    } catch (error: any) {
      console.error('❌ Simplicity Appraisal Error:', error);
      const detail = error?.message || String(error);
      res.status(500).json({
        error: "Appraisal service error",
        errorDetail: detail,
        response: `I'm having trouble analyzing your image right now. (${detail}). Please try again, or ensure the image is clear, well-lit, and under 20MB.`,
        activeProviders: [],
        confidenceScore: 0,
        processingTime: 0
      });
    }
  });

  app.get("/api/appraisal/next-number", async (_req, res) => {
    try {
      const result = await db.execute(sql`
        INSERT INTO appraisal_counter (id, last_number)
        VALUES (1, 1)
        ON CONFLICT (id) DO UPDATE SET last_number = appraisal_counter.last_number + 1
        RETURNING last_number
      `);
      const num = result.rows[0]?.last_number as number;
      const formatted = `S${String(num).padStart(4, '0')}`;
      res.json({ appraisalNumber: formatted });
    } catch (error: any) {
      console.error('❌ Appraisal counter error:', error);
      res.status(500).json({ error: "Failed to generate appraisal number" });
    }
  });

  app.post("/api/appraisal/submit", async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        appraisalType,
        appraisalNumber,
        itemDescription,
        retailValue,
        itemImages,
        zoomRequested,
        itemCategory,
        customerAddress,
        customerCityStateZip,
        appraisalDate,
        templateStyle,
        itemSpecs,
        appraisalReport,
      } = req.body;

      if (!customerName || !customerEmail) {
        return res.status(400).json({ error: "Name and email are required to submit an appraisal." });
      }

      let validatedImages: string[] = [];
      if (Array.isArray(itemImages)) {
        const MAX_IMAGES = 5;
        const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
        const ALLOWED_PREFIXES = ['data:image/jpeg', 'data:image/png', 'data:image/webp', 'data:image/gif'];
        for (const img of itemImages.slice(0, MAX_IMAGES)) {
          if (typeof img !== 'string') continue;
          if (img.length > MAX_IMAGE_SIZE) continue;
          if (!ALLOWED_PREFIXES.some(p => img.startsWith(p))) continue;
          validatedImages.push(img);
        }
      }

      const validTemplates = ['classic', 'elegant', 'modern', 'professional', 'detailed'];
      const chosenTemplate = validTemplates.includes(templateStyle) ? templateStyle : 'classic';

      const shareToken = crypto.randomBytes(12).toString("base64url");

      const sanitizedSpecs = sanitizeItemSpecs(itemSpecs);

      // Accept structured AI-generated report (condition grade, tiered values,
      // key factors, sources, etc.) — stored as-is but only after light
      // shape validation so we don't persist arbitrary client payloads.
      let sanitizedReport: any = null;
      if (appraisalReport && typeof appraisalReport === 'object' && !Array.isArray(appraisalReport)) {
        const r = appraisalReport as Record<string, unknown>;
        const pickStr = (k: string) => typeof r[k] === 'string' ? String(r[k]).slice(0, 4000) : undefined;
        const pickNum = (k: string) => typeof r[k] === 'number' && isFinite(r[k] as number) ? (r[k] as number) : undefined;
        const pickStrArr = (k: string) => Array.isArray(r[k])
          ? (r[k] as unknown[]).filter(x => typeof x === 'string').slice(0, 10).map(x => String(x).slice(0, 500))
          : undefined;
        sanitizedReport = {
          materialAnalysis: pickStr('materialAnalysis'),
          conditionGrade: pickStr('conditionGrade'),
          conditionNotes: pickStr('conditionNotes'),
          meltValue: pickNum('meltValue'),
          fairMarketLow: pickNum('fairMarketLow'),
          fairMarketHigh: pickNum('fairMarketHigh'),
          retailReplacement: pickNum('retailReplacement'),
          estateValue: pickNum('estateValue'),
          liquidationValue: pickNum('liquidationValue'),
          valuationMath: pickStr('valuationMath'),
          keyFactors: pickStrArr('keyFactors'),
          sources: pickStrArr('sources'),
          recommendations: pickStrArr('recommendations'),
          certificationAdvice: pickStr('certificationAdvice'),
        };
      }

      const [saved] = await db.insert(appraisals).values({
        appraisalNumber: appraisalNumber || `S${Date.now()}`,
        shareToken,
        status: "pending",
        itemCategory: itemCategory || "jewelry",
        itemDescription: itemDescription || '',
        retailValue: retailValue || null,
        itemImages: validatedImages,
        customerName,
        customerEmail,
        customerAddress: customerAddress || null,
        customerCityStateZip: customerCityStateZip || null,
        appraisalDate: appraisalDate || new Date().toISOString().split("T")[0],
        itemSpecs: sanitizedSpecs,
        appraisalReport: sanitizedReport,
        templateStyle: chosenTemplate,
        zoomRequested: zoomRequested || false,
      }).returning();

      const baseUrl = process.env.APP_DOMAIN || 'https://simpletonapp.com';
      const viewUrl = `${baseUrl}/appraisal/${shareToken}`;

      const { notifyOwnerHtml } = await import('../notify-owner');

      const categoryLabel: Record<string, string> = {
        gold: 'Gold / Precious Metal',
        diamond: 'Diamond / Gemstone',
        watch: 'Watch / Timepiece',
        coin: 'Coin / Bullion',
        jewelry: 'General Jewelry',
      };

      const specs = sanitizedSpecs as Record<string, string>;
      const specsRows = [
        specs.metalType && ['Metal Type', escHtml(specs.metalType)],
        specs.karat && ['Karat / Purity', escHtml(specs.karat)],
        specs.weight && ['Weight', escHtml(specs.weight.includes('g') ? specs.weight : specs.weight + 'g')],
        specs.measurements && ['Measurements', escHtml(specs.measurements)],
        specs.stoneType && ['Stone Type', escHtml(specs.stoneType)],
        specs.stoneWeight && ['Stone Weight', escHtml(specs.stoneWeight.includes('ct') ? specs.stoneWeight : specs.stoneWeight + ' ct')],
        specs.stoneColor && ['Stone Color', escHtml(specs.stoneColor)],
        specs.stoneClarity && ['Stone Clarity', escHtml(specs.stoneClarity)],
        specs.stoneCut && ['Stone Cut', escHtml(specs.stoneCut)],
        specs.stoneShape && ['Stone Shape', escHtml(specs.stoneShape)],
        specs.condition && ['Condition', escHtml(specs.condition)],
        specs.brandMaker && ['Brand / Maker', escHtml(specs.brandMaker)],
        specs.hallmarks && ['Hallmarks', escHtml(specs.hallmarks)],
      ].filter(Boolean) as [string, string][];

      const specsHtml = specsRows.length > 0
        ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
            <tr style="background:#2E5090;color:#fff;"><th colspan="2" style="padding:8px 12px;text-align:left;font-size:13px;letter-spacing:0.05em;">ITEM SPECIFICATIONS</th></tr>
            ${specsRows.map(([label, value], i) =>
              `<tr style="background:${i % 2 === 0 ? '#f8f9fa' : '#fff'}"><td style="padding:6px 12px;font-weight:700;color:#333;border-bottom:1px solid #eee;width:160px;">${label}</td><td style="padding:6px 12px;color:#1a1a1a;border-bottom:1px solid #eee;">${value}</td></tr>`
            ).join('')}
           </table>`
        : '';

      const photosHtml = validatedImages.length > 0
        ? `<div style="margin:16px 0;">
            <div style="font-weight:700;font-size:13px;color:#2E5090;margin-bottom:8px;">ITEM PHOTOS (${validatedImages.length})</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              ${validatedImages.map((img, i) =>
                `<img src="${img}" alt="Item photo ${i + 1}" style="width:180px;height:180px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" />`
              ).join('')}
            </div>
           </div>`
        : '';

      const emailHtml = `
<div style="max-width:640px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <div style="background:#1a1a2e;padding:20px 24px;border-radius:8px 8px 0 0;">
    <div style="color:#c9a84c;font-size:20px;font-weight:700;">New Appraisal Submission</div>
    <div style="color:#94a3b8;font-size:13px;margin-top:4px;">Appraisal #${escHtml(saved.appraisalNumber || '')} · ${escHtml(categoryLabel[itemCategory] || itemCategory || 'General')}</div>
  </div>

  <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;">
    <a href="${viewUrl}" style="display:block;background:#2E5090;color:#fff;text-align:center;padding:14px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:20px;">View Full Appraisal — Edit &amp; Certify</a>

    <table style="width:100%;font-size:14px;margin-bottom:16px;">
      <tr><td style="padding:4px 0;font-weight:700;width:100px;">Customer:</td><td>${escHtml(customerName)}</td></tr>
      <tr><td style="padding:4px 0;font-weight:700;">Email:</td><td><a href="mailto:${escHtml(customerEmail)}">${escHtml(customerEmail)}</a></td></tr>
      <tr><td style="padding:4px 0;font-weight:700;">Category:</td><td>${escHtml(categoryLabel[itemCategory] || itemCategory || 'General')}</td></tr>
      <tr><td style="padding:4px 0;font-weight:700;">Value:</td><td style="font-weight:700;color:#2E5090;">${escHtml(retailValue || 'Not yet estimated')}</td></tr>
      <tr><td style="padding:4px 0;font-weight:700;">Zoom:</td><td>${zoomRequested ? '<span style="color:#e53e3e;font-weight:700;">YES — Customer requests a Zoom consultation</span>' : 'No'}</td></tr>
    </table>

    ${specsHtml}

    <div style="background:#f8f9fa;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:16px 0;">
      <div style="font-weight:700;font-size:13px;color:#2E5090;margin-bottom:8px;">DESCRIPTION</div>
      <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${(itemDescription || 'No description provided').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>

    ${photosHtml}
  </div>

  <div style="background:#f1f5f9;padding:16px 24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;font-size:12px;color:#64748b;">
    Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} · Simpleton Appraisal System
  </div>
</div>`;

      await notifyOwnerHtml({
        subject: `New Appraisal #${saved.appraisalNumber} from ${customerName} — ${categoryLabel[itemCategory] || 'General'}`,
        html: emailHtml,
        replyTo: customerEmail,
      });

      console.log(`✅ Appraisal #${saved.appraisalNumber} saved & emailed for ${customerName} (view: ${viewUrl})`);

      res.json({
        success: true,
        message: "Your preliminary appraisal has been submitted successfully. A certified appraiser (Demiris Brown, GIA Graduate Gemologist) will review your submission and contact you within 24-48 hours.",
        appraisalNumber: saved.appraisalNumber,
        shareToken,
        shareUrl: viewUrl,
      });
    } catch (error: any) {
      console.error('❌ Appraisal submission error:', error);
      res.status(500).json({
        error: "Failed to submit appraisal. Please try again.",
      });
    }
  });

  app.post("/api/appraisal/save", async (req, res) => {
    try {
      const {
        customerName, customerEmail, appraisalNumber,
        itemCategory, itemDescription, retailValue,
        itemImages, customerAddress, customerCityStateZip,
        appraisalDate, aiAssessment, zoomRequested, source, templateStyle, itemSpecs,
      } = req.body;

      if (!customerName || !customerEmail || !itemDescription) {
        return res.status(400).json({ error: "Name, email, and description are required." });
      }

      const validTemplates = ['classic', 'elegant', 'modern', 'professional', 'detailed'];
      const chosenTemplate = validTemplates.includes(templateStyle) ? templateStyle : 'classic';

      const shareToken = crypto.randomBytes(12).toString("base64url");

      const [saved] = await db.insert(appraisals).values({
        appraisalNumber: appraisalNumber || `S${Date.now()}`,
        shareToken,
        status: "pending",
        itemCategory: itemCategory || "jewelry",
        itemDescription,
        retailValue: retailValue || null,
        itemImages: itemImages || [],
        customerName,
        customerEmail,
        customerAddress: customerAddress || null,
        customerCityStateZip: customerCityStateZip || null,
        appraisalDate: appraisalDate || new Date().toISOString().split("T")[0],
        aiAssessment: aiAssessment || null,
        itemSpecs: sanitizeItemSpecs(itemSpecs),
        templateStyle: chosenTemplate,
        zoomRequested: zoomRequested || false,
      }).returning();

      const { notifyOwner } = await import("../notify-owner");
      await notifyOwner({
        subject: `New Appraisal #${saved.appraisalNumber} — ${customerName} (${itemCategory || "jewelry"})`,
        body: `New appraisal submission.\n\nCustomer: ${customerName} <${customerEmail}>\nAppraisal #: ${saved.appraisalNumber}\nCategory: ${itemCategory || "jewelry"}\nEstimated Value: ${retailValue || "Not estimated"}\nSource: ${source || "web"}\n\nDescription:\n${itemDescription}\n\nShareable link: https://simpletonapp.com/appraisal/${shareToken}`,
        replyTo: customerEmail,
      });

      res.json({
        success: true,
        appraisalId: saved.id,
        appraisalNumber: saved.appraisalNumber,
        shareToken,
        shareUrl: `https://simpletonapp.com/appraisal/${shareToken}`,
        message: "Appraisal saved. Demiris has been notified.",
      });
    } catch (error: any) {
      console.error("Appraisal save error:", error);
      res.status(500).json({ error: "Failed to save appraisal.", details: error.message });
    }
  });

  app.get("/api/appraisal/view/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token || token.length < 8) return res.status(400).json({ error: "Invalid token." });

      const [appraisal] = await db.select().from(appraisals)
        .where(eq(appraisals.shareToken, token))
        .limit(1);

      if (!appraisal) return res.status(404).json({ error: "Appraisal not found." });

      res.json({
        appraisalNumber: appraisal.appraisalNumber,
        status: appraisal.status,
        itemCategory: appraisal.itemCategory,
        itemDescription: appraisal.itemDescription,
        retailValue: appraisal.retailValue,
        itemImages: appraisal.itemImages || [],
        customerName: appraisal.customerName,
        customerAddress: appraisal.customerAddress,
        customerCityStateZip: appraisal.customerCityStateZip,
        appraisalDate: appraisal.appraisalDate,
        certifiedBy: appraisal.certifiedBy,
        certificationNotes: appraisal.certificationNotes,
        certifiedAt: appraisal.certifiedAt,
        templateStyle: appraisal.templateStyle || 'classic',
        itemSpecs: appraisal.itemSpecs || {},
        appraisalReport: (appraisal as any).appraisalReport || null,
        shareToken: appraisal.shareToken,
        createdAt: appraisal.createdAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to load appraisal." });
    }
  });

  app.patch("/api/appraisal/update/:token", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required." });
      }

      const { token } = req.params;
      const { itemDescription, retailValue, certificationNotes, itemSpecs } = req.body;

      if (!token || token.length < 8) return res.status(400).json({ error: "Invalid token." });

      const updates: any = { updatedAt: new Date() };
      if (itemDescription !== undefined) updates.itemDescription = itemDescription;
      if (retailValue !== undefined) updates.retailValue = retailValue;
      if (certificationNotes !== undefined) updates.certificationNotes = certificationNotes;
      if (itemSpecs !== undefined) updates.itemSpecs = sanitizeItemSpecs(itemSpecs);

      const [updated] = await db.update(appraisals).set(updates)
        .where(eq(appraisals.shareToken, token)).returning();

      if (!updated) return res.status(404).json({ error: "Appraisal not found." });

      res.json({ success: true, message: "Appraisal updated." });
    } catch (error: any) {
      console.error("Appraisal update error:", error);
      res.status(500).json({ error: "Failed to update appraisal." });
    }
  });

  app.post("/api/appraisal/certify-by-token/:token", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required." });
      }

      const { token } = req.params;
      const { certificationNotes, retailValue } = req.body;

      if (!token || token.length < 8) return res.status(400).json({ error: "Invalid token." });

      const [updated] = await db.update(appraisals).set({
        status: "certified",
        certifiedBy: "Demiris Brown, GIA Graduate Gemologist",
        certificationNotes: certificationNotes || null,
        retailValue: retailValue || undefined,
        certifiedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(appraisals.shareToken, token)).returning();

      if (!updated) return res.status(404).json({ error: "Appraisal not found." });

      try {
        const { getUncachableSendGridClient } = await import("../sendgrid-client");
        const { client, fromEmail } = await getUncachableSendGridClient();
        if (client) {
          const baseUrl = process.env.APP_DOMAIN || 'https://simpletonapp.com';
          await client.send({
            to: updated.customerEmail,
            from: { email: fromEmail, name: 'Simpleton™ Appraisals' },
            subject: `Your Certified Appraisal is Ready — #${updated.appraisalNumber}`,
            text: `Dear ${updated.customerName},\n\nYour appraisal has been certified by Demiris Brown, GIA Graduate Gemologist.\n\nAppraisal: #${updated.appraisalNumber}\nView your certified document: ${baseUrl}/appraisal/${updated.shareToken}\n\nThis link can be shared with insurance companies, attorneys, or buyers.\n\nDemiris Brown\nGIA Graduate Gemologist · simpletonapp.com`,
          });
        }
      } catch (e) { /* email is non-blocking */ }

      res.json({
        success: true,
        message: `Appraisal #${updated.appraisalNumber} certified. Customer notified at ${updated.customerEmail}.`,
      });
    } catch (error: any) {
      console.error("Certify error:", error);
      res.status(500).json({ error: "Failed to certify." });
    }
  });

  app.post("/api/appraisal/certify/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { certificationNotes, retailValue } = req.body;

      const [updated] = await db.update(appraisals).set({
        status: "certified",
        certifiedBy: "Demiris Brown, GIA Graduate Gemologist",
        certificationNotes: certificationNotes || null,
        retailValue: retailValue || undefined,
        certifiedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(appraisals.id, id)).returning();

      if (!updated) return res.status(404).json({ error: "Appraisal not found." });

      try {
        const { getUncachableSendGridClient } = await import("../sendgrid-client");
        const sg = getUncachableSendGridClient();
        if (sg) {
          await sg.send({
            to: updated.customerEmail,
            from: "demiris@simpletonapp.com",
            subject: `Your Certified Appraisal is Ready — #${updated.appraisalNumber}`,
            text: `Dear ${updated.customerName},\n\nYour appraisal has been certified by Demiris Brown, GIA Graduate Gemologist.\n\nAppraisal: #${updated.appraisalNumber}\nView your document: https://simpletonapp.com/appraisal/${updated.shareToken}\n\nThis link can be shared with insurance companies, attorneys, or buyers.\n\nDemiris Brown\nGIA Graduate Gemologist · simpletonapp.com`,
          });
        }
      } catch (e) { /* email is non-blocking */ }

      res.json({
        success: true,
        shareUrl: `https://simpletonapp.com/appraisal/${updated.shareToken}`,
        message: `Appraisal #${updated.appraisalNumber} certified. Customer notified.`,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to certify.", details: error.message });
    }
  });

  app.get("/api/appraisal/pending", isAuthenticated, async (req, res) => {
    try {
      const pending = await db.select().from(appraisals)
        .where(eq(appraisals.status, "pending"))
        .orderBy(appraisals.createdAt);
      res.json(pending);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const descGenLimiter = new Map<string, { count: number; resetAt: number }>();
  app.post("/api/appraisal/generate-description", (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = descGenLimiter.get(ip);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 10) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      entry.count++;
    } else {
      descGenLimiter.set(ip, { count: 1, resetAt: now + 3600000 });
    }
    next();
  }, async (req, res) => {
    try {
      const { images, itemCategory, specs } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "At least one photo is required to generate a description." });
      }

      if (images.length > 5) {
        return res.status(400).json({ error: "Maximum 5 images allowed." });
      }

      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      for (const img of images) {
        if (typeof img !== 'string') {
          return res.status(400).json({ error: "Invalid image format." });
        }
        const mimeMatch = img.match(/^data:(image\/[a-z]+);base64,/);
        if (!mimeMatch || !validMimeTypes.includes(mimeMatch[1])) {
          return res.status(400).json({ error: "Invalid image format. Supported: JPEG, PNG, GIF, WebP." });
        }
        const base64Only = img.replace(/^data:image\/[a-z]+;base64,/, '');
        const approxSize = (base64Only.length * 3) / 4;
        if (approxSize > 20 * 1024 * 1024) {
          return res.status(400).json({ error: "Image too large. Maximum 20MB per image." });
        }
      }

      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(503).json({ error: "Description generator is temporarily unavailable." });
      }

      const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      // Fallback baseline (April 2026) — ensures valuations never run against $0
      // when the live feed is unreachable. Updated in lockstep with the image
      // appraisal route above.
      const FALLBACK_BASELINE = { gold: 2340, silver: 31, platinum: 1000, palladium: 900 };
      let livePricing = { ...FALLBACK_BASELINE };
      let livePricingSource: 'live' | 'fallback' = 'fallback';
      try {
        const prices = await getKitcoPricing();
        if (prices && (prices.gold || prices.silver)) {
          livePricing = {
            gold: prices.gold || FALLBACK_BASELINE.gold,
            silver: prices.silver || FALLBACK_BASELINE.silver,
            platinum: prices.platinum || FALLBACK_BASELINE.platinum,
            palladium: prices.palladium || FALLBACK_BASELINE.palladium,
          };
          livePricingSource = 'live';
        }
      } catch (e) { /* fallback already set */ }

      const userSpecs = specs && typeof specs === 'object' ? specs : {};
      const specsLines: string[] = [];
      if (userSpecs.metalType) specsLines.push(`Metal Type: ${userSpecs.metalType}`);
      if (userSpecs.karat) specsLines.push(`Karat/Purity: ${userSpecs.karat}`);
      if (userSpecs.weight) specsLines.push(`Weight: ${userSpecs.weight} grams`);
      if (userSpecs.measurements) specsLines.push(`Measurements: ${userSpecs.measurements}`);
      if (userSpecs.stoneType) specsLines.push(`Stone Type: ${userSpecs.stoneType}`);
      if (userSpecs.stoneWeight) specsLines.push(`Stone Weight: ${userSpecs.stoneWeight} carats`);
      if (userSpecs.stoneColor) specsLines.push(`Stone Color: ${userSpecs.stoneColor}`);
      if (userSpecs.stoneClarity) specsLines.push(`Stone Clarity: ${userSpecs.stoneClarity}`);
      if (userSpecs.stoneCut) specsLines.push(`Stone Cut: ${userSpecs.stoneCut}`);
      if (userSpecs.stoneShape) specsLines.push(`Stone Shape: ${userSpecs.stoneShape}`);
      if (userSpecs.condition) specsLines.push(`Condition: ${userSpecs.condition}`);
      if (userSpecs.brandMaker) specsLines.push(`Brand/Maker: ${userSpecs.brandMaker}`);
      if (userSpecs.hallmarks) specsLines.push(`Hallmarks: ${userSpecs.hallmarks}`);
      if (itemCategory) specsLines.push(`Item Category: ${itemCategory}`);
      const specsText = specsLines.length > 0 ? `\n\nUSER-PROVIDED SPECIFICATIONS:\n${specsLines.join('\n')}` : '';

      const systemPrompt = `You are Simplicity, the AI appraisal engine powering Simpleton™ by LaDale Industries LLC. Your output is reviewed and certified by Demiris Brown, GIA Graduate Gemologist and Accredited Jewelry Professional. You are writing USPAP-influenced appraisal language for a formal document — this is not a chat reply, it is a professional deliverable.

═══════════════════════════════════════════════════
LIVE MARKET DATA (use these for all valuation math)
═══════════════════════════════════════════════════
Gold: $${livePricing.gold.toFixed(2)}/troy oz
Silver: $${livePricing.silver.toFixed(2)}/troy oz
Platinum: $${livePricing.platinum.toFixed(2)}/troy oz
Palladium: $${livePricing.palladium.toFixed(2)}/troy oz
Source: ${livePricingSource === 'live' ? 'Live Swissquote feed via Simpleton proprietary aggregator' : 'Simpleton baseline reference (live feed temporarily unavailable)'}
${specsText}

═══════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════
Analyze every photo carefully. Combine what you can see with the user-provided specs to produce a COMPLETE professional appraisal — the kind that would appear on an Instappraise or GIA lab-style deliverable. Your output feeds directly into a formal trifold appraisal document that the customer will use for insurance, estate, or resale purposes.

Do NOT produce a generic checklist. Produce a jeweler's-eye CATALOG DESCRIPTION followed by analytical sections, written in industry-standard language.

═══════════════════════════════════════════════════
PROFESSIONAL DESCRIPTION STYLE GUIDE
═══════════════════════════════════════════════════
The main description MUST read like an appraisal catalog entry. Open with the item-count convention "One (1) [gender] [metal/karat] [item type]," then flow into construction, mounting, stones, hallmarks, and condition. Use precise trade terminology.

STUDY THESE EXAMPLES — match this caliber of language:

EXAMPLE 1 — Diamond Solitaire Ring
"One (1) ladies' 14K (585) white gold diamond solitaire engagement ring. The cathedral-style mounting features a four-prong head supporting one (1) round brilliant cut diamond measuring approximately 6.45-6.48 x 4.00 mm, weight estimated at 1.00 carat. The center stone displays characteristics consistent with G-H color range and SI1-SI2 clarity (plotted off the stone; formal grading requires removal from mounting). The tapered shank measures 2.1 mm at the base rising to 4.3 mm at the head. Interior shank bears the hallmark '14K' and an illegible maker's mark. The mounting is cast, polished to a mirror finish with no visible porosity. Finger size 6.5. Total gross weight: 3.8 grams. Condition: Very Good — light surface wear commensurate with normal use, prongs tight and intact, no visible damage or repairs. No certification presented at time of examination."

EXAMPLE 2 — 14K Gold Cuban Link Chain
"One (1) 14K (585) yellow gold solid Cuban link chain. The chain measures 22 inches (55.9 cm) in length, 6.2 mm in width, with a lobster-claw clasp stamped '14K' and a figure-8 safety jump ring. Links are cast, diamond-cut on the faces for enhanced brilliance, and polished on the sides. Construction is verified solid (not hollow) based on weight-to-length ratio. Total weight: 42.3 grams. Clasp operates smoothly with positive spring tension. Condition: Excellent — minimal surface wear, no stretched or repaired links, all facets sharp and reflective. Melt value calculation: 42.3 g ÷ 31.1035 = 1.360 troy oz × 0.5833 (14K purity) × $${livePricing.gold.toFixed(2)}/oz = $${(42.3 / 31.1035 * 0.5833 * livePricing.gold).toFixed(2)} intrinsic metal value."

EXAMPLE 3 — Rolex Datejust 36
"One (1) gentleman's Rolex Datejust 36 wristwatch, reference 126234, stainless steel and 18K white gold case and bracelet. Case measures 36 mm in diameter with a fluted white gold bezel. Silver sunburst dial with applied white gold Roman numeral hour markers, white gold hands with Chromalight luminescent inserts, 3 o'clock date aperture with Cyclops lens. Powered by the caliber 3235 automatic movement (chronometer certified, 70-hour power reserve). Fitted to a stainless steel Jubilee bracelet with Oysterclasp and Easylink 5mm comfort extension. Serial number visible on rehaut at 6 o'clock position; reference number visible between lugs at 12 o'clock. Presented with original box and card (dated 2021). Condition: Very Good — light scratches to bracelet and case consistent with normal wear, dial and crystal unblemished, movement runs within chronometer tolerance. Current Simpleton secondary market data places this reference at $${(livePricing.gold * 3.7).toFixed(0)}-$${(livePricing.gold * 4.1).toFixed(0)} retail replacement range."

═══════════════════════════════════════════════════
VALUATION METHODOLOGY (SHOW YOUR MATH)
═══════════════════════════════════════════════════
For precious metal content:
  weight(g) ÷ 31.1035 = troy oz
  troy oz × purity factor × spot price = melt value
  Purity factors: 10K=0.4167 · 14K=0.5833 · 18K=0.750 · 22K=0.9167 · 24K=0.999
  Silver: 925 sterling=0.925 · coin 900=0.900 · fine=0.999
  Platinum 950=0.950 · Palladium 950=0.950

For diamonds/colored stones (without cert):
  State clearly that grading without lab examination is an estimate
  Reference Rapaport-style per-carat benchmarks only as an approximation
  Note that mounted stones cannot be accurately weighed — use mm measurements

Provide FOUR value tiers (industry standard):
  1. Melt / Intrinsic Value — raw material only, no labor or design premium
  2. Fair Market Value (range: low - high) — realistic private-party sale
  3. Retail Replacement Value — cost to purchase equivalent new at retail (highest)
  4. Estate / Liquidation Value — quick-sale wholesale tier (lowest)

═══════════════════════════════════════════════════
REQUIRED OUTPUT FORMAT — STRUCTURED JSON BLOCKS
═══════════════════════════════════════════════════
Return EXACTLY the following blocks in order. No other text outside the markers. No markdown symbols (no **, ##, backticks, dashes as bullets) inside any field.

---APPRAISAL_DESCRIPTION_START---
[The catalog-style professional description, 3-6 flowing paragraphs matching the EXAMPLES above. Open with "One (1) ..." and include identification, construction, measurements, stones, hallmarks, weight, condition, and a valuation sentence showing the math. This is the main deliverable and goes directly into the formal document. DO NOT use bullet lists.]
---APPRAISAL_DESCRIPTION_END---
---APPRAISAL_VALUE_START---
[Retail Replacement Value only, as a plain number with no commas or currency symbols, e.g. 2850.00 — if you genuinely cannot estimate, write 0]
---APPRAISAL_VALUE_END---
---APPRAISAL_SPECS_START---
{
  "metalType": "Yellow Gold",
  "karat": "14K (585)",
  "weight": "23.5",
  "measurements": "20 inches, 4mm wide",
  "stoneType": "Diamond",
  "stoneWeight": "1.50",
  "stoneColor": "G",
  "stoneClarity": "VS2",
  "stoneCut": "Excellent",
  "stoneShape": "Round",
  "condition": "Very Good",
  "brandMaker": "",
  "hallmarks": "14K, 585"
}
---APPRAISAL_SPECS_END---
---APPRAISAL_REPORT_START---
{
  "materialAnalysis": "One-paragraph analysis of metal type, purity verification from hallmarks, construction method (cast/handmade, solid/hollow), and notable workmanship observations.",
  "conditionGrade": "Poor | Fair | Good | Very Good | Excellent | Mint",
  "conditionNotes": "Specific observations about wear, damage, repairs, or restoration visible in the photos.",
  "meltValue": 1245.67,
  "fairMarketLow": 1800.00,
  "fairMarketHigh": 2400.00,
  "retailReplacement": 2850.00,
  "estateValue": 1400.00,
  "liquidationValue": 1100.00,
  "valuationMath": "Step-by-step calculation string showing weight conversion, purity factor, spot price multiplication, and stone contribution if applicable. Plain text, one paragraph.",
  "keyFactors": [
    "Factor 1 affecting value (e.g. solid construction, designer mounting, stone quality)",
    "Factor 2",
    "Factor 3"
  ],
  "sources": [
    "Live spot pricing: Simpleton proprietary aggregator",
    "Diamond pricing benchmark: Rapaport Diamond Report style per-carat reference",
    "Watch market data: Simpleton Rolex Market Intelligence Database"
  ],
  "recommendations": [
    "Specific action the owner should take (cleaning, certification, insurance, appraisal update schedule)",
    "Second recommendation"
  ],
  "certificationAdvice": "One sentence on whether this item warrants GIA/IGI/AGS lab certification and why."
}
---APPRAISAL_REPORT_END---

═══════════════════════════════════════════════════
JSON RULES
═══════════════════════════════════════════════════
- All numeric fields are numbers, not strings. No commas, no $ signs, no units.
- If a value tier genuinely cannot be determined, use 0 and explain in valuationMath.
- meltValue applies only to precious metal content; if the item has no metal value, use 0.
- keyFactors, sources, recommendations: arrays of strings, 2-5 items each.
- conditionGrade must be one of the six listed grades exactly.
- Preserve any user-provided spec values in APPRAISAL_SPECS exactly — only fill blanks.

═══════════════════════════════════════════════════
HONESTY PROTOCOL
═══════════════════════════════════════════════════
- If weight or karat is unknown AND cannot be determined visually, estimate against typical pieces of this type and EXPLICITLY label it as an estimate in the description.
- If the item has mounted stones, state clearly that accurate grading requires unmounting and lab examination.
- Do NOT invent certifications, serial numbers, or hallmarks. If you cannot read a stamp, say so.
- Do NOT inflate or deflate values. Stay within realistic market ranges.
- Always recommend in-person verification for insurance, estate, or legal use.`;

      // Compress images to fit Anthropic's 5 MB/image limit before sending.
      // Phone cameras routinely produce 7-15 MB shots; without this, the API
      // rejects them with "image exceeds 5 MB maximum."
      const imageContent: any[] = [];
      for (const img of images.slice(0, 5)) {
        const { base64, mediaType } = await compressImageForVision(img);
        imageContent.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType as any, data: base64 },
        });
      }

      imageContent.push({ type: 'text', text: 'Analyze these photos and generate a professional appraisal description.' });

      // Upgraded from claude-sonnet-4-20250514 to claude-sonnet-4-6 for
      // significantly better long-form professional writing and few-shot
      // calibration to the example descriptions in the system prompt.
      // <important_do_not_delete>
      const APPRAISAL_MODEL = 'claude-sonnet-4-6';
      // </important_do_not_delete>

      const startTime = Date.now();
      const response = await anthropicClient.messages.create({
        model: APPRAISAL_MODEL,
        max_tokens: 6000,
        temperature: 0.4,
        system: systemPrompt,
        messages: [{ role: 'user', content: imageContent }],
      });
      const processingTime = Date.now() - startTime;

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      const descMatch = responseText.match(/---APPRAISAL_DESCRIPTION_START---([\s\S]*?)---APPRAISAL_DESCRIPTION_END---/);
      const valueMatch = responseText.match(/---APPRAISAL_VALUE_START---([\s\S]*?)---APPRAISAL_VALUE_END---/);
      const specsMatch = responseText.match(/---APPRAISAL_SPECS_START---([\s\S]*?)---APPRAISAL_SPECS_END---/);
      const reportMatch = responseText.match(/---APPRAISAL_REPORT_START---([\s\S]*?)---APPRAISAL_REPORT_END---/);

      const description = descMatch ? descMatch[1].trim() : responseText;
      const estimatedValue = valueMatch ? valueMatch[1].trim() : '';

      let parsedSpecs: Record<string, string> = {};
      if (specsMatch) {
        try {
          const raw = JSON.parse(specsMatch[1].trim());
          for (const [k, v] of Object.entries(raw)) {
            if (typeof v === 'string' && v.trim()) {
              parsedSpecs[k] = v.trim();
            }
          }
        } catch { /* ignore parse errors */ }
      }

      // Parse the new structured report block. Non-fatal if missing —
      // description + estimatedValue remain the primary contract.
      let report: any = null;
      if (reportMatch) {
        try {
          report = JSON.parse(reportMatch[1].trim());
        } catch (e) {
          console.warn('⚠️ Could not parse APPRAISAL_REPORT JSON block:', e);
        }
      }

      console.log(`✅ Appraisal description generated in ${processingTime}ms (${APPRAISAL_MODEL}, specs: ${Object.keys(parsedSpecs).length} fields, report: ${report ? 'yes' : 'no'}, pricing: ${livePricingSource})`);

      res.json({
        success: true,
        description,
        estimatedValue,
        specs: parsedSpecs,
        report,
        livePricing,
        pricingSource: livePricingSource,
        processingTime,
      });
    } catch (error: any) {
      console.error('❌ Generate description error:', error);
      res.status(500).json({ error: 'Failed to generate description. Please try again.' });
    }
  });

  const appraisalChatLimiter = new Map<string, { count: number; resetAt: number }>();
  app.post("/api/appraisal/chat", (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = appraisalChatLimiter.get(ip);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 30) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      entry.count++;
    } else {
      appraisalChatLimiter.set(ip, { count: 1, resetAt: now + 3600000 });
    }
    next();
  }, async (req, res) => {
    try {
      const { message, history, itemCategory } = req.body;
      if (!message || typeof message !== 'string' || message.length > 5000) {
        return res.status(400).json({ error: 'Valid message is required (max 5000 chars)' });
      }

      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(503).json({ error: 'Appraisal assistant is temporarily unavailable. Please try again later.' });
      }

      const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const livePrices = await getKitcoPricing().catch(() => null);
      let priceContext = '';
      if (livePrices) {
        priceContext = `\n\nLIVE MARKET PRICES (use these for any valuation):
Gold: $${livePrices.gold.toFixed(2)}/oz | Silver: $${livePrices.silver.toFixed(2)}/oz | Platinum: $${livePrices.platinum.toFixed(2)}/oz | Palladium: $${livePrices.palladium.toFixed(2)}/oz`;
      }

      const systemPrompt = `You are Simplicity, the AI appraisal assistant for Simpleton. Your job is to help users build a professional jewelry appraisal document by gathering all necessary information through natural conversation.

Your goal: Collect enough information to write a complete, professional appraisal description. Then generate it.

WHAT YOU NEED TO COLLECT (ask naturally, never all at once):

For ALL items:
- Item type (ring, necklace, bracelet, earrings, pendant, watch, coin, loose stone, etc.)
- Metal type and purity (14K gold, sterling silver, platinum, etc.)
- Weight in grams (critical for metal valuation)
- Overall condition (excellent, very good, good, fair, poor)
- Any hallmarks or stamps visible

For jewelry with stones:
- Stone type (diamond, sapphire, ruby, emerald, etc.)
- Carat weight of stones
- For diamonds: clarity, color, cut grade
- Do they have a GIA/IGI/AGS certificate?

For watches:
- Brand and model
- Reference number (on caseback or between lugs)
- Serial number (if visible)
- Movement type (automatic, manual, quartz)
- Condition of dial, case, bracelet

For coins:
- Denomination
- Year and mint mark
- Grade or condition description

CLARIFICATION RULES:
- Never ask more than 2 questions at a time
- If they give you enough to proceed, proceed
- Once you have sufficient detail, generate the description
- Be conversational and warm, not like a form

WHEN YOU HAVE ENOUGH INFORMATION:
Generate a complete professional appraisal description. Format it exactly like this:

---APPRAISAL_DESCRIPTION_START---
[Your professional description here - formal, detailed, appraisal-grade language]
---APPRAISAL_DESCRIPTION_END---
---APPRAISAL_VALUE_START---
[Estimated retail value as a number only, e.g. 2850.00]
---APPRAISAL_VALUE_END---
---APPRAISAL_CATEGORY_START---
[Category: gold, diamond, watch, coin, or jewelry]
---APPRAISAL_CATEGORY_END---

After outputting the markers, add a conversational message explaining the appraisal.

The current item category selection is: ${itemCategory || 'not yet selected'}
${priceContext}

RESPONSE STYLE:
- Be warm and conversational
- No markdown symbols (no asterisks, no pound signs, no backticks)
- Show your math when calculating values
- All appraisals are for informational purposes only. Professional authentication is recommended for all transactions.`;

      const messages: { role: 'user' | 'assistant'; content: string }[] = [];
      if (history && Array.isArray(history)) {
        for (const h of history) {
          messages.push({ role: h.role, content: h.content });
        }
      }
      messages.push({ role: 'user', content: message });

      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages,
      });

      const content = response.content[0];
      const responseText = content.type === 'text' ? content.text : '';

      res.json({ response: responseText });
    } catch (error: any) {
      console.error('Appraisal chat error:', error);
      res.status(500).json({ error: 'Failed to process appraisal chat', details: error.message });
    }
  });

}
