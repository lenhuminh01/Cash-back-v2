import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  CheckCircle2,
  FileText,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { ConvertedLink } from '../types';
import { PLATFORMS, copyToClipboard } from '../lib/utils';
import { motion } from 'motion/react';

interface ConversionResultProps {
  link: ConvertedLink;
  onOpenQrModal: (link: ConvertedLink) => void;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({ link, onOpenQrModal }) => {
  const [copiedType, setCopiedType] = useState<'short' | 'raw' | 'snippet' | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'standard' | 'social'>('standard');

  const platformInfo = PLATFORMS[link.platform];

  const handleCopy = async (text: string, type: 'short' | 'raw' | 'snippet') => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const getSnippet = () => {
    if (activeSnippetTab === 'social') {
      return `Xem sản phẩm trên ${platformInfo.name}: ${link.shortUrl} #${platformInfo.name.replace(/\s+/g, '')}`;
    }
    return `🛍️ ${link.title || 'Sản phẩm'}\n🔗 Link: ${link.shortUrl}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-5 transition-all"
    >
      {/* 1. TOP SECTION: Action Buttons (Mở trực tiếp, Mã QR Code) */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={link.normalizedUrl || link.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Mở Trực Tiếp ↗</span>
        </a>

        <button
          onClick={() => onOpenQrModal(link)}
          className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5 text-blue-500" />
          <span>Mã QR Code</span>
        </button>
      </div>

      {/* Estimated Cashback Card */}
      {link.estimatedCashback && link.estimatedCashback > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                Hoàn tiền dự kiến
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
              </span>
              <p className="font-extrabold text-sm text-zinc-900 dark:text-white">
                ~{link.estimatedCashback.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-zinc-500 dark:text-zinc-400 max-w-[140px] hidden sm:block">
            Đã tính trừ 10% thuế TNCN tại nguồn & bảo hộ rủi ro.
          </div>
        </div>
      )}

      {/* 2. TOP SECTION: Text Snippet Generator (2 Options: Tiêu chuẩn & MXH) */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Mẫu Văn Bản Chia Sẻ</span>
          </div>
          <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setActiveSnippetTab('standard')}
              className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                activeSnippetTab === 'standard'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Tiêu chuẩn
            </button>
            <button
              onClick={() => setActiveSnippetTab('social')}
              className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                activeSnippetTab === 'social'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              MXH
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            readOnly
            rows={3}
            value={getSnippet()}
            className="w-full p-2.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none"
          />
          <button
            onClick={() => handleCopy(getSnippet(), 'snippet')}
            className="absolute right-2 bottom-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
          >
            {copiedType === 'snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedType === 'snippet' ? 'Đã copy' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Success Banner & Links */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
        {/* Success Header & Platform Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                Tạo Link Thành Công
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Đã làm sạch tracking
                </span>
              </h3>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs ${platformInfo.bgLight} ${platformInfo.bgDark} ${platformInfo.textLight} ${platformInfo.textDark} border ${platformInfo.borderLight} ${platformInfo.borderDark}`}>
            <span>{platformInfo.name}</span>
          </div>
        </div>

        {/* Link Output Cards */}
        <div className="space-y-3">
          {/* Short Link */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Short Link Rút Gọn
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={link.shortUrl}
                className="flex-1 py-2.5 px-3 rounded-lg text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-blue-600 dark:text-blue-400 select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy(link.shortUrl, 'short')}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copiedType === 'short'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                {copiedType === 'short' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã copy!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Short</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Full Clean URL */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Đường Link Chuẩn (Đã xoá tham số rác)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={link.normalizedUrl}
                className="flex-1 py-2 px-3 rounded-lg text-[11px] font-mono bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 select-all focus:outline-none truncate"
              />
              <button
                onClick={() => handleCopy(link.normalizedUrl, 'raw')}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
