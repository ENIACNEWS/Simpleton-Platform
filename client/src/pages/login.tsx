import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Shield, Gem, TrendingUp, Sparkles, Crown, Eye, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

const simplicityGreetings = [
  "Welcome to Simpleton\u2122 \u2014 precision pricing, simplified.",
  "I'm Simplicity, your Simplicity-powered expert in precious metals, diamonds, and luxury watches.",
  "Create an account to unlock personalized appraisals, real-time market data, and your own portfolio tracker.",
  "I remember every conversation. The more we talk, the better I get at helping you.",
];

function TypingText({ text, speed = 30, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />}
    </span>
  );
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, register, isLoggingIn, isRegistering, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGreetingComplete = () => {
    setTimeout(() => {
      if (greetingIndex < simplicityGreetings.length - 1) {
        setGreetingIndex(prev => prev + 1);
      } else {
        setShowFeatures(true);
      }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signin") {
        await login({ email, password });
      } else {
        await register({ email, password, firstName: firstName || undefined, lastName: lastName || undefined });
      }
    } catch (err: any) {
      const msg = err?.message || "";
      try {
        const parsed = JSON.parse(msg.replace(/^\d+:\s*/, ""));
        setError(parsed.message || "Something went wrong");
      } catch {
        setError(msg || "Something went wrong. Please try again.");
      }
    }
  };

  const features = [
    { icon: TrendingUp, title: "Live Market Data", desc: "Real-time precious metals pricing from 35+ sources" },
    { icon: Gem, title: "AI Diamond Pricing", desc: "AI-powered valuations with market intelligence" },
    { icon: Crown, title: "Rolex Intelligence", desc: "AI reference system with comprehensive database" },
    { icon: Eye, title: "Photo Appraisals", desc: "Snap a photo for AI-assisted preliminary valuation" },
  ];

  const isLoading = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      <div
        className={`relative lg:w-1/2 min-h-[30vh] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 transition-all duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a1035 25%, #0d1b2a 50%, #162447 75%, #1a1035 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9a227 0%, transparent 70%)' }} />
          <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #c0c0c0 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <div className="flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a227 0%, #f0d060 50%, #c9a227 100%)' }}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: '#c9a227' }}>Simpleton&#8482;</h1>
                <p className="text-xs sm:text-sm" style={{ color: '#8b8b8b' }}>Precision Pricing, Simplified</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-6 lg:py-0">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-sm p-4 sm:p-5" style={{ background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#e2d5f0' }}>
                <TypingText
                  key={greetingIndex}
                  text={simplicityGreetings[greetingIndex]}
                  speed={25}
                  onComplete={handleGreetingComplete}
                />
              </p>
            </div>
          </div>

          {showFeatures && (
            <div className="grid grid-cols-2 gap-3 mt-4 animate-in fade-in duration-700">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <f.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-2" style={{ color: '#c9a227' }} />
                  <p className="text-xs sm:text-sm font-semibold text-white mb-0.5">{f.title}</p>
                  <p className="text-[10px] sm:text-xs" style={{ color: '#8b8b8b' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
          <p className="text-xs" style={{ color: '#6b7280' }}>Enterprise-grade security &bull; 256-bit encryption</p>
        </div>
      </div>

      <div
        className={`lg:w-1/2 min-h-[70vh] lg:min-h-screen flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 transition-all duration-1000 delay-300 ${fadeIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
        style={{ background: 'linear-gradient(180deg, #faf9f7 0%, #f5f0e8 50%, #ede5d5 100%)' }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(201, 162, 39, 0.1)', border: '1px solid rgba(201, 162, 39, 0.2)' }}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: '#8b6914' }}>Markets Open &bull; Live Data Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1a1035' }}>
              {mode === "signin" ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              {mode === "signin"
                ? "Sign in to access your dashboard and AI assistant"
                : "Join thousands using Simplicity-powered market intelligence"}
            </p>
          </div>

          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === "signin" ? "bg-white shadow-sm" : ""}`}
              style={{ color: mode === "signin" ? "#1a1035" : "#9ca3af" }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === "signup" ? "bg-white shadow-sm" : ""}`}
              style={{ color: mode === "signup" ? "#1a1035" : "#9ca3af" }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium" style={{ color: '#4b5563' }}>First Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First"
                      className="pl-9 h-11 rounded-lg border-gray-200 bg-white focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs font-medium" style={{ color: '#4b5563' }}>Last Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last"
                      className="pl-9 h-11 rounded-lg border-gray-200 bg-white focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-xs font-medium" style={{ color: '#4b5563' }}>Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-9 h-11 rounded-lg border-gray-200 bg-white focus:border-amber-400 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-medium" style={{ color: '#4b5563' }}>Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  className="pl-9 h-11 rounded-lg border-gray-200 bg-white focus:border-amber-400 focus:ring-amber-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #c9a227 0%, #dbb83a 50%, #c9a227 100%)',
                color: '#1a1035',
                border: 'none',
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.12)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4" style={{ color: '#7c3aed' }} />
              <span className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Simplicity AI Assistant</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
              Your personal AI assistant is ready. Get photo-based assessments, real-time pricing, diamond valuations, and Rolex reference data.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold" style={{ color: '#c9a227' }}>35+</p>
              <p className="text-[10px]" style={{ color: '#9ca3af' }}>Data Sources</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#c9a227' }}>&lt;50ms</p>
              <p className="text-[10px]" style={{ color: '#9ca3af' }}>Latency</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#c9a227' }}>24/7</p>
              <p className="text-[10px]" style={{ color: '#9ca3af' }}>AI Available</p>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#9ca3af' }}>
              <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <span>&bull;</span>
              <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy</Link>
              <span>&bull;</span>
              <Link href="/legal-disclosure" className="hover:text-gray-700 transition-colors">Legal</Link>
            </div>
            <p className="text-[10px]" style={{ color: '#c4c4c4' }}>
              &copy; {new Date().getFullYear()} <span className="simpleton-brand">Simpleton</span>&#8482; &bull; All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
