import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-950 dark:to-purple-950 p-4">
      <div className="container mx-auto max-w-5xl py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <Card className="bg-white dark:bg-gray-900 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none dark:prose-invert">
            
            <h2>1. Information We Collect</h2>
            <h3>Personal Information</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, profile information when you create an account</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store card details)</li>
              <li><strong>Usage Data:</strong> API usage statistics, feature usage, calculation history for service improvement</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies for functionality</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>Website usage analytics and performance metrics</li>
              <li>API request logs for security and rate limiting</li>
              <li>Error logs for service improvement</li>
              <li>Security monitoring data for fraud prevention</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li><strong>Service Provision:</strong> Provide precious metals calculations, API access, and platform features</li>
              <li><strong>Account Management:</strong> Manage subscriptions, billing, and customer support</li>
              <li><strong>Security:</strong> Prevent fraud, abuse, and unauthorized access to our APIs</li>
              <li><strong>Improvement:</strong> Analyze usage patterns to improve our services</li>
              <li><strong>Communication:</strong> Send service updates, security alerts, and subscription information</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do <strong>NOT</strong> sell your personal information. We may share data only in these limited circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> Trusted third parties (Stripe for payments, hosting providers) under strict confidentiality</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our legal rights</li>
              <li><strong>Business Transfer:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for other purposes</li>
            </ul>

            <h2>4. Data Retention</h2>
            <ul>
              <li><strong>Account Data:</strong> Retained while your account is active and for 2 years after deactivation</li>
              <li><strong>API Logs:</strong> Retained for 90 days for security and debugging purposes</li>
              <li><strong>Financial Records:</strong> Retained for 7 years as required by tax and accounting laws</li>
              <li><strong>Marketing Data:</strong> Retained until you opt out or for 3 years of inactivity</li>
            </ul>

            <h2>5. Your Rights (GDPR/CCPA)</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>
            <p>To exercise these rights, contact us at: <strong>intel@simpletonapp.com</strong></p>

            <h2>6. Cookies and Tracking</h2>
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Essential:</strong> Authentication, security, and core functionality</li>
              <li><strong>Analytics:</strong> Understanding user behavior and improving our service</li>
              <li><strong>Preferences:</strong> Remembering your settings and preferences</li>
            </ul>
            <p>You can control cookies through your browser settings, but some features may not work properly if disabled.</p>

            <h2>7. Data Security</h2>
            <ul>
              <li>All data transmitted using TLS encryption</li>
              <li>API access protected by authentication and rate limiting</li>
              <li>Regular security audits and monitoring</li>
              <li>Employee access limited on need-to-know basis</li>
              <li>Incident response procedures for any security breaches</li>
            </ul>

            <h2>8. International Transfers</h2>
            <p>Your data may be processed in countries other than your country of residence. We ensure adequate protection through:</p>
            <ul>
              <li>Standard Contractual Clauses for EU data transfers</li>
              <li>Adequacy decisions for approved countries</li>
              <li>Other appropriate safeguards as required by law</li>
            </ul>

            <h2>9. Children's Privacy</h2>
            <p>Our service is not intended for users under 18. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will delete the information immediately.</p>

            <h2>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy to reflect changes in our practices or applicable laws. We will notify you of material changes via email or platform notification.</p>

            <h2>11. Contact Information</h2>
            <p>For privacy-related questions or requests:</p>
            <ul>
              <li><strong>Email:</strong> intel@simpletonapp.com</li>
            </ul>

            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-8">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                <strong>Important Notice:</strong> This privacy policy is compliant with GDPR, CCPA, and other major privacy regulations. 
                By using our service, you acknowledge that you have read and understood this policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}