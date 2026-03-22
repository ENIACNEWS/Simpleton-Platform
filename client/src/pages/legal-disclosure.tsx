import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, Mail, ArrowLeft, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function LegalDisclosure() {
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
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Building className="w-10 h-10" />
              Legal Disclosure & Business Information
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Required business entity and regulatory disclosures
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none dark:prose-invert">
            
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Building className="h-4 w-4" />
              <AlertDescription>
                <strong>Business Entity:</strong> The following information is provided to comply with 
                corporate disclosure requirements and consumer protection laws.
              </AlertDescription>
            </Alert>

            <h2>Business Entity Information</h2>
            <div className="flex justify-center not-prose">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center justify-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Details
                </h3>
                <div className="space-y-3 text-sm text-center">
                  <div>
                    <strong>Legal Name:</strong> Simpleton Technologies
                  </div>
                  <div>
                    <strong>DBA:</strong> <span className="text-blue-500 font-semibold">Simpletonâ¢</span>
                  </div>
                  <div>
                    <strong>State of Formation:</strong> Michigan
                  </div>
                  <div>
                    <strong>EIN:</strong> 85-0621969
                  </div>
                  <div>
                    <strong>LLC Registration:</strong> Active and in good standing
                  </div>
                </div>
              </div>
            </div>

            <h2>Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 not-prose">
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
                <Mail className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                <div className="font-semibold text-purple-800 dark:text-purple-200">Business Email</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">intel@simpletonapp.com</div>
              </div>
            </div>

            <h2>Regulatory Disclosures</h2>
            
            <h3>Financial Services Disclaimer</h3>
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <AlertDescription>
                <strong>Important:</strong> <span className="simpleton-brand">Simpleton</span>â¢ is NOT a registered investment advisor, broker-dealer, 
                or financial institution. We provide informational data only, not financial advice.
              </AlertDescription>
            </Alert>
            
            <ul>
              <li>We are <strong>NOT</strong> licensed by the SEC, CFTC, or any financial regulatory body</li>
              <li>We do <strong>NOT</strong> provide investment advice or recommendations</li>
              <li>We do <strong>NOT</strong> sell, buy, or broker precious metals transactions</li>
              <li>All pricing data is for informational purposes only</li>
              <li>Past performance does not guarantee future results</li>
            </ul>

            <h3>Technology & Data Services</h3>
            <ul>
              <li><strong>Service Type:</strong> Software-as-a-Service (SaaS) platform</li>
              <li><strong>Primary Business:</strong> Data aggregation and calculation tools</li>
              <li><strong>Industry Classification:</strong> NAICS 541511 (Custom Computer Programming Services)</li>
              <li><strong>Target Market:</strong> Precious metals professionals, educators, and enthusiasts</li>
            </ul>

            <h2>Intellectual Property Rights</h2>
            
            <h3>Trademarks</h3>
            <ul>
              <li><strong><span className="simpleton-brand">Simpleton</span>â¢</strong> - Trademark pending registration (USPTO Application pending)</li>
              <li><strong>Precious Metals, Simplifiedâ¢</strong> - Trademark pending registration</li>
              <li>All logos, designs, and brand elements are proprietary</li>
            </ul>

            <h3>Proprietary Technologies</h3>
            <ul>
              <li><strong>SCRAP Batch Processing System</strong> - Patent pending</li>
              <li><strong>Mathematical Price Interpolation Algorithms</strong> - Trade secret</li>
              <li><strong>Mathematical Precision Engine</strong> - Proprietary technology</li>
              <li><strong>Simplicity-Powered Visual Recognition System</strong> - Patent pending</li>
              <li><strong>Multi-source Data Aggregation Framework</strong> - Trade secret</li>
            </ul>

            <h2>Consumer Protection Notices</h2>
            
            <h3>Pricing and Billing</h3>
            <ul>
              <li>All subscription prices clearly displayed</li>
              <li>No hidden fees or automatic renewals without disclosure</li>
              <li>Payment processing handled by Stripe (PCI DSS compliant)</li>
              <li>Refund policy available in Terms of Service</li>
              <li>Price changes require 30-day advance notice</li>
            </ul>

            <h3>Data Accuracy and Limitations</h3>
            <ul>
              <li>Data sourced from multiple third-party providers</li>
              <li>Real-time accuracy not guaranteed</li>
              <li>Market conditions may affect data freshness</li>
              <li>Users should verify critical information independently</li>
              <li>No warranty of merchantability or fitness for specific purposes</li>
            </ul>

            <h3>AI Analysis and Authentication Disclaimer</h3>
            <ul>
              <li>All AI-generated analysis, valuations, and assessments are for <strong>informational and educational purposes only</strong></li>
              <li>AI image analysis provides preliminary observations and should <strong>not</strong> be considered professional authentication</li>
              <li>AI outputs are <strong>not a substitute</strong> for professional appraisal, authentication, or certification by qualified experts</li>
              <li>Professional authentication by certified specialists is recommended for all high-value transactions</li>
              <li>Simpleton Technologies assumes no liability for decisions made based on AI-generated assessments</li>
            </ul>

            <h2>Export Control & International Compliance</h2>
            <ul>
              <li><strong>OFAC Compliance:</strong> Service restricted from sanctioned countries</li>
              <li><strong>Export Administration Regulations (EAR):</strong> Software may be subject to U.S. export controls</li>
              <li><strong>International Traffic in Arms Regulations (ITAR):</strong> Not applicable to our services</li>
              <li><strong>Geographic Restrictions:</strong> Service availability may vary by jurisdiction</li>
            </ul>



            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 mt-8">
              <h3 className="text-red-800 dark:text-red-200 font-bold text-lg mb-3">
                Required Legal Notice
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                This disclosure is provided to comply with applicable business registration, 
                consumer protection, and regulatory requirements. The information contained herein 
                is current as of the last updated date and may be subject to change. 
                For the most current information, contact us directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
