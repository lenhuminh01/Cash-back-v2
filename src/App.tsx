import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlConverter } from './components/UrlConverter';
import { ConversionResult } from './components/ConversionResult';
import { QrCodeModal } from './components/QrCodeModal';
import { WalletModal } from './components/WalletModal';
import { HistoryList } from './components/HistoryList';
import { BatchConverter } from './components/BatchConverter';
import { Footer } from './components/Footer';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { ConvertedLink, ThemeMode, UserWallet, PayoutRequest } from './types';
import { getOrCreateDeviceId, createCleanShortLink } from './lib/utils';
import { triggerTaxAlertEmailIfNeeded } from './lib/taxAlertService';
import { Link2, Layers, History } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'short_link_history_v2';
const LOCAL_STORAGE_THEME_KEY = 'short_link_theme_v2';
const LOCAL_STORAGE_WALLET_KEY = 'short_link_wallet_v2';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    return (saved as ThemeMode) || 'system';
  });

  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history'>('single');
  const [history, setHistory] = useState<ConvertedLink[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wallet, setWallet] = useState<UserWallet>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      deviceId: getOrCreateDeviceId(),
      pendingBalance: 0,
      availableBalance: 0,
      totalEarned: 0,
    };
  });

  const [latestConverted, setLatestConverted] = useState<ConvertedLink | null>(null);
  const [qrModalLink, setQrModalLink] = useState<ConvertedLink | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Sync dark mode class on html tag
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    const root = document.documentElement;

    const applyDark = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'dark') {
      applyDark(true);
    } else if (theme === 'light') {
      applyDark(false);
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyDark(systemDark);
    }
  }, [theme]);

  // Handle Web Share Target URL (When shared directly from Shopee/TikTok/Lazada app)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    if (sharedUrl && sharedUrl.includes('http')) {
      const urlMatch = sharedUrl.match(/https?:\/\/[^\s]+/);
      if (urlMatch && urlMatch[0]) {
        const cleanLink = createCleanShortLink(urlMatch[0]);
        handleNewConversion(cleanLink);
        // Clean URL params after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Sync history & wallet to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(wallet));
    } catch (e) {
      console.error('Failed to save wallet to localStorage', e);
    }

    // Check & trigger tax warning email to lenhuminh01@gmail.com on 50% & 75% milestones
    triggerTaxAlertEmailIfNeeded(wallet.totalEarned);
  }, [wallet]);

  const handleNewConversion = (link: ConvertedLink) => {
    setLatestConverted(link);
    setHistory((prev) => [link, ...prev.filter((item) => item.originalUrl !== link.originalUrl)]);

    // Update estimated pending balance
    if (link.estimatedCashback) {
      setWallet((prev) => ({
        ...prev,
        pendingBalance: prev.pendingBalance + (link.estimatedCashback || 0),
        totalEarned: prev.totalEarned + (link.estimatedCashback || 0),
      }));
    }
  };

  const handleAddBatchToHistory = (batch: ConvertedLink[]) => {
    setHistory((prev) => [...batch, ...prev]);
    const addedCashback = batch.reduce((sum, item) => sum + (item.estimatedCashback || 0), 0);
    if (addedCashback > 0) {
      setWallet((prev) => ({
        ...prev,
        pendingBalance: prev.pendingBalance + addedCashback,
        totalEarned: prev.totalEarned + addedCashback,
      }));
    }
  };

  const handleDeleteHistoryLink = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (latestConverted?.id === id) {
      setLatestConverted(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setLatestConverted(null);
  };

  const handleOpenQrModal = (link: ConvertedLink) => {
    setQrModalLink(link);
    setIsQrModalOpen(true);
  };

  const handleRequestPayout = (req: Omit<PayoutRequest, 'id' | 'createdAt' | 'status'>) => {
    setWallet((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - req.amount),
      bankName: req.bankName,
      accountNumber: req.accountNumber,
      accountName: req.accountName,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors font-sans antialiased relative overflow-x-hidden">
      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Background Glow Elements */}
      <div className="fixed top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-500 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-500 rounded-full blur-[140px]"></div>
      </div>

      {/* Header Bar */}
      <Header
        theme={theme}
        setTheme={setTheme}
        convertedCount={history.length}
        wallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Subtitle */}
        <div className="text-center max-w-xl mx-auto mb-2">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Dán đường link Shopee, TikTok Shop hoặc Lazada để làm sạch và tích luỹ hoàn tiền mua sắm.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-white dark:bg-zinc-900/90 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Dán Link</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Hàng Loạt</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch Sử ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Single URL Converter */}
        {activeTab === 'single' && (
          <div className="space-y-6">
            <UrlConverter onConvert={handleNewConversion} />

            {/* Converted Result Display */}
            {latestConverted && (
              <ConversionResult
                link={latestConverted}
                onOpenQrModal={handleOpenQrModal}
              />
            )}

            {/* Quick History Preview */}
            {history.length > 0 && !latestConverted && (
              <HistoryList
                history={history.slice(0, 3)}
                onClearHistory={handleClearHistory}
                onDeleteLink={handleDeleteHistoryLink}
                onOpenQrModal={handleOpenQrModal}
              />
            )}
          </div>
        )}

        {/* Tab 2: Batch / Bulk Converter */}
        {activeTab === 'batch' && (
          <BatchConverter onAddBatchToHistory={handleAddBatchToHistory} />
        )}

        {/* Tab 3: History List */}
        {activeTab === 'history' && (
          <HistoryList
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteLink={handleDeleteHistoryLink}
            onOpenQrModal={handleOpenQrModal}
          />
        )}
      </main>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        link={qrModalLink}
      />

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onRequestPayout={handleRequestPayout}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
