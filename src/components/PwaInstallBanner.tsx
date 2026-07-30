import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIos(ios);

    // Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    }
  };

  if (isInstalled || isDismissed) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs px-4 py-2.5 shadow-md flex items-center justify-between gap-3 relative z-30"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-white/20 shrink-0">
            <Smartphone className="w-4 h-4 text-blue-100" />
          </div>
          <div className="truncate">
            <span className="font-bold">Cài đặt App Cashback Link</span>
            <span className="hidden sm:inline opacity-90 ml-1.5">— Thêm vào Màn hình chính để dùng như ứng dụng gốc!</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 rounded-lg bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            {isIos ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isIos ? 'Hướng dẫn cài iOS' : 'Cài App ngay'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Install Instruction Modal Banner */}
        {showIosGuide && (
          <div className="absolute top-full left-0 right-0 p-3 bg-zinc-900 text-white border-t border-zinc-800 shadow-xl space-y-1 text-center">
            <p className="font-semibold text-[11px]">
              Để thêm vào màn hình chính iPhone/iPad:
            </p>
            <p className="text-[11px] text-zinc-300">
              Bấm nút <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> <strong>Chia sẻ</strong> ở thanh dưới Safari ➔ Chọn <strong>"Thêm vào Màn hình chính"</strong> (Add to Home Screen).
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
