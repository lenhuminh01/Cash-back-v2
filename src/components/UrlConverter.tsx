import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Flame
} from 'lucide-react';
import { PlatformType, ConvertedLink } from '../types';
import { detectPlatform, isValidUrl, PLATFORMS, requestAccessTradeConversion, BEST_SELLERS } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface UrlConverterProps {
  onConvert: (link: ConvertedLink) => void;
  activePlatformFilter?: PlatformType | 'all';
}

export const UrlConverter: React.FC<UrlConverterProps> = ({ onConvert }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformType>('unknown');
  const [isConverting, setIsConverting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto detect platform when URL changes
  useEffect(() => {
    if (inputUrl.trim()) {
      const platform = detectPlatform(inputUrl);
      setDetectedPlatform(platform);
      setErrorMsg(null);
    } else {
      setDetectedPlatform('unknown');
      setErrorMsg(null);
    }
  }, [inputUrl]);

  const processUrl = async (urlToProcess: string) => {
    const clean = urlToProcess.trim();
    if (!clean) {
      setErrorMsg('Vui lòng dán hoặc nhập đường link sản phẩm');
      return;
    }

    if (!isValidUrl(clean)) {
      setErrorMsg('Vui lòng nhập đường link hợp lệ');
      return;
    }

    setIsConverting(true);

    try {
      // Call server AccessTrade API to generate real tracking URL
      const link = await requestAccessTradeConversion(clean);
      onConvert(link);
      setIsConverting(false);

      // Open the REAL AccessTrade tracking link (shorten.asia or go.isclix.com) to log click in AccessTrade report
      const targetUrl = link.shortUrl || link.affiliateUrl || clean;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setIsConverting(false);
      setErrorMsg(err.message || 'Không thể tạo link AccessTrade. Vui lòng thử lại.');
    }
  };

  const handleAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    let targetUrl = inputUrl.trim();

    // If input is empty, attempt to read from clipboard automatically
    if (!targetUrl && navigator.clipboard && navigator.clipboard.readText) {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          targetUrl = text.trim();
          setInputUrl(targetUrl);
        }
      } catch {
        setErrorMsg('Vui lòng dán trực tiếp đường link vào ô bên dưới.');
        return;
      }
    }

    processUrl(targetUrl);
  };

  const platformInfo = PLATFORMS[detectedPlatform];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 transition-all">
      {/* Main Input Form */}
      <form onSubmit={handleAction} className="space-y-4">
        <div className="relative">
          {/* Label & Platform Badge */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="url-input" className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Dán đường link
            </label>
            <AnimatePresence mode="wait">
              {detectedPlatform !== 'unknown' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${platformInfo.bgLight} ${platformInfo.bgDark} ${platformInfo.textLight} ${platformInfo.textDark} border ${platformInfo.borderLight} ${platformInfo.borderDark}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {platformInfo.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Box with "Tạo link" Button inside right side */}
          <div className="relative flex items-center">
            <input
              id="url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Dán link Shopee, TikTok Shop hoặc Lazada..."
              className="w-full py-3.5 pl-4 pr-28 sm:pr-32 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Xoá"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Action button inside input box labeled simply 'Tạo link' */}
              <button
                type="submit"
                disabled={isConverting}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-75"
                title="Tạo link và nhảy sang trang sản phẩm"
              >
                {isConverting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                )}
                <span>{isConverting ? 'Đang tạo...' : 'Tạo link'}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Best Sellers Section */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            Bán chạy:
          </span>
          {BEST_SELLERS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(item.url);
                setErrorMsg(null);
                processUrl(item.url);
              }}
              className="text-xs font-semibold px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer flex items-center gap-1"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
