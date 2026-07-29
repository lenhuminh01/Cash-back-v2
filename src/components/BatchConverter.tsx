import React, { useState } from 'react';
import { Layers, Copy, Check, Zap } from 'lucide-react';
import { ConvertedLink } from '../types';
import { createCleanShortLink, PLATFORMS, copyToClipboard } from '../lib/utils';
import { motion } from 'motion/react';

interface BatchConverterProps {
  onAddBatchToHistory: (links: ConvertedLink[]) => void;
}

export const BatchConverter: React.FC<BatchConverterProps> = ({ onAddBatchToHistory }) => {
  const [rawText, setRawText] = useState('');
  const [results, setResults] = useState<ConvertedLink[]>([]);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessBatch = () => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const converted = lines.map((l) => createCleanShortLink(l));
      setResults(converted);
      onAddBatchToHistory(converted);
      setIsProcessing(false);
    }, 200);
  };

  const handleCopyAll = async () => {
    if (results.length === 0) return;
    const allShorts = results.map((r) => r.shortUrl).join('\n');
    const success = await copyToClipboard(allShorts);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4 transition-all">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            Rút Gọn Link Hàng Loạt
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
              Bulk Mode
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Dán nhiều đường link sản phẩm Shopee, TikTok Shop hoặc Lazada (mỗi link 1 dòng) để tạo hàng loạt.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Text Area */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Danh sách đường link (Mỗi link một dòng)
          </label>
          <textarea
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`https://shopee.vn/product/123/456\nhttps://vt.tiktok.com/ZS2x9K8/\nhttps://www.lazada.vn/products/i9082.html`}
            className="w-full p-3 rounded-xl text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
          />
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcessBatch}
          disabled={isProcessing || !rawText.trim()}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
        >
          {isProcessing ? (
            <span>Đang rút gọn hàng loạt...</span>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Rút Gọn Tất Cả Link Trong Danh Sách</span>
            </>
          )}
        </button>
      </div>

      {/* Batch Results Output */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white">
              Kết quả rút gọn ({results.length} links)
            </h4>
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã copy tất cả!' : 'Copy Tất Cả Short Links'}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((res, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs font-mono flex items-center justify-between gap-2"
              >
                <div className="truncate flex-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">
                    [{PLATFORMS[res.platform].name}]
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">{res.shortUrl}</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                  Xong
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
