import React, { useState } from 'react';
import { TrendingUp, Percent, DollarSign, Sparkles, X, Calculator, ShieldCheck } from 'lucide-react';
import { PLATFORMS, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface RatesGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_RATES = [
  { category: 'Fashion & Apparel', shopee: 12.0, tiktok: 15.0, lazada: 10.0 },
  { category: 'Beauty & Skincare', shopee: 10.5, tiktok: 18.0, lazada: 9.5 },
  { category: 'Electronics & Gadgets', shopee: 5.0, tiktok: 7.0, lazada: 4.5 },
  { category: 'Home & Living', shopee: 8.5, tiktok: 11.0, lazada: 8.0 },
  { category: 'Mother & Baby', shopee: 9.0, tiktok: 12.0, lazada: 8.5 },
  { category: 'FMCG & Groceries', shopee: 7.0, tiktok: 9.0, lazada: 6.0 },
];

export const RatesGuide: React.FC<RatesGuideProps> = ({ isOpen, onClose }) => {
  const [calcPrice, setCalcPrice] = useState<number>(50);
  const [calcPlatform, setCalcPlatform] = useState<'shopee' | 'tiktok' | 'lazada'>('shopee');
  const [calcCategoryIdx, setCalcCategoryIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentCat = CATEGORY_RATES[calcCategoryIdx];
  const rate = currentCat[calcPlatform];
  const estEarnings = (calcPrice * rate) / 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Affiliate Commission & Cashback Tiers
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Estimated average rates for Shopee, TikTok Shop, and Lazada (2026 Tiers)
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

          {/* Interactive Calculator Widget */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span>Interactive Cashback Simulator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Product Price */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Price ($)
                </label>
                <input
                  type="number"
                  min={1}
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value) || 0)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Platform
                </label>
                <select
                  value={calcPlatform}
                  onChange={(e) => setCalcPlatform(e.target.value as any)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="shopee">Shopee</option>
                  <option value="tiktok">TikTok Shop</option>
                  <option value="lazada">Lazada</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={calcCategoryIdx}
                  onChange={(e) => setCalcCategoryIdx(Number(e.target.value))}
                  className="w-full py-1.5 px-3 rounded-lg text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
                >
                  {CATEGORY_RATES.map((c, i) => (
                    <option key={i} value={i}>{c.category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Output */}
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg flex items-center justify-between border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Estimated Bonus Earnings:
              </span>
              <div className="text-right">
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {formatCurrency(estEarnings)}
                </span>
                <span className="text-xs text-zinc-400 block font-mono">
                  ({rate}% commission rate)
                </span>
              </div>
            </div>
          </div>

          {/* Category Rates Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Category Commission Rate Breakdown
            </h4>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-orange-600 dark:text-orange-400">Shopee</th>
                    <th className="p-2.5 text-teal-600 dark:text-teal-400">TikTok Shop</th>
                    <th className="p-2.5 text-blue-600 dark:text-blue-400">Lazada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-mono">
                  {CATEGORY_RATES.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-2.5 font-sans font-medium">{row.category}</td>
                      <td className="p-2.5 text-orange-600 dark:text-orange-400 font-semibold">{row.shopee}%</td>
                      <td className="p-2.5 text-teal-600 dark:text-teal-400 font-semibold">{row.tiktok}%</td>
                      <td className="p-2.5 text-blue-600 dark:text-blue-400 font-semibold">{row.lazada}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 border border-zinc-200 dark:border-zinc-800">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Disclaimer:
            </p>
            <p>
              Rates shown are standardized benchmarks for affiliate creators and cashback portals. Final payouts depend on seller sub-campaigns and platform terms.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
