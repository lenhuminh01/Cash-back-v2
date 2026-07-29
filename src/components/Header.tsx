import React from 'react';
import { Sun, Moon, Monitor, Link2, Wallet } from 'lucide-react';
import { ThemeMode, UserWallet } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  convertedCount: number;
  wallet: UserWallet;
  onOpenWalletModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, wallet, onOpenWalletModal }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white">
                Cashback <span className="text-blue-600 dark:text-blue-500">Link v2</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Shopee • TikTok Shop • Lazada
            </p>
          </div>
        </div>

        {/* Right Actions: Wallet & Theme Selector */}
        <div className="flex items-center gap-2">
          {/* Wallet Button */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
            title="Xem ví hoàn tiền"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ví: {wallet.availableBalance.toLocaleString('vi-VN')} đ</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-amber-500 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              title="Giao diện sáng"
              aria-label="Light mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-zinc-800 text-blue-400 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              title="Giao diện tối"
              aria-label="Dark mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              title="Hệ thống"
              aria-label="System theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
