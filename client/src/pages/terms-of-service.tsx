import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";

export default function TermsOfService() {
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
              Terms of Service
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none dark:prose-invert">
            
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> By accessing or using <span className="text-blue-500 font-semibold">Simpleton™</span>, you agree to be bound by these Terms of Service. 
                If you do not agree, do not use our services.
              </AlertDescription>
            </Alert>

            <h2>1. Service Description</h2>
            <p><strong><span className="text-blue-500">Simpleton™</span></strong> provides:</p>
            <ul>
              <li>Precious metals pricing calculations and market data</li>
              <li>API access for precious metals, AI intelligence, and diamond market data</li>
              <li>Educational resources and professional tools</li>
              <li>Subscription-based premium features and API access</li>
            </ul>

            <h2>2. Eligibility and Account Registration</h2>
            <ul>
              <li>You must be at least 18 years old to use our service</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>One account per person or business entity</li>
              <li>We reserve the right to refuse service to anyone</li>
            </ul>

            <h2>3. API Usage Terms</h2>
            <h3>Rate Limits and Fair Use</h3>
            <ul>
              <li><strong>Free Tier:</strong> 10 requests per minute, 10,000 per month</li>
              <li><strong>Paid Tiers:</strong> As specified in your subscription plan</li>
              <li>Excessive usage may result in temporary or permanent API suspension</li>
              <li>Rate limits are enforced automatically and cannot be appealed</li>
            </ul>

            <h3>Prohibited API Uses</h3>
            <p>You may NOT use our APIs to:</p>
            <ul>
              <li>Compete directly with our services or create competing platforms</li>
              <li>Scrape, cache, or redistribute our data beyond your subscription limits</li>
              <li>Reverse engineer our pricing algorithms or proprietary calculations</li>
              <li>Attempt to bypass rate limits or security measures</li>
              <li>Use for illegal activities or violate export control laws</li>
              <li>Provide unlicensed financial advice or investment recommendations</li>
            </ul>

            <h2>4. Intellectual Property Rights</h2>
            <ul>
              <li><strong><span className="simpleton-brand">Simpleton</span>™</strong> and all related trademarks are our property</li>
              <li>Our proprietary algorithms, calculations, and user interface are protected by copyright and trade secrets</li>
              <li>You receive a limited, non-exclusive license to use our service for your internal business purposes</li>
              <li>No transfer or sublicensing of our intellectual property is permitted</li>
              <li>SCRAP batch processing, mathematical interpolation algorithms, and precision engines are proprietary technologies</li>
            </ul>

            <h2>5. Payment Terms</h2>
            <ul>
              <li>Subscription fees are billed monthly or annually in advance</li>
              <li>All payments are processed securely through Stripe</li>
              <li>No refunds for partial months or usage-based overages</li>
              <li>Price changes require 30 days advance notice</li>
              <li>Failed payments may result in immediate service suspension</li>
              <li>You are responsible for all taxes and fees</li>
            </ul>

            <h2>6. Disclaimers and Limitations</h2>
            
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Financial Disclaimer:</strong> Our service provides informational data only. 
                We do not provide investment advice, financial planning, or professional services.
              </AlertDescription>
            </Alert>

            <h3>No Financial or Investment Advice</h3>
            <ul>
              <li>All precious metals pricing and market data is for informational purposes only</li>
              <li>We are not licensed financial advisors, investment professionals, or commodity dealers</li>
              <li>Consult qualified professionals before making investment decisions</li>
              <li>Past performance does not guarantee future results</li>
              <li>We do not recommend buying or selling any precious metals or investments</li>
            </ul>

            <h3>Data Accuracy Disclaimer</h3>
            <ul>
              <li>We strive for accuracy but cannot guarantee real-time data precision</li>
              <li>Pricing data aggregated from multiple sources may contain delays or errors</li>
              <li>Always verify critical information with primary sources</li>
              <li>Market conditions can change rapidly affecting pricing accuracy</li>
            </ul>

            <h3>AI and Expert Council Disclaimer</h3>
            <ul>
              <li>AI "experts" are entertainment and educational tools only</li>
              <li>No AI responses constitute professional advice in any field</li>
              <li>Always consult licensed professionals for important decisions</li>
              <li>AI responses may be inaccurate or incomplete</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
            <ul>
              <li>Our total liability is limited to the amount you paid in the past 12 months</li>
              <li>We are not liable for indirect, consequential, or incidental damages</li>
              <li>We are not liable for trading losses, investment decisions, or business losses</li>
              <li>We are not liable for third-party data accuracy or availability</li>
              <li>Service interruptions, API downtime, or data errors are not compensable</li>
            </ul>

            <h2>8. Indemnification</h2>
            <p>You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:</p>
            <ul>
              <li>Your use of our service in violation of these terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any investment or business decisions based on our data</li>
              <li>Your failure to comply with applicable laws</li>
            </ul>

            <h2>9. Export Controls and International Use</h2>
            <ul>
              <li>Our service may be subject to U.S. export control laws</li>
              <li>You represent that you are not located in a sanctioned country</li>
              <li>You will not provide access to sanctioned individuals or entities</li>
              <li>Compliance with local laws is your responsibility</li>
            </ul>

            <h2>10. Service Modifications and Termination</h2>
            <ul>
              <li>We may modify, suspend, or discontinue features at any time</li>
              <li>We may terminate accounts for terms violations</li>
              <li>You may cancel your subscription at any time</li>
              <li>Data export must be completed before cancellation</li>
              <li>These terms survive account termination where applicable</li>
            </ul>

            <h2>11. Privacy and Data Protection</h2>
            <ul>
              <li>Your privacy is governed by our Privacy Policy</li>
              <li>We collect and process data as described in our Privacy Policy</li>
              <li>You consent to data processing for service provision</li>
              <li>GDPR and CCPA rights are detailed in our Privacy Policy</li>
            </ul>

            <h2>12. Governing Law and Disputes</h2>
            <ul>
              <li><strong>Governing Law:</strong> Michigan state laws govern these terms</li>
              <li><strong>Jurisdiction:</strong> Disputes resolved in Michigan courts</li>
              <li><strong>Arbitration:</strong> Business disputes may require binding arbitration</li>
              <li><strong>Class Action Waiver:</strong> No class action lawsuits permitted</li>
            </ul>

            <h2>13. Contact Information</h2>
            <p>For legal notices or terms-related questions:</p>
            <ul>
              <li><strong>Email:</strong> intel@simpletonapp.com</li>
            </ul>

            <h2>14. Changes to Terms</h2>
            <p>We may update these terms at any time. Material changes will be communicated via:</p>
            <ul>
              <li>Email notification to account holders</li>
              <li>Platform notification upon login</li>
              <li>30-day advance notice for changes affecting rights or obligations</li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
              <p className="text-blue-800 dark:text-blue-200 font-semibold">
                <strong>Acknowledgment:</strong> These Terms of Service protect both users and <span className="simpleton-brand">Simpleton</span>™. 
                They establish clear boundaries for API usage, limit our liability appropriately, and ensure 
                compliance with applicable laws. Contact us at intel@simpletonapp.com with any questions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}