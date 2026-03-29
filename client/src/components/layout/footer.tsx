import { Link } from "wouter";
import { SimpletonLogo } from "@/components/ui/simpleton-logo";
import { FooterTicker } from "@/components/ticker/footer-ticker";
import { DataTicker } from "@/components/DataTicker";

import { ChevronDown, ChevronUp } from "lucide-react";

interface FooterProps {
  variant?: 'default' | 'compact';
}

export function Footer({ variant = 'default' }: FooterProps) {


  if (variant === 'compact') {
    return (
      <footer className="bg-primary-950 relative">
        {/* Real Data Ticker */}
        <div className="border-b border-white/10">
          <DataTicker />
        </div>
        
        {/* Minimal Footer Content */}
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <SimpletonLogo size="sm" />
                <div className="text-center sm:text-left">
                  <h3 className="sv-brand font-display font-bold text-sm"><span className="simpleton-brand">Simpleton</span>™</h3>
                  <p className="sv-caps text-yellow-400 -mt-1">Precision, Pricing, Simplified</p>
                </div>
              </div>
              <p className="text-yellow-400 text-xs text-center sm:text-right">
                © 2025–2026 <span className="simpleton-brand">Simpleton</span>™. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer relative bg-maven-bg-secondary border-t border-maven-border">
      {/* Real Data Ticker - Show on larger screens */}
      <div className="sticky top-0 z-40 hidden md:block">
        <DataTicker />
      </div>

      <div className="py-2 md:py-3">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Ultra-minimal mobile layout: Just logo + horizontal navigation */}
          <div className="block md:hidden">
            {/* Mobile Header - Just logo and name */}
            <div className="flex items-center justify-center space-x-2 mb-1">
              <SimpletonLogo size="sm" />
              <h3 className="sv-brand font-display font-bold text-sm"><span className="simpleton-brand">Simpleton</span>™</h3>
            </div>
            
            {/* Mobile Navigation - Single horizontal row */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs mb-1">
              <Link href="/database" className="transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>Coins</Link>
              <Link href="/diamonds" className="transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>Diamonds</Link>
              <Link href="/watches" className="transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>Watches</Link>
              <Link href="/about" className="transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>About</Link>
              <Link href="/terms-of-service" className="transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>Terms</Link>
            </div>
            
            {/* Mobile Copyright - Ultra minimal */}
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--primary)' }}>© 2025–2026 <span className="simpleton-brand">Simpleton</span>™</p>
            </div>
          </div>

          {/* Tablet/Desktop layout: Compact single row */}
          <div className="hidden md:flex justify-between items-center text-xs">
            {/* Brand Section */}
            <div className="flex items-center space-x-2">
              <SimpletonLogo size="sm" />
              <div>
                <h3 className="sv-brand font-display font-bold text-sm"><span className="simpleton-brand">Simpleton</span>™</h3>
                <p className="sv-caps text-yellow-400 -mt-1">Precision, Pricing, Simplified</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center space-x-4">
              <Link href="/database" className="text-maven-text-secondary hover:text-maven-blue transition-colors">Coins</Link>
              <Link href="/diamonds" className="text-maven-text-secondary hover:text-maven-blue transition-colors">Diamonds</Link>
              <Link href="/watches" className="text-maven-text-secondary hover:text-maven-blue transition-colors">Watches</Link>
              <Link href="/about" className="text-maven-text-secondary hover:text-maven-blue transition-colors">About</Link>
              <Link href="/terms-of-service" className="text-maven-text-secondary hover:text-maven-blue transition-colors">Terms</Link>
            </div>

            {/* Copyright & Status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400">Live</span>
              </div>
              <p className="text-yellow-400">© 2025–2026 <span className="simpleton-brand">Simpleton</span>™</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}