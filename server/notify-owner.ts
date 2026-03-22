import { getUncachableSendGridClient } from './sendgrid-client';

const OWNER_EMAIL = 'intel@simpletonapp.com';
const BACKUP_EMAIL = 'djfade16@gmail.com';
const OWNER_NAME  = 'Simpleton Vision™ INTEL';

interface OwnerNotification {
  subject: string;
  body: string;
  replyTo?: string;
}

async function getGmailAccessToken(): Promise<string | null> {
  try {
    // Use standard Google OAuth2 refresh token flow
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) return null;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function sendViaGmail(to: string[], subject: string, body: string, replyTo?: string): Promise<void> {
  const accessToken = await getGmailAccessToken();
  if (!accessToken) throw new Error('Gmail access token not available');

  for (const recipient of to) {
    const headers = [
      `To: ${recipient}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
    ];
    if (replyTo) headers.push(`Reply-To: ${replyTo}`);

    const rawMessage = headers.join('\r\n') + '\r\n\r\n' + body;
    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });
    if (!sendRes.ok) {
      const err = await sendRes.text();
      throw new Error(`Gmail send failed (${sendRes.status}): ${err}`);
    }
  }

  console.log(`✅ Gmail sent: "${subject}" → ${to.join(', ')}`);
}

async function sendHtmlViaGmail(to: string[], subject: string, html: string, replyTo?: string): Promise<void> {
  const accessToken = await getGmailAccessToken();
  if (!accessToken) throw new Error('Gmail access token not available');

  for (const recipient of to) {
    const safeSubject = subject.replace(/[\r\n]/g, '');
    const safeRecipient = recipient.replace(/[\r\n]/g, '');
    const headers = [
      `To: ${safeRecipient}`,
      `Subject: ${safeSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
    ];
    if (replyTo) headers.push(`Reply-To: ${replyTo.replace(/[\r\n]/g, '')}`);

    const rawMessage = headers.join('\r\n') + '\r\n\r\n' + html;
    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });
    if (!sendRes.ok) {
      const err = await sendRes.text();
      throw new Error(`Gmail HTML send failed (${sendRes.status}): ${err}`);
    }
  }

  console.log(`✅ Gmail HTML sent: "${subject}" → ${to.join(', ')}`);
}

export async function notifyOwner({ subject, body, replyTo }: OwnerNotification): Promise<void> {
  const recipients = [OWNER_EMAIL, BACKUP_EMAIL];
  const fullSubject = `[Simpleton™] ${subject}`;

  let sendGridSent = false;
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const msg: any = {
      to: recipients,
      from: { email: fromEmail, name: 'Simpleton Vision™ Alerts' },
      subject: fullSubject,
      text: body,
    };
    if (replyTo) msg.replyTo = replyTo;
    await client.send(msg);
    sendGridSent = true;
    console.log(`✅ SendGrid sent: "${subject}" → ${OWNER_EMAIL}`);
  } catch (err: any) {
    console.error(`⚠️ SendGrid failed: ${err?.message || err}`);
  }

  try {
    await sendViaGmail(recipients, fullSubject, body, replyTo);
  } catch (err: any) {
    console.error(`⚠️ Gmail fallback failed: ${err?.message || err}`);
  }

  if (!sendGridSent) {
    console.log(`📧 Notification logged (email delivery attempted via Gmail): "${subject}"`);
  }
}

interface HtmlNotification {
  subject: string;
  html: string;
  replyTo?: string;
}

export async function notifyOwnerHtml({ subject, html, replyTo }: HtmlNotification): Promise<void> {
  const recipients = [OWNER_EMAIL, BACKUP_EMAIL];
  const fullSubject = `[Simpleton] ${subject}`;

  let sendGridSent = false;
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const msg: any = {
      to: recipients,
      from: { email: fromEmail, name: 'Simpleton Alerts' },
      subject: fullSubject,
      html,
    };
    if (replyTo) msg.replyTo = replyTo;
    await client.send(msg);
    sendGridSent = true;
    console.log(`✅ SendGrid HTML sent: "${subject}" → ${OWNER_EMAIL}`);
  } catch (err: any) {
    console.error(`⚠️ SendGrid HTML failed: ${err?.message || err}`);
  }

  try {
    await sendHtmlViaGmail(recipients, fullSubject, html, replyTo);
  } catch (err: any) {
    console.error(`⚠️ Gmail HTML fallback failed: ${err?.message || err}`);
  }

  if (!sendGridSent) {
    console.log(`📧 HTML notification logged (email delivery attempted via Gmail): "${subject}"`);
  }
}

export function newUserEmailBody(email: string, firstName?: string | null, lastName?: string | null, provider?: string): string {
  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Not provided';
  return `
NEW USER REGISTERED — Simpleton Vision™
========================================

Email:    ${email}
Name:     ${name}
Provider: ${provider || 'email/password'}
Date:     ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

— Simpleton Vision™ Auto-Alert
  `;
}

export function newSubscriptionEmailBody(email: string, plan: string, amount?: string): string {
  return `
NEW SUBSCRIPTION — Simpleton Vision™
======================================

User Email: ${email}
Plan:       ${plan}
Amount:     ${amount || 'N/A'}
Date:       ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

— Simpleton Vision™ Auto-Alert
  `;
}

export function appraisalSubmissionEmailBody(
  customerName: string,
  customerEmail: string,
  appraisalType: string,
  appraisalNumber: string,
  itemDescription: string,
  retailValue: string,
  aiAssessment: string,
  hasImages: boolean,
  imageCount: number,
  zoomRequested: boolean,
  itemCategory?: string
): string {
  const categoryNote = itemCategory === 'diamond'
    ? '\n⚠️ DIAMOND ITEM — In-person evaluation required for accurate 4C grading unless GIA/IGI cert is provided.\n'
    : itemCategory === 'gold'
    ? '\n✅ GOLD-ONLY ITEM — Remote appraisal possible if weight, karat, and clear photos are provided.\n'
    : '';

  return `
NEW APPRAISAL SUBMISSION — Simpleton™
================================================
${categoryNote}
CUSTOMER INFORMATION:
  Name:  ${customerName || 'Not provided'}
  Email: ${customerEmail || 'Not provided'}

APPRAISAL DETAILS:
  Type:     ${appraisalType}
  Number:   ${appraisalNumber}
  Category: ${itemCategory || 'General'}
  Photos:   ${hasImages ? `${imageCount} photo(s) attached` : 'No photos provided'}
  Zoom Consultation Requested: ${zoomRequested ? 'YES — Please schedule a Zoom call with this customer' : 'No'}

STATED RETAIL VALUE: ${retailValue || 'Not provided'}

ITEM DESCRIPTION:
${itemDescription || 'No description provided'}

AI PRELIMINARY ASSESSMENT:
${aiAssessment || 'No AI assessment generated'}

---
Action Required: Review this submission and respond to the customer within 24-48 hours.
If approved, send certified appraisal document to customer at: ${customerEmail || 'email not provided'}
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

— Simpleton™ Appraisal System
  `;
}

export function feedbackEmailBody(name: string, email: string, category: string, rating: string | undefined, subject: string | undefined, message: string): string {
  return `
NEW FEEDBACK — Simpleton™
===================================

From:     ${name} <${email}>
Category: ${category}
Rating:   ${rating ? `${rating} stars` : 'Not provided'}
Subject:  ${subject || 'No subject'}

MESSAGE:
${message}

---
Sent: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
Reply directly to: ${email}
  `;
}
