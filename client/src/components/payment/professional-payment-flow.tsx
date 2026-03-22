import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CreditCard, 
  Zap, 
  Crown, 
  Star, 
  Check, 
  Shield, 
  Lock, 
  ChevronRight, 
  Apple, 
  Smartphone,
  ArrowLeft 
} from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";

// Payment steps for better UX
type PaymentStep = 'plan' | 'method' | 'details' | 'processing' | 'success';
type PaymentMethod = 'card' | 'apple' | 'google';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  stripeId: string;
  description: string;
  tier: string;
  apiRequests: number;
  rateLimit: string;
  popular?: boolean;
  features: string[];
}

interface ProfessionalPaymentFlowProps {
  tier: SubscriptionTier;
  onSuccess: () => void;
  onBack: () => void;
}

// Security Badges Component
const SecurityBadges = () => (
  <div className="flex items-center justify-center space-x-6 py-6 border-t border-gray-700/50 mt-8 bg-gray-900/30">
    <div className="flex items-center space-x-2 text-green-400">
      <Shield className="h-5 w-5" />
      <div className="text-center">
        <p className="text-xs font-medium">256-bit SSL</p>
        <p className="text-xs text-gray-500">Encryption</p>
      </div>
    </div>
    <div className="flex items-center space-x-2 text-green-400">
      <Lock className="h-5 w-5" />
      <div className="text-center">
        <p className="text-xs font-medium">PCI DSS</p>
        <p className="text-xs text-gray-500">Compliant</p>
      </div>
    </div>
    <div className="flex items-center space-x-2 text-green-400">
      <CreditCard className="h-5 w-5" />
      <div className="text-center">
        <p className="text-xs font-medium">Secure</p>
        <p className="text-xs text-gray-500">Payment</p>
      </div>
    </div>
  </div>
);

// Professional multi-step payment component
export const ProfessionalPaymentFlow: React.FC<ProfessionalPaymentFlowProps> = ({ 
  tier, 
  onSuccess, 
  onBack 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 'method', title: 'Payment Method', completed: currentStep !== 'method' },
    { id: 'details', title: 'Payment Details', completed: false },
    { id: 'processing', title: 'Processing', completed: false },
    { id: 'success', title: 'Complete', completed: false }
  ];

  const getCurrentStepIndex = () => {
    switch (currentStep) {
      case 'method': return 0;
      case 'details': return 1;
      case 'processing': return 2;
      case 'success': return 3;
      default: return 0;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/subscription/create-payment-intent", {
        tierId: tier.id,
        priceId: tier.stripeId,
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        setCurrentStep('details');
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        setCurrentStep('success');
        setTimeout(() => {
          toast({
            title: "Subscription Successful",
            description: `Welcome to ${tier.name}!`,
          });
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      setCurrentStep('details');
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'silver': return <Star className="h-5 w-5" />;
      case 'gold': return <Zap className="h-5 w-5" />;
      case 'platinum': return <Crown className="h-5 w-5" />;
      case 'diamond': return <Crown className="h-5 w-5" />;
      default: return <Crown className="h-5 w-5" />;
    }
  };

  const getTierGradient = (tierId: string) => {
    switch (tierId) {
      case 'silver': return 'from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700';
      case 'gold': return 'from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600';
      case 'platinum': return 'from-slate-400 to-slate-600 hover:from-slate-500 hover:to-slate-700';
      case 'diamond': return 'from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700';
      default: return 'from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600';
    }
  };

  // Professional Progress Indicator
  const ProgressIndicator = () => (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
              ${index <= getCurrentStepIndex() 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-400 border-2 border-gray-600'
              }
            `}>
              {index < getCurrentStepIndex() ? (
                <Check className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                h-1 w-20 mx-3 lg:w-32 rounded-full transition-colors duration-300
                ${index < getCurrentStepIndex() ? 'bg-yellow-500' : 'bg-gray-700'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-white">{steps[getCurrentStepIndex()]?.title}</p>
        <p className="text-sm text-gray-400 mt-1">Step {getCurrentStepIndex() + 1} of {steps.length}</p>
      </div>
    </div>
  );

  // Payment Method Selection
  const PaymentMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Payment Method</h2>
        <p className="text-gray-400">Select your preferred payment option</p>
      </div>
      
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setSelectedMethod('card');
            setCurrentStep('details');
          }}
          className="w-full p-6 border border-gray-600 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 text-left flex items-center justify-between group transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Credit or Debit Card</p>
              <p className="text-sm text-gray-400">Visa, Mastercard, American Express, Discover</p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
        </button>
        
        <button
          type="button"
          disabled
          className="w-full p-6 border border-gray-700 rounded-xl bg-gray-800/30 text-left flex items-center justify-between opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Apple className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Apple Pay</p>
              <p className="text-sm text-gray-400">Coming Soon - Fast & Secure</p>
            </div>
          </div>
          <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
            Soon
          </div>
        </button>
        
        <button
          type="button"
          disabled
          className="w-full p-6 border border-gray-700 rounded-xl bg-gray-800/30 text-left flex items-center justify-between opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Google Pay</p>
              <p className="text-sm text-gray-400">Coming Soon - One-Touch Payment</p>
            </div>
          </div>
          <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
            Soon
          </div>
        </button>
      </div>
    </div>
  );

  // Payment Details Form
  const PaymentDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
        <p className="text-gray-400">Enter your card information securely</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-xl p-6">
          <label className="block text-sm font-semibold text-gray-300 mb-4">
            Card Information
          </label>
          <div className="bg-white/5 border border-gray-500 rounded-lg p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '18px',
                    color: '#ffffff',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontWeight: '500',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50/10 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-300 mb-1">Your payment is secure</p>
              <p className="text-xs text-blue-400 leading-relaxed">
                We use industry-standard 256-bit SSL encryption and PCI DSS compliance to protect your payment information. Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep('method')}
            className="flex-1 h-12 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing}
            className={`flex-1 h-12 bg-gradient-to-r ${getTierGradient(tier.id)} hover:scale-105 transition-all duration-200 font-semibold text-lg shadow-lg`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {getTierIcon(tier.id)}
                <span className="ml-2">Pay ${tier.price}/month</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
          <p className="text-gray-400">Complete your subscription to {tier.name}</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            <ProgressIndicator />
            
            {/* Plan Summary */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getTierGradient(tier.id)} flex items-center justify-center`}>
                    {getTierIcon(tier.id)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xl">{tier.name}</p>
                    <p className="text-sm text-gray-400">{tier.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">${tier.price}</p>
                  <p className="text-sm text-gray-400">per month</p>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 'method' && <PaymentMethodSelection />}
            {currentStep === 'details' && <PaymentDetailsForm />}
            {currentStep === 'processing' && (
              <div className="text-center py-16">
                <Loader2 className="h-16 w-16 animate-spin text-yellow-500 mx-auto mb-6" />
                <p className="text-2xl font-semibold text-white mb-2">Processing Payment...</p>
                <p className="text-gray-400">Please don't close this window</p>
              </div>
            )}
            {currentStep === 'success' && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <p className="text-2xl font-semibold text-white mb-2">Payment Successful!</p>
                <p className="text-gray-400">Welcome to {tier.name}</p>
              </div>
            )}

            <SecurityBadges />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};