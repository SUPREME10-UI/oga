import { useState, useEffect } from "react";
import { X, Download, Share, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;

  useEffect(() => {
    // Don't show if already installed or dismissed this session
    if (isInStandaloneMode) return;
    const wasDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) return;

    // Android: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay so the page loads first
      setTimeout(() => setShowAndroidBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show manual instructions after delay
    if (isIOS) {
      setTimeout(() => setShowIOSModal(true), 4000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInStandaloneMode, isIOS]);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroidBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowAndroidBanner(false);
    setShowIOSModal(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (dismissed || isInStandaloneMode) return null;

  // ─── Android Install Banner ─────────────────────────────────────────────
  if (showAndroidBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom">
        <div
          className="rounded-2xl shadow-2xl border border-amber-200/20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3B1F0A 0%, #5C2E0A 100%)" }}
        >
          <div className="flex items-center gap-3 p-4">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448971800/WP54uqojT2hdzD6eefaKhT/artisan-icon-192_dc8fb7ba.png"
              alt="ArtisanHub"
              className="w-14 h-14 rounded-xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-100 text-sm">Install ArtisanHub</p>
              <p className="text-amber-300/80 text-xs mt-0.5 leading-tight">
                Add to your home screen for quick access to local artisans
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-amber-300/60 hover:text-amber-300 p-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 border-amber-700 text-amber-300 hover:bg-amber-900/30"
            >
              Not now
            </Button>
            <Button
              size="sm"
              onClick={handleAndroidInstall}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              Install App
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── iOS Install Instructions Modal ────────────────────────────────────
  if (showIOSModal && isIOS) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        />
        {/* Modal */}
        <div
          className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3B1F0A 0%, #5C2E0A 100%)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448971800/WP54uqojT2hdzD6eefaKhT/artisan-icon-192_dc8fb7ba.png"
                alt="ArtisanHub"
                className="w-12 h-12 rounded-xl"
              />
              <div>
                <p className="font-bold text-amber-100">Install ArtisanHub</p>
                <p className="text-amber-300/70 text-xs">Add to iPhone Home Screen</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-amber-300/60 hover:text-amber-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="px-5 pb-5 space-y-4">
            <p className="text-amber-200/80 text-sm">
              Install ArtisanHub on your iPhone in 3 easy steps:
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-amber-100 text-sm font-medium">Tap the Share button</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Share className="w-4 h-4 text-blue-400" />
                    <span className="text-amber-300/70 text-xs">
                      Tap the Share icon at the bottom of Safari
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-amber-100 text-sm font-medium">Add to Home Screen</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300/70 text-xs">
                      Scroll down and tap "Add to Home Screen"
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-amber-100 text-sm font-medium">Tap "Add"</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Smartphone className="w-4 h-4 text-green-400" />
                    <span className="text-amber-300/70 text-xs">
                      ArtisanHub will appear on your home screen
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-xl"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
