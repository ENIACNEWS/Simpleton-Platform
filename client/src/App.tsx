import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AIAssistant } from "@/components/ai-assistant";
import { WelcomeNotification } from "@/components/welcome-notification";
import { BrainProvider } from "@/lib/brain-context";
import { BrainPanel } from "@/components/brain/BrainPanel";
import { BrainTrigger } from "@/components/brain/BrainTrigger";
import { BrainAwarenessWatcher } from "@/components/brain/BrainAwarenessWatcher";
import { useAuth } from "@/hooks/use-auth";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/contexts/theme-context";
import { MobileAppShell } from "@/components/mobile/mobile-app-shell";
import { useAppMode } from "@/hooks/use-app-mode";

import Home from "@/pages/home";
import Calculator from "@/pages/calculator";
import Database from "@/pages/database";
import Education from "@/pages/education";
import Tutorials from "@/pages/tutorials";

import Diamonds from "@/pages/diamonds";
import Watches from "@/pages/watches";

import QuantumTickerPage from "@/pages/quantum-ticker";
import TickersPage from "@/pages/tickers";
import SimpletonMarkets from "@/pages/simpleton-markets";
import AIChat from "@/pages/ai-chat";
import AIMarketAnalysis from "@/pages/ai-market-analysis";
import AIPriceAdvisor from "@/pages/ai-price-advisor";
import MarketSignals from "@/pages/market-signals";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import LegalDisclosure from "@/pages/legal-disclosure";
import Feedback from "@/pages/feedback";
import SimpletonMode from "@/pages/simpleton-mode";
import DiamondCalculatorPage from "@/pages/diamond-calculator";
import CoinCalculator from "@/pages/coin-calculator";
import StandalonePreciousMetals from "@/pages/standalone-precious-metals";
import StandaloneDiamondCalculator from "@/pages/standalone-diamond-calculator";
import Account from "@/pages/account";
import UserGuide from "@/pages/user-guide";
import Portfolio from "@/pages/portfolio";
import Subscription from "@/pages/subscription";
import AdminDashboard from "@/pages/admin-dashboard";
import EmailCommandCenter from "@/pages/email-command-center";
import GmailOrganizer from "@/pages/gmail-organizer";
import JewelryAppraisal from "@/pages/jewelry-appraisal";
import SimpletonsList from "@/pages/simpletons-list";
import GhostAdmin from "@/pages/GhostAdmin";
import GhostAdminDashboard from "@/pages/GhostAdminDashboard";
import AppraisalView from "@/pages/appraisal-view";
import WhatIsThisWorth from "@/pages/what-is-this-worth";
import S7Panel from "@/pages/s7-panel";
import PriceBoard from "@/pages/price-board";

function DesktopRouter() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    const highContrast = localStorage.getItem('highContrast');
    if (highContrast === 'true') {
      document.body.classList.add('high-contrast');
    }
    const reduceMotion = localStorage.getItem('reduceMotion');
    if (reduceMotion === 'true') {
      document.body.classList.add('reduce-motion');
    }
  }, []);

  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <WelcomeNotification />
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/calculator" component={Calculator} />
        <Route path="/simpleton-mode" component={SimpletonMode} />
        <Route path="/database" component={Database} />
        <Route path="/diamonds" component={Diamonds} />
        <Route path="/diamond-calculator" component={DiamondCalculatorPage} />
        <Route path="/coin-calculator" component={CoinCalculator} />
        <Route path="/watches" component={Watches} />
        <Route path="/rolex-market-data" component={Watches} />
        <Route path="/quantum-ticker" component={QuantumTickerPage} />
        <Route path="/quantum-ticker-2056" component={QuantumTickerPage} />
        <Route path="/quantum-ticker-2057" component={SimpletonMarkets} />
        <Route path="/tickers" component={TickersPage} />
        <Route path="/markets" component={SimpletonMarkets} />
        <Route path="/ai-chat" component={AIChat} />
        <Route path="/ai-market-analysis" component={AIMarketAnalysis} />
        <Route path="/ai-price-advisor" component={AIPriceAdvisor} />
        <Route path="/market-signals" component={MarketSignals} />
        <Route path="/standalone-precious-metals" component={StandalonePreciousMetals} />
        <Route path="/standalone-diamond-calculator" component={StandaloneDiamondCalculator} />
        <Route path="/education" component={Education} />
        <Route path="/tutorials" component={Tutorials} />
        <Route path="/user-guide" component={UserGuide} />
        <Route path="/about" component={About} />
        <Route path="/login" component={Login} />
        <Route path="/account" component={Account} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/subscription" component={Subscription} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/email-command-center" component={EmailCommandCenter} />
        <Route path="/gmail-organizer" component={GmailOrganizer} />
        <Route path="/jewelry-appraisal" component={JewelryAppraisal} />
        <Route path="/appraisal/:token" component={AppraisalView} />
        <Route path="/what-is-this-worth" component={WhatIsThisWorth} />
        <Route path="/simpletons-list" component={SimpletonsList} />
        <Route path="/ghost-admin" component={GhostAdmin} />
        <Route path="/ghost-admin-dashboard" component={GhostAdminDashboard} />
        <Route path="/s7" component={S7Panel} />
        <Route path="/price-board" component={PriceBoard} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/legal-disclosure" component={LegalDisclosure} />
        <Route path="/feedback" component={Feedback} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function MobileRouter() {
  return (
    <Switch>
      <Route path="/" component={SimpletonMode} />
      <Route path="/simpleton-mode" component={SimpletonMode} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/coin-calculator" component={CoinCalculator} />
      <Route path="/diamond-calculator" component={DiamondCalculatorPage} />
      <Route path="/diamonds" component={Diamonds} />
      <Route path="/database" component={Database} />
      <Route path="/watches" component={Watches} />
      <Route path="/rolex-market-data" component={Watches} />
      <Route path="/markets" component={SimpletonMarkets} />
      <Route path="/market-signals" component={MarketSignals} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/ai-market-analysis" component={AIMarketAnalysis} />
      <Route path="/ai-price-advisor" component={AIPriceAdvisor} />
      <Route path="/jewelry-appraisal" component={JewelryAppraisal} />
      <Route path="/appraisal/:token" component={AppraisalView} />
      <Route path="/what-is-this-worth" component={WhatIsThisWorth} />
      <Route path="/standalone-precious-metals" component={StandalonePreciousMetals} />
      <Route path="/standalone-diamond-calculator" component={StandaloneDiamondCalculator} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/education" component={Education} />
      <Route path="/tutorials" component={Tutorials} />
      <Route path="/user-guide" component={UserGuide} />
      <Route path="/account" component={Account} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/login" component={Login} />
      <Route path="/price-board" component={PriceBoard} />
      <Route path="/simpletons-list" component={SimpletonsList} />
      <Route path="/quantum-ticker" component={QuantumTickerPage} />
      <Route path="/tickers" component={TickersPage} />
      <Route path="/about" component={About} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/legal-disclosure" component={LegalDisclosure} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/ghost-admin" component={GhostAdmin} />
      <Route path="/ghost-admin-dashboard" component={GhostAdminDashboard} />
      <Route path="/s7" component={S7Panel} />
      <Route>{() => <SimpletonMode />}</Route>
    </Switch>
  );
}

function AppContent() {
  const { mode, setMode } = useAppMode();

  if (mode === "mobile") {
    return (
      <MobileAppShell onSwitchToDesktop={() => setMode("desktop")}>
        <MobileRouter />
      </MobileAppShell>
    );
  }

  return <DesktopRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <BrainProvider>
              <Toaster />
              <AppContent />
              <BrainAwarenessWatcher />
              <BrainPanel />
              <BrainTrigger />
            </BrainProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
