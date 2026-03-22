import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (don't overwhelm immediately)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('✅ Simpleton PWA: App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Simpleton PWA: User accepted the install prompt');
      } else {
        console.log('⚠️ Simpleton PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('❌ Simpleton PWA: Install failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Don't show again for 24 hours
    localStorage.setItem('simpleton-install-dismissed', Date.now().toString());
  };

  // Don't show if recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('simpleton-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < twentyFourHours) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="bg-gradient-to-br from-blue-600/95 via-blue-700/95 to-blue-800/95 backdrop-blur-[32px] rounded-2xl shadow-[0_20px_40px_-8px_rgba(59,130,246,0.4)] border border-blue-400/30 p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gold via-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🧮</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white" style={{
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>
                  Install <span className="simpleton-brand">Simpleton</span>
                </h3>
                <p className="text-sm text-blue-200">
                  Get the app experience
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="text-blue-200 hover:text-white hover:bg-white/10 w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Install <span className="simpleton-brand">Simpleton</span> as an app for faster access, offline support, and a native experience on your device.
            </p>
            
            <div className="flex items-center space-x-6 text-xs text-blue-200">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4" />
                <span>Native experience</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900 hover:opacity-90 transition-all duration-300 font-semibold shadow-lg"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="border-blue-400/30 text-blue-200 hover:bg-white/10 hover:text-white"
            >
              Later
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}