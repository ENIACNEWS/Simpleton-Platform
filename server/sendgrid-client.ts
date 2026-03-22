import sgMail from '@sendgrid/mail';

const FROM_EMAIL = 'intel@simpletonapp.com';

async function getCredentials(): Promise<{ apiKey: string; email: string }> {
  // Primary: use the SENDGRID_API_KEY secret if it's a valid SG. key
  const envKey = process.env.SENDGRID_API_KEY;
  if (envKey && envKey.startsWith('SG.')) {
    return { apiKey: envKey, email: FROM_EMAIL };
  }

  throw new Error('SendGrid API key not configured. Set SENDGRID_API_KEY environment variable with a valid SG.* key.');
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}
