import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Check, QrCode, Palette, Image as ImageIcon } from 'lucide-react';
import { ConvertedLink } from '../types';
import { PLATFORMS, copyToClipboard } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: ConvertedLink | null;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, link }) => {
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrSize, setQrSize] = useState(240);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !link) return null;

  const platformInfo = PLATFORMS[link.platform];

  const handleDownloadPng = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashbacklink-qr-${link.platform}-${link.id.slice(-5)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(link.shortUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Affiliate QR Code Generator
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {platformInfo.name} • {link.shortUrl}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QR Code Canvas Display Container */}
          <div className="p-6 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/60">
            <div
              ref={canvasRef}
              className="p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeCanvas
                value={link.shortUrl}
                size={qrSize}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
                imageSettings={
                  includeLogo
                    ? {
                        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232563eb"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
                        x: undefined,
                        y: undefined,
                        height: 36,
                        width: 36,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
            <p className="mt-3 text-xs text-center text-zinc-500 dark:text-zinc-400 max-w-xs font-mono truncate">
              {link.shortUrl}
            </p>
          </div>

          {/* QR Code Customization Controls */}
          <div className="p-4 space-y-3 bg-white dark:bg-zinc-900">
            {/* Color Presets */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-blue-500" />
                Color Theme:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setFgColor('#09090b'); setBgColor('#ffffff'); }}
                  className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-300 cursor-pointer"
                  title="Dark / Light"
                />
                <button
                  onClick={() => { setFgColor('#2563eb'); setBgColor('#eff6ff'); }}
                  className="w-5 h-5 rounded-full bg-blue-600 border border-zinc-300 cursor-pointer"
                  title="Electric Blue"
                />
                <button
                  onClick={() => { setFgColor('#ee4d2d'); setBgColor('#fff7ed'); }}
                  className="w-5 h-5 rounded-full bg-orange-600 border border-zinc-300 cursor-pointer"
                  title="Shopee Orange"
                />
                <button
                  onClick={() => { setFgColor('#0d9488'); setBgColor('#f0fdf4'); }}
                  className="w-5 h-5 rounded-full bg-teal-600 border border-zinc-300 cursor-pointer"
                  title="TikTok Teal"
                />
              </div>
            </div>

            {/* Include Logo Toggle */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                Center Icon Badge:
              </span>
              <button
                onClick={() => setIncludeLogo(!includeLogo)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  includeLogo
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                {includeLogo ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Download & Copy Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleCopyUrl}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
