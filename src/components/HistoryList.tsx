import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode
} from 'lucide-react';
import { ConvertedLink, PlatformType } from '../types';
import { PLATFORMS, copyToClipboard } from '../lib/utils';
import { motion } from 'motion/react';

interface HistoryListProps {
  history: ConvertedLink[];
  onClearHistory: () => void;
  onDeleteLink: (id: string) => void;
  onOpenQrModal: (link: ConvertedLink) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onClearHistory,
  onDeleteLink,
  onOpenQrModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<PlatformType | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const handleCopyShort = async (id: string, url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportCsv = () => {
    if (history.length === 0) return;
    const headers = ['Platform', 'Title', 'Original URL', 'Short Link', 'Normalized URL', 'Date'];
    const rows = history.map((h) => [
      PLATFORMS[h.platform].name,
      `"${(h.title || 'Product').replace(/"/g, '""')}"`,
      `"${h.originalUrl}"`,
      `"${h.shortUrl}"`,
      `"${h.normalizedUrl}"`,
      new Date(h.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `link_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4 transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              Lịch Sử Rút Gọn Link
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                {history.length} Đã lưu
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Lưu trữ trực tiếp trong trình duyệt của bạn
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xuất CSV</span>
              </button>

              <button
                onClick={onClearHistory}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xoá tất cả</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm lịch sử theo tên, URL..."
              className="w-full py-1.5 pl-8 pr-3 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
            />
          </div>

          {/* Platform Filters */}
          <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterPlatform === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterPlatform('shopee')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterPlatform === 'shopee'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
              }`}
            >
              Shopee
            </button>
            <button
              onClick={() => setFilterPlatform('tiktok')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterPlatform === 'tiktok'
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
              }`}
            >
              TikTok
            </button>
            <button
              onClick={() => setFilterPlatform('lazada')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterPlatform === 'lazada'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}
            >
              Lazada
            </button>
          </div>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
            <History className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs">Chưa có đường link nào được lưu.</p>
            <p className="text-[11px] text-zinc-400">Dán bất kỳ đường link Shopee, TikTok Shop hoặc Lazada ở trên để bắt đầu!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
            Không tìm thấy kết quả phù hợp.
          </div>
        ) : (
          filtered.map((item) => {
            const pInfo = PLATFORMS[item.platform];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Product Title & Info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${pInfo.bgLight} ${pInfo.bgDark} ${pInfo.textLight} ${pInfo.textDark}`}>
                      {pInfo.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-medium text-xs text-zinc-900 dark:text-white truncate">
                    {item.title || item.originalUrl}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{item.shortUrl}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleCopyShort(item.id, item.shortUrl)}
                    className="p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-2xs cursor-pointer"
                    title="Copy Short Link"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onOpenQrModal(item)}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                    title="QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={item.normalizedUrl || item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Mở Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onDeleteLink(item.id)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Xoá mục này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
