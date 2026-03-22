import { Link, useLocation } from "wouter";
import { SimpletonLogo } from "@/components/ui/simpleton-logo";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  MessageCircle,
  Settings,
  X,
  ChevronRight,
  Wrench,
  BookOpen,
  Info,
  Activity,
  LogIn,
  LogOut,
  User,
  Shield,
  FileText,
  Lock,
  AlertTriangle,
  BarChart3,
  Database,
  Zap,
  TrendingUp,
  Sparkles,
  Calculator,
  Diamond,
  Watch,
  Coins,
  UserCircle,
  Crown,
  Mail,
  Star,
  Gem,
  Brain,
  BarChart2,
  DollarSign,
  Heart,
  ExternalLink,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onAIToggle?: () => void;
}

export function Navigation(
  { onAIToggle }: NavigationProps = { onAIToggle: undefined },
) {
  const [location] = useLocation();
  const { prices, isLoading, lastUpdated } = useLivePricing();
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);

  const [isSimpleMode, setIsSimpleMode] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Smart menu sections state
  const [expandedSections, setExpandedSections] = useState({
    tools: false,
    business: false,
    learn: false,
    more: false,
  });

  const isActive = (path: string) => location === path;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] navigation" style={{ backgroundColor: 'var(--background)', backdropFilter: 'blur(8px)', opacity: '0.95' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex flex-col items-start">
                <div className="flex items-center space-x-2">
                  <SimpletonLogo className="w-8 h-8" />
                  <span className="sv-brand text-xl">
                    <span className="simpleton-brand">Simpleton</span>™
                  </span>
                </div>
                <span className="sv-caps ml-10" style={{ color: 'var(--primary)' }}>
                  Precision Pricing, Simplified
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Your Exact Specification */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <button className="font-medium flex items-center transition-colors hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                    <span><span className="simpleton-brand">Simpleton</span> Mode</span>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110] dropdown" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--primary)', border: '1px solid' }}>
                    <div className="p-2 space-y-1">
                      <Link
                        href="/simpleton-mode"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <Calculator className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        <span className="font-medium">Precious Metals Calculator</span>
                      </Link>
                      <Link
                        href="/diamond-calculator"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <Diamond className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        <span className="font-medium">Diamond Calculator</span>
                      </Link>
                      <Link
                        href="/coin-calculator"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <Coins className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        <span className="font-medium">Coin Calculator</span>
                      </Link>
                      <Link
                        href="/price-board"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        <span className="font-medium">Live Price Board</span>
                      </Link>
                      <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                      <Link
                        href="/jewelry-appraisal"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        <span className="font-medium" style={{ color: 'var(--primary)' }}>Professional Appraisal</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI + Dropdown */}
              <div className="relative group">
                <button className="font-medium flex items-center transition-colors hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <span><span className="simpleton-brand">Simpleton</span> +</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110] dropdown" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--primary)', border: '1px solid' }}>
                  <div className="p-2 space-y-1">
                    <Link
                      href="/ai-chat"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <MessageCircle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">Simplicity Chat</span>
                    </Link>
                    <Link
                      href="/ai-price-advisor"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Diamond className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">SimpleDocs +</span>
                    </Link>
                    <Link
                      href="/markets"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium"><span className="simpleton-brand">Simpleton</span> Markets</span>
                    </Link>
                    <Link
                      href="/simpletons-list"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Store className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium"><span className="simpleton-brand">Simpleton's</span> List</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* HIDDEN - Quantum Ticker Dropdown - Uncomment to bring back */}
              {/* <div className="relative group">
                <button className="text-white hover:text-gold transition-colors font-medium flex items-center">
                  <span>Quantum Ticker</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110]" style={{ backgroundColor: '#1f2937', borderColor: '#4b5563' }}>
                  <div className="p-2 space-y-1">
                    <Link
                      href="/quantum-ticker"
                      className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors block"
                    >
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-white">Quantum Ticker 2055, Precious Metals</span>
                    </Link>
                    <Link
                      href="/quantum-ticker-2056"
                      className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors block"
                    >
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-white">Quantum Ticker 2056, Finance</span>
                    </Link>
                    <Link
                      href="/quantum-ticker-2057"
                      className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors block"
                    >
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-white">Quantum Ticker 2057, AI Intelligence</span>
                    </Link>
                  </div>
                </div>
              </div> */}

              {/* Simpleducation Center Dropdown */}
              <div className="relative group">
                <button className="font-medium flex items-center transition-colors hover:opacity-80" style={{ color: 'var(--foreground)' }}>
                  <span>Simpleducation Center</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110] dropdown" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--primary)', border: '1px solid' }}>
                  <div className="p-2 space-y-1">
                    <Link
                      href="/watches"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Watch className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">Rolex / The Archive</span>
                    </Link>
                    <Link
                      href="/database"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Coins className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">Coin Database</span>
                    </Link>
                    <Link
                      href="/diamonds"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Diamond className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">Diamond Database</span>
                    </Link>
                    <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                    <Link
                      href="/user-guide"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors block hover:opacity-80"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <BookOpen className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span className="font-medium">User Guide & PDF</span>
                    </Link>
                  </div>
                </div>
              </div>


            </div>

            {/* Live Pricing */}
            {prices && !isLoading && (
              <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title={`Last updated: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}`}></div>
                  <span className="sv-caps text-white">AU</span>
                  <span className="sv-ticker text-white font-bold text-sm">
                    ${prices.gold.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="sv-caps text-white">AG</span>
                  <span className="sv-ticker text-white font-bold text-sm">
                    ${prices.silver.toFixed(2)}
                  </span>
                </div>
                <span className="text-xs text-white/60 ml-2" title={`Updates every 5 seconds`}>●LIVE</span>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              
              {!isAuthenticated && (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-gold flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Button>
                </Link>
              )}

              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-gold"
                    >
                      <div className="flex items-center space-x-2">
                        {user?.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center text-xs text-white">
                            {user?.firstName?.[0] ||
                              user?.email?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="hidden lg:inline">
                          {user?.firstName || user?.email?.split("@")[0]}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/subscription"
                        className="flex items-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Subscription</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/portfolio"
                        className="flex items-center space-x-2"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Portfolio</span>
                      </Link>
                    </DropdownMenuItem>
                    {(user?.id === 1 || (user as any)?.role === 'admin') && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin-dashboard"
                            className="flex items-center space-x-2"
                          >
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span>Owner Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/email-command-center"
                            className="flex items-center space-x-2"
                          >
                            <Mail className="w-4 h-4 text-amber-400" />
                            <span><span className="simpleton-brand">Simpleton</span> Email Center</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/gmail-organizer"
                        className="flex items-center space-x-2"
                      >
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span>Simplicity Mail Organizer</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Simpleton Mode - visible on mobile */}
              <Link
                href="/simpleton-mode"
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={{ background: 'var(--primary)', color: 'var(--background)' }}
              >
                <Zap className="w-3.5 h-3.5" />
                <span><span className="simpleton-brand">Simpleton</span> Mode</span>
              </Link>

              {/* Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-gold transition-colors duration-200 text-3xl font-bold"
                aria-label="Toggle menu"
              >
                S
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Rendered outside nav to prevent clipping */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:bottom-0 sm:w-[85vw] sm:max-w-[420px] z-[201]"
              >
                <div className="relative h-full shadow-2xl overflow-y-auto" style={{ background: 'var(--background)', borderLeft: '1px solid var(--primary)' }}>
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 70% 80%, var(--primary) 0%, transparent 50%)' }} />

                  <div className="sticky top-0 z-10 px-6 pt-6 pb-4" style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 hover:rotate-90"
                      style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
                    </button>
                    <div className="flex items-center space-x-3 mb-2">
                      <SimpletonLogo className="w-8 h-8" />
                      <div>
                        <h3 className="text-base font-semibold tracking-wide" style={{ color: 'var(--foreground)' }}>
                          <span className="simpleton-brand">Simpleton</span>™
                        </h3>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--muted-foreground)' }}>
                          Precision Pricing, Simplified
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative px-4 py-5 space-y-2 pb-32">

                    {/* Premium Calculators Section */}
                    <div>
                      <div className="flex items-center space-x-2 px-3 py-2 mb-1">
                        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        <span className="font-semibold text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                          Premium Calculators
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/simpleton-mode"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Calculator className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Precious Metals</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Live spot pricing</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/diamond-calculator"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Gem className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Diamond Pricing</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Simplicity-powered estimates</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/coin-calculator"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Coins className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Coin Calculator</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Junk silver, bullion & vintage</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/price-board"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Live Price Board</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>TV display for counter pricing</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/jewelry-appraisal"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200" style={{ backgroundColor: 'var(--primary)', border: '1px solid var(--primary)' }}>
                            <FileText className="w-4 h-4" style={{ color: 'var(--background)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--primary)' }}>Professional Appraisal</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Certified by GIA Gemologist</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                      </div>
                    </div>

                    <div className="mx-4" style={{ borderBottom: '1px solid var(--border)', opacity: 0.5 }} />

                    {/* AI Intelligence Suite */}
                    <div>
                      <div className="flex items-center space-x-2 px-3 py-2 mb-1">
                        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        <span className="font-semibold text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                          <span className="simpleton-brand">Simpleton</span> Suite
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/ai-chat"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Brain className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Simplicity Chat</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Intelligent conversations</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/ai-price-advisor"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <DollarSign className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>SimpleDocs +</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Instant valuations</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/markets"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}><span className="simpleton-brand">Simpleton</span> Markets</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Intelligence, analysis & live tickers</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/simpletons-list"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Store className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}><span className="simpleton-brand">Simpleton's</span> List</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Vetted dealers & pawn shops</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                      </div>
                    </div>

                    <div className="mx-4" style={{ borderBottom: '1px solid var(--border)', opacity: 0.5 }} />

                    {/* Knowledge Vault */}
                    <div>
                      <div className="flex items-center space-x-2 px-3 py-2 mb-1">
                        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        <span className="font-semibold text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                          Knowledge Vault
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/watches"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Watch className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Rolex / The Archive</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Complete model library</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/database"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Coins className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Coin Database</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>US gold & silver coins</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/diamonds"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Diamond className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Diamond Database</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Specs & live melt values</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                      </div>
                    </div>

                    <div className="mx-4" style={{ borderBottom: '1px solid var(--border)', opacity: 0.5 }} />

                    {/* Membership & Company */}
                    <div>
                      <div className="flex items-center space-x-2 px-3 py-2 mb-1">
                        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        <span className="font-semibold text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                          Membership & Company
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/subscription"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Crown className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Premium Membership</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Unlock full access</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/feedback"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <Heart className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>Share Feedback</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Help us improve</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                        <Link
                          href="/about"
                          className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <UserCircle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm block" style={{ color: 'var(--foreground)' }}>About the Creator</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>The story behind <span className="simpleton-brand">Simpleton</span></span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                        </Link>
                      </div>
                    </div>

                    <div className="mx-4" style={{ borderBottom: '1px solid var(--border)', opacity: 0.5 }} />

                    {/* Legal Footer */}
                    <div className="pt-2 pb-2">
                      <div className="flex items-center justify-center gap-3 py-3">
                        <Link
                          href="/privacy-policy"
                          className="text-[11px] font-medium tracking-wide uppercase transition-colors"
                          style={{ color: 'var(--muted-foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Privacy
                        </Link>
                        <span className="text-[8px]" style={{ color: 'var(--muted-foreground)' }}>|</span>
                        <Link
                          href="/terms-of-service"
                          className="text-[11px] font-medium tracking-wide uppercase transition-colors"
                          style={{ color: 'var(--muted-foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Terms
                        </Link>
                        <span className="text-[8px]" style={{ color: 'var(--muted-foreground)' }}>|</span>
                        <Link
                          href="/legal-disclosure"
                          className="text-[11px] font-medium tracking-wide uppercase transition-colors"
                          style={{ color: 'var(--muted-foreground)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Legal
                        </Link>
                      </div>
                      <p className="text-center text-[10px] tracking-wider" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                        <span className="simpleton-brand">Simpleton</span> Vision™ {new Date().getFullYear()}
                      </p>
                    </div>

                    {/* Authenticated User Section */}
                    {isAuthenticated && (
                      <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex items-center space-x-2 px-3 py-2 mb-1">
                          <div className="w-1 h-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                          <span className="font-semibold text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--primary)' }}>
                            Your Account
                          </span>
                        </div>
                        <div className="mx-4 mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                          <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            {user?.firstName || user?.email?.split("@")[0]}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Member</p>
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            href="/account"
                            className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                            style={{ color: 'var(--foreground)' }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                              <Settings className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>Account Settings</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                          </Link>
                          <Link
                            href="/portfolio"
                            className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                            style={{ color: 'var(--foreground)' }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                              <Activity className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>My Portfolio</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                          </Link>
                          {(user?.id === 1 || (user as any)?.role === 'admin') && (
                            <>
                              <Link
                                href="/admin-dashboard"
                                className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                                style={{ color: 'var(--foreground)' }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--primary)' }}>
                                  <Crown className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-sm" style={{ color: 'var(--primary)' }}>Owner Dashboard</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                              </Link>
                              <Link
                                href="/email-command-center"
                                className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                                style={{ color: 'var(--foreground)' }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--primary)' }}>
                                  <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-sm" style={{ color: 'var(--primary)' }}><span className="simpleton-brand">Simpleton</span> Email Center</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                              </Link>
                              <Link
                                href="/gmail-organizer"
                                className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.97]"
                                style={{ color: 'var(--foreground)' }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--primary)' }}>
                                  <Mail className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-sm text-blue-400">Simplicity Mail Organizer</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 opacity-30" style={{ color: 'var(--foreground)' }} />
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              setIsMenuOpen(false);
                            }}
                            disabled={isLoggingOut}
                            className="group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm w-full text-left active:scale-[0.97]"
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <LogOut className="w-4 h-4" style={{ color: '#ef4444' }} />
                            </div>
                            <span className="font-medium text-sm" style={{ color: '#ef4444' }}>
                              {isLoggingOut ? "Signing out..." : "Sign Out"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
