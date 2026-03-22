// Gmail integration via Google OAuth2 (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.modify',
];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || getDefaultRedirectUri();
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getDefaultRedirectUri() {
  const domain = process.env.APP_DOMAIN;
  if (domain) return `${domain}/api/gmail/callback`;
  return process.env.NODE_ENV === 'production'
    ? 'https://simpletonapp.com/api/gmail/callback'
    : 'http://localhost:5000/api/gmail/callback';
}

export function getAuthUrl(userId: number) {
  const oauth2Client = getOAuth2Client();
  // Encode userId in state so we can recover it on callback without session
  const state = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString('base64');
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
}

export function parseStateUserId(state: string): number | null {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    return decoded.userId ?? null;
  } catch {
    return null;
  }
}

// WARNING: Never cache this client. Tokens expire.
export async function getUncachableGmailClient(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  // Force token refresh to get a valid access token
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);
  return google.gmail({ version: 'v1', auth: oauth2Client });
}
